import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/lib/toastUtils';
import { useRealtimeSafety } from './useRealtimeSafety';
import type { Subtask } from '@/types';
import { logger } from '@/lib/logger';

export const useTaskSubtasks = (taskId: string) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isRealtimeAvailable, createSafeSubscription } = useRealtimeSafety();

  // Calculate completion stats
  const completedCount = subtasks.filter(subtask => subtask.is_completed).length;
  const progressPercentage = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  // Fetch subtasks
  const fetchSubtasks = async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubtasks((data || []).map(item => ({ ...item, is_completed: item.completed })));
    } catch (error) {
      logger.error('useTaskSubtasks', 'Error fetching subtasks', error);
    } finally {
      setLoading(false);
    }
  };

  // Create subtask
  const createSubtask = async (title: string): Promise<Subtask | null> => {
    if (!taskId || !title.trim()) return null;

    try {
      const { data, error } = await supabase
        .from('task_subtasks')
        .insert({
          task_id: taskId,
          title: title.trim(),
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setSubtasks(prev => [...prev, { ...data, is_completed: data.completed }]);
      
      toast({
        title: "Subtasca creada",
        description: `"${title}" s'ha afegit a la tasca.`,
      });

      return { ...data, is_completed: data.completed };
    } catch (error) {
      logger.error('useTaskSubtasks', 'Error creating subtask', error);
      toast({
        title: "Error",
        description: "No s'ha pogut crear la subtasca.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete subtask
  const deleteSubtask = async (subtaskId: string) => {
    try {
      const { error } = await supabase
        .from('task_subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;

      // Remove from local state
      setSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId));
      
      toast({
        title: "Subtasca eliminada",
        description: "La subtasca s'ha eliminat correctament.",
      });
    } catch (error) {
      logger.error('useTaskSubtasks', 'Error deleting subtask', error);
      toast({
        title: "Error",
        description: "No s'ha pogut eliminar la subtasca.",
        variant: "destructive",
      });
    }
  };

  // Toggle subtask completion
  const toggleSubtask = async (subtaskId: string) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    const newCompletedState = !subtask.is_completed;

    try {
      const { error } = await supabase
        .from('task_subtasks')
        .update({ completed: newCompletedState })
        .eq('id', subtaskId);

      if (error) throw error;

      // Update local state
      setSubtasks(prev => 
        prev.map(s => 
          s.id === subtaskId 
            ? { ...s, is_completed: newCompletedState }
            : s
        )
      );
    } catch (error) {
      logger.error('useTaskSubtasks', 'Error toggling subtask', error);
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la subtasca.",
        variant: "destructive",
      });
    }
  };

  // Load subtasks on mount
  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  // Realtime subscription for subtasks (with safety check)
  useEffect(() => {
    if (!taskId) return;

    if (!isRealtimeAvailable) {
      // Si realtime no està disponible, configurem polling cada 30 segons
      const pollInterval = setInterval(() => {
        fetchSubtasks();
      }, 30000);

      return () => clearInterval(pollInterval);
    }

    // Utilitzem la subscripció segura
    const channel = createSafeSubscription(
      `task-subtasks-${taskId}`,
      { 
        event: '*', 
        schema: 'public', 
        table: 'task_subtasks',
        filter: `task_id=eq.${taskId}`
      },
      () => fetchSubtasks()
    );

    return () => {
      try {
        if (channel) supabase.removeChannel(channel);
      } catch (error) {
        // Silenci per evitar errors en la neteja
      }
    };
  }, [taskId, isRealtimeAvailable, createSafeSubscription]);

  return {
    subtasks,
    loading,
    completedCount,
    progressPercentage,
    createSubtask,
    deleteSubtask,
    toggleSubtask,
    refreshSubtasks: fetchSubtasks
  };
};