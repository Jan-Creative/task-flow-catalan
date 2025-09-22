import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/lib/toastUtils';

interface PomodoroSession {
  id: string;
  duration_minutes: number;
  break_duration_minutes: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
  session_type: 'work' | 'break' | 'generic';
  task_id?: string;
}

interface PomodoroState {
  isActive: boolean;
  timeLeft: number;
  isBreak: boolean;
  currentTaskId: string | null;
  currentSessionId: string | null;
  workDuration: number;
  breakDuration: number;
  startTime: number | null;
  completedSessions: number;
  totalWorkTime: number;
}

interface PomodoroContextType extends PomodoroState {
  startTimer: (taskId: string) => Promise<void>;
  startGenericTimer: (durationMinutes: number) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  setWorkDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  formatTime: (seconds: number) => string;
  hasActiveTimer: boolean;
  getGenericStats: () => Promise<{ sessionsToday: number; totalMinutesToday: number }>;
  sessionId: string | null;
  taskId: string | null;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

const STORAGE_KEY = 'global_pomodoro_state';

export const PomodoroProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<PomodoroState>({
    isActive: false,
    timeLeft: 25 * 60,
    isBreak: false,
    currentTaskId: null,
    currentSessionId: null,
    workDuration: 25,
    breakDuration: 5,
    startTime: null,
    completedSessions: 0,
    totalWorkTime: 0,
  });

  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Save state to localStorage - CORRECTED: No circular dependency
  const saveState = useCallback((newState: Partial<PomodoroState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      // Save to localStorage after state update
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...updatedState,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error saving pomodoro state:', error);
      }
      return updatedState;
    });
  }, []);

  // Load state from localStorage - SIMPLIFIED
  const loadState = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;
      
      const parsed = JSON.parse(saved);
      const timeDiff = Date.now() - (parsed.timestamp || 0);
      
      // Only recover if less than 2 hours old and is a valid session
      if (timeDiff > 2 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      
      // Skip recovery for temporary sessions
      if (parsed.currentSessionId?.startsWith('temp-')) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      
      // Only recover if we have a valid session ID
      if (!parsed.currentSessionId) return false;
      
      // Recalculate time left if timer was active
      if (parsed.startTime && parsed.isActive) {
        const realElapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
        const totalDuration = parsed.isBreak ? parsed.breakDuration * 60 : parsed.workDuration * 60;
        const newTimeLeft = Math.max(0, totalDuration - realElapsed);
        
        // If time expired, don't recover
        if (newTimeLeft <= 0) {
          localStorage.removeItem(STORAGE_KEY);
          return false;
        }
        
        setState({
          ...parsed,
          timeLeft: newTimeLeft,
          isActive: true
        });
        return true;
      }
      
      // Recover paused state
      setState(parsed);
      return true;
      
    } catch (error) {
      console.error('Error loading pomodoro state:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return false;
  }, []);

  // Clear state
  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(prev => ({
      ...prev,
      isActive: false,
      currentTaskId: null,
      currentSessionId: null,
      startTime: null,
      timeLeft: prev.workDuration * 60
    }));
  }, []);

  // Create session in database
  const createSession = async (taskId: string | null, sessionType: 'work' | 'break' | 'generic', durationMinutes?: number) => {
    try {
      const duration = durationMinutes || (sessionType === 'work' ? state.workDuration : state.breakDuration);
      
      const sessionData: any = {
        session_type: sessionType,
        duration_minutes: duration,
        break_duration_minutes: state.breakDuration,
        started_at: new Date().toISOString()
      };

      // Only add task_id if it's not a generic session
      if (taskId && sessionType !== 'generic') {
        sessionData.task_id = taskId;
      }

      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  // Complete session in database
  const completeSession = async (sessionId: string) => {
    try {
      await supabase
        .from('pomodoro_sessions')
        .update({
          completed_at: new Date().toISOString(),
          is_completed: true
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  // Update statistics for task-based sessions
  const updateStats = useCallback(async (taskId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('task_id', taskId)
        .eq('session_type', 'work')
        .eq('is_completed', true)
        .gte('started_at', `${today}T00:00:00Z`)
        .lt('started_at', `${today}T23:59:59Z`);

      const completed = data?.length || 0;
      const totalTime = data?.reduce((acc, session) => acc + session.duration_minutes, 0) || 0;
      
      setState(prev => ({
        ...prev,
        completedSessions: completed,
        totalWorkTime: totalTime
      }));
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, []);

  // Get statistics for generic sessions
  const getGenericStats = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .is('task_id', null)
        .eq('session_type', 'generic')
        .eq('is_completed', true)
        .gte('started_at', `${today}T00:00:00Z`)
        .lt('started_at', `${today}T23:59:59Z`);

      const sessionsToday = data?.length || 0;
      const totalMinutesToday = data?.reduce((acc, session) => acc + session.duration_minutes, 0) || 0;
      
      return { sessionsToday, totalMinutesToday };
    } catch (error) {
      console.error('Error getting generic stats:', error);
      return { sessionsToday: 0, totalMinutesToday: 0 };
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (state.isActive && state.timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          
          // Auto-save every 10 seconds to reduce localStorage writes
          if (newTimeLeft % 10 === 0) {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify({
                ...prev,
                timeLeft: newTimeLeft,
                timestamp: Date.now()
              }));
            } catch (error) {
              console.error('Error auto-saving state:', error);
            }
          }
          
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.isActive, state.timeLeft]);

  // Handle session completion
  useEffect(() => {
    if (state.timeLeft === 0 && state.isActive && state.currentSessionId) {
      const handleCompletion = async () => {
        try {
          await completeSession(state.currentSessionId!);
          
          if (state.currentTaskId) {
            await updateStats(state.currentTaskId);
          }
          
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(state.isBreak ? 'Descans completat!' : 'Sessió de treball completada!', {
              body: state.isBreak ? 'Hora de tornar al treball' : 'Hora de fer una pausa',
              icon: '/icons/app-icon-192.png'
            });
          }
          
          toast({
            title: state.isBreak ? 'Descans completat!' : 'Sessió completada!',
            description: state.isBreak ? 'Hora de tornar al treball' : 'Hora de fer una pausa'
          });
          
          // Handle completion differently for generic vs task sessions
          if (state.currentTaskId) {
            // Task-based session: switch to break mode
            setState(prev => ({
              ...prev,
              isActive: false,
              isBreak: !prev.isBreak,
              timeLeft: !prev.isBreak ? prev.breakDuration * 60 : prev.workDuration * 60,
              currentSessionId: null
            }));
            await updateStats(state.currentTaskId);
          } else {
            // Generic session: just stop and reset
            setState(prev => ({
              ...prev,
              isActive: false,
              currentSessionId: null,
              timeLeft: prev.workDuration * 60,
              isBreak: false // Reset to work mode for next session
            }));
          }
          
        } catch (error) {
          console.error('Error handling completion:', error);
        }
      };
      
      handleCompletion();
    }
  }, [state.timeLeft, state.isActive, state.currentSessionId, state.isBreak, state.currentTaskId, toast, updateStats]);

  // Cleanup failed sessions
  const cleanupFailedSessions = useCallback(async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      // Mark old uncompleted sessions as failed
      await supabase
        .from('pomodoro_sessions')
        .update({ is_completed: false })
        .is('completed_at', null)
        .lt('started_at', oneDayAgo);
        
      console.log('✅ Cleaned up failed sessions');
    } catch (error) {
      console.error('Error cleaning up failed sessions:', error);
    }
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const recovered = loadState();
    if (!recovered) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      // Cleanup failed sessions on fresh start
      cleanupFailedSessions();
    }
  }, [loadState, cleanupFailedSessions]);

  const startTimer = async (taskId: string) => {
    try {
      console.log('🔄 Starting task-based timer:', { taskId, isBreak: state.isBreak, currentSession: state.currentSessionId });
      
      // Prevent starting if there's already an active timer
      if (state.currentSessionId && state.timeLeft > 0) {
        console.warn('⚠️ Timer already active, cannot start new one');
        toast({
          title: "Timer ja actiu",
          description: "Ja tens un timer en marxa"
        });
        return;
      }
      
      const sessionType = state.isBreak ? 'break' : 'work';
      const session = await createSession(taskId, sessionType);
      const duration = state.isBreak ? state.breakDuration : state.workDuration;
      const now = Date.now();
      
      console.log('✅ Task session created:', { session, duration, sessionType });
      
      saveState({
        isActive: true,
        currentTaskId: taskId,
        currentSessionId: session.id,
        timeLeft: duration * 60,
        startTime: now
      });
      
      if (taskId) {
        await updateStats(taskId);
      }
      
      toast({
        title: state.isBreak ? "Descans iniciat" : "Sessió iniciada",
        description: `${duration} minuts de ${state.isBreak ? 'descans' : 'focus'}`
      });
      
      console.log('✅ Task timer started successfully');
      
    } catch (error) {
      console.error('❌ Error starting task timer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut iniciar el timer"
      });
      throw error;
    }
  };

  const startGenericTimer = async (durationMinutes: number) => {
    try {
      console.log('🔄 Starting generic timer:', { durationMinutes });
      
      // Create session first to avoid temporary IDs
      const session = await createSession(null, 'generic', durationMinutes);
      console.log('✅ Generic session created:', session);
      
      const now = Date.now();
      
      saveState({
        isActive: true,
        currentTaskId: null,
        currentSessionId: session.id,
        timeLeft: durationMinutes * 60,
        startTime: now,
        isBreak: false,
        workDuration: durationMinutes
      });
      
      toast({
        title: "Timer iniciat",
        description: `${durationMinutes} minuts de focus`
      });
      
      console.log('✅ Generic timer started successfully');
      
    } catch (error) {
      console.error('❌ Error starting generic timer:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut iniciar el timer genèric"
      });
      throw error;
    }
  };

  const pauseTimer = () => {
    console.log('⏸️ Pausing timer');
    saveState({ 
      isActive: false,
      // Update startTime to reflect the pause
      startTime: Date.now() - ((state.isBreak ? state.breakDuration : state.workDuration) * 60 - state.timeLeft) * 1000
    });
  };

  const resumeTimer = () => {
    console.log('▶️ Resuming timer');
    if (state.currentSessionId && state.timeLeft > 0) {
      saveState({ 
        isActive: true,
        startTime: Date.now() - ((state.isBreak ? state.breakDuration : state.workDuration) * 60 - state.timeLeft) * 1000
      });
      toast({
        title: "Timer reprès",
        description: "Continuant la sessió"
      });
    }
  };

  const resetTimer = async () => {
    console.log('🔄 Resetting timer');
    if (state.currentSessionId) {
      try {
        // Mark as completed but not successful for tracking
        await supabase
          .from('pomodoro_sessions')
          .update({
            completed_at: new Date().toISOString(),
            is_completed: false // Mark as incomplete/cancelled
          })
          .eq('id', state.currentSessionId);
      } catch (error) {
        console.error('Error updating session on reset:', error);
      }
    }
    clearState();
  };

  const setWorkDuration = (duration: number) => {
    saveState({ 
      workDuration: duration,
      timeLeft: !state.isBreak ? duration * 60 : state.timeLeft
    });
  };

  const setBreakDuration = (duration: number) => {
    saveState({ 
      breakDuration: duration,
      timeLeft: state.isBreak ? duration * 60 : state.timeLeft
    });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const hasActiveTimer = state.currentSessionId !== null && state.timeLeft > 0;

  return (
    <PomodoroContext.Provider value={{
      ...state,
      startTimer,
      startGenericTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      setWorkDuration,
      setBreakDuration,
      formatTime,
      hasActiveTimer,
      getGenericStats,
      sessionId: state.currentSessionId,
      taskId: state.currentTaskId
    }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoroContext = () => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoroContext must be used within a PomodoroProvider');
  }
  return context;
};