import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';

interface PomodoroSession {
  id: string;
  duration_minutes: number;
  break_duration_minutes: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
  session_type: 'work' | 'break';
  task_id: string;
}

interface PomodoroState {
  isActive: boolean;
  timeLeft: number;
  isBreak: boolean;
  currentSessionId: string | null;
  sessionStartTime: number | null;
}

export const usePomodoroTimer = (taskId: string) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Clau per localStorage específica per cada tasca
  const STORAGE_KEY = `pomodoro_${taskId}`;

  // Guardar estat al localStorage
  const saveState = useCallback((state: Partial<PomodoroState>) => {
    try {
      const currentState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const newState = { ...currentState, ...state, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving pomodoro state:', error);
    }
  }, [STORAGE_KEY]);

  // Carregar estat del localStorage
  const loadState = useCallback((): PomodoroState | null => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const state = JSON.parse(savedState);
        // Verificar que l'estat no sigui massa antic (màxim 2 hores)
        if (state.timestamp && Date.now() - state.timestamp < 2 * 60 * 60 * 1000) {
          return state;
        }
      }
    } catch (error) {
      console.error('Error loading pomodoro state:', error);
    }
    return null;
  }, [STORAGE_KEY]);

  // Esborrar estat del localStorage
  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, [STORAGE_KEY]);

  const fetchSessions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('task_id', taskId)
        .gte('started_at', `${today}T00:00:00Z`)
        .lt('started_at', `${today}T23:59:59Z`)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setSessions((data || []) as PomodoroSession[]);
      
      // Comprovar si hi ha una sessió activa incompleta
      const activeSessions = (data || []).filter((session: any) => 
        !session.is_completed && session.started_at && (session.session_type === 'work' || session.session_type === 'break')
      );
      
      if (activeSessions.length > 0) {
        await recoverActiveSession(activeSessions[0] as PomodoroSession);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'han pogut carregar les sessions"
      });
    } finally {
      setLoading(false);
    }
  };

  // Recuperar sessió activa de la base de dades
  const recoverActiveSession = async (session: PomodoroSession) => {
    try {
      const startTime = new Date(session.started_at).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const totalDuration = session.duration_minutes * 60;
      const remainingTime = Math.max(0, totalDuration - elapsedSeconds);

      if (remainingTime > 0) {
        setCurrentSessionId(session.id);
        setIsBreak(session.session_type === 'break');
        setTimeLeft(remainingTime);
        setIsActive(true);
        
        // Guardar estat recuperat
        saveState({
          isActive: true,
          timeLeft: remainingTime,
          isBreak: session.session_type === 'break',
          currentSessionId: session.id,
          sessionStartTime: startTime
        });

        toast({
          title: "Sessió recuperada!",
          description: `S'ha restaurat la sessió de ${session.session_type === 'work' ? 'treball' : 'descans'}.`
        });
      } else {
        // La sessió hauria d'haver acabat, la completem
        await completeSession(session.id);
      }
    } catch (error) {
      console.error('Error recovering session:', error);
    }
  };

  const createSession = async (sessionType: 'work' | 'break', duration: number) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert({
          task_id: taskId,
          session_type: sessionType,
          duration_minutes: duration,
          break_duration_minutes: breakDuration,
          started_at: now
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSessionId(data.id);
      
      // Guardar estat quan es crea una nova sessió
      saveState({
        isActive: true,
        timeLeft: duration * 60,
        isBreak: sessionType === 'break',
        currentSessionId: data.id,
        sessionStartTime: new Date(now).getTime()
      });

      // Notificar inici de sessió
      notificationService.notifySessionStarted(sessionType);
      
      return data;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut crear la sessió"
      });
    }
  };

  const completeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .update({
          completed_at: new Date().toISOString(),
          is_completed: true
        })
        .eq('id', sessionId);

      if (error) throw error;
      
      // Esborrar estat del localStorage quan es completa
      clearState();
      
      await fetchSessions();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut completar la sessió"
      });
    }
  };

  // Timer logic millorat amb persistència
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          
          // Actualitzar localStorage cada 10 segons
          if (newTime % 10 === 0) {
            saveState({
              isActive: true,
              timeLeft: newTime,
              isBreak,
              currentSessionId,
              sessionStartTime: Date.now() - ((isBreak ? breakDuration : workDuration) * 60 - newTime) * 1000
            });
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Sessió completada
      if (currentSessionId) {
        completeSession(currentSessionId);
      }
      
      // Enviar notificació corresponent
      if (isBreak) {
        notificationService.notifyBreakCompleted();
        setIsBreak(false);
        setTimeLeft(workDuration * 60);
      } else {
        notificationService.notifyWorkCompleted();
        setIsBreak(true);
        setTimeLeft(breakDuration * 60);
      }
      
      setIsActive(false);
      setCurrentSessionId(null);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, isBreak, workDuration, breakDuration, currentSessionId, saveState]);

  // Recuperar estat al carregar
  useEffect(() => {
    const savedState = loadState();
    if (savedState && savedState.currentSessionId) {
      setIsActive(savedState.isActive);
      setTimeLeft(savedState.timeLeft);
      setIsBreak(savedState.isBreak);
      setCurrentSessionId(savedState.currentSessionId);
    }
  }, [loadState]);

  const startTimer = async () => {
    const duration = isBreak ? breakDuration : workDuration;
    const sessionType = isBreak ? 'break' : 'work';
    
    await createSession(sessionType, duration);
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
    // Actualitzar localStorage quan es pausa
    saveState({
      isActive: false,
      timeLeft,
      isBreak,
      currentSessionId,
      sessionStartTime: Date.now() - ((isBreak ? breakDuration : workDuration) * 60 - timeLeft) * 1000
    });
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(workDuration * 60);
    setCurrentSessionId(null);
    
    // Esborrar estat del localStorage
    clearState();
    
    // Si hi ha una sessió activa, marcar-la com a completada
    if (currentSessionId) {
      completeSession(currentSessionId);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const completedSessions = sessions.filter(s => s.is_completed && s.session_type === 'work').length;
  const totalWorkTime = sessions
    .filter(s => s.is_completed && s.session_type === 'work')
    .reduce((total, session) => total + session.duration_minutes, 0);

  useEffect(() => {
    fetchSessions();
  }, [taskId]);

  // Cleanup quan el component es desmunta
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isActive,
    timeLeft,
    isBreak,
    workDuration,
    breakDuration,
    completedSessions,
    totalWorkTime,
    loading,
    formatTime,
    startTimer,
    pauseTimer,
    resetTimer,
    setWorkDuration,
    setBreakDuration,
    refetch: fetchSessions
  };
};