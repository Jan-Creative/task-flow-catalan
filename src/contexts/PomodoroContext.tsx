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

  // Save state to localStorage
  const saveState = useCallback((newState: Partial<PomodoroState>) => {
    const updatedState = { ...state, ...newState };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...updatedState,
      timestamp: performance.now()
    }));
    setState(updatedState);
  }, [state]);

  // Load state from localStorage
  const loadState = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const timeDiff = performance.now() - (parsed.timestamp || 0);
        
        // Only recover if less than 2 hours old and has either task or session
        if (timeDiff < 2 * 60 * 60 * 1000 && (parsed.currentTaskId || parsed.currentSessionId)) {
          // Recalculate time left based on real time passed
          if (parsed.startTime && parsed.isActive) {
            const realElapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
            const totalDuration = parsed.isBreak ? parsed.breakDuration * 60 : parsed.workDuration * 60;
            const newTimeLeft = Math.max(0, totalDuration - realElapsed);
            
            setState({
              ...parsed,
              timeLeft: newTimeLeft,
              isActive: newTimeLeft > 0
            });
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error loading pomodoro state:', error);
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
          
          // Auto-save every 5 seconds
          if (newTimeLeft % 5 === 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              ...prev,
              timeLeft: newTimeLeft,
              timestamp: performance.now()
            }));
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
              icon: '/favicon.ico'
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

  // Initialize from localStorage
  useEffect(() => {
    const recovered = loadState();
    if (!recovered) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [loadState]);

  const startTimer = async (taskId: string) => {
    try {
      console.log('🔄 Starting task-based timer:', { taskId, isBreak: state.isBreak });
      
      const sessionType = state.isBreak ? 'break' : 'work';
      const session = await createSession(taskId, sessionType);
      const duration = state.isBreak ? state.breakDuration : state.workDuration;
      const now = Date.now();
      
      console.log('✅ Task session created:', session);
      
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
      
      const now = Date.now();
      const tempSessionId = `temp-${now}`;
      
      // Optimistic update - show timer immediately
      saveState({
        isActive: true,
        currentTaskId: null,
        currentSessionId: tempSessionId,
        timeLeft: durationMinutes * 60,
        startTime: now,
        isBreak: false,
        workDuration: durationMinutes
      });
      
      // Show immediate feedback
      toast({
        title: "Timer iniciat",
        description: `${durationMinutes} minuts de focus`
      });
      
      // Create session in background
      const session = await createSession(null, 'generic', durationMinutes);
      console.log('✅ Generic session created:', session);
      
      // Update with real session ID
      saveState({
        currentSessionId: session.id
      });
      
      console.log('✅ Generic timer state updated successfully');
      
    } catch (error) {
      console.error('❌ Error starting generic timer:', error);
      
      // Rollback optimistic update
      saveState({
        isActive: false,
        currentSessionId: null,
        timeLeft: state.workDuration * 60
      });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut iniciar el timer genèric"
      });
      throw error;
    }
  };

  const pauseTimer = () => {
    saveState({ isActive: false });
  };

  const resetTimer = async () => {
    if (state.currentSessionId) {
      try {
        await completeSession(state.currentSessionId);
      } catch (error) {
        console.error('Error completing session on reset:', error);
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

  const hasActiveTimer = (state.isActive && state.timeLeft > 0) || (state.currentSessionId !== null);

  return (
    <PomodoroContext.Provider value={{
      ...state,
      startTimer,
      startGenericTimer,
      pauseTimer,
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