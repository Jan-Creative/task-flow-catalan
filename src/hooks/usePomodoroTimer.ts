import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PomodoroSession {
  id: string;
  duration_minutes: number;
  break_duration_minutes: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
  session_type: 'work' | 'break';
}

export const usePomodoroTimer = (taskId: string) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const createSession = async (sessionType: 'work' | 'break', duration: number) => {
    try {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert({
          task_id: taskId,
          session_type: sessionType,
          duration_minutes: duration,
          break_duration_minutes: breakDuration,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSessionId(data.id);
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
      await fetchSessions();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut completar la sessió"
      });
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Session completed
      if (currentSessionId) {
        completeSession(currentSessionId);
      }
      
      // Switch between work and break
      if (isBreak) {
        // Break finished, start work
        setIsBreak(false);
        setTimeLeft(workDuration * 60);
        toast({
          title: "Descans completat!",
          description: "És hora de tornar a treballar."
        });
      } else {
        // Work finished, start break
        setIsBreak(true);
        setTimeLeft(breakDuration * 60);
        toast({
          title: "Sessió de treball completada!",
          description: "És hora de fer un descans."
        });
      }
      
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, workDuration, breakDuration, currentSessionId]);

  const startTimer = async () => {
    const duration = isBreak ? breakDuration : workDuration;
    const sessionType = isBreak ? 'break' : 'work';
    
    await createSession(sessionType, duration);
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(workDuration * 60);
    setCurrentSessionId(null);
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