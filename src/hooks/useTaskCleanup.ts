/**
 * Task Cleanup Hook - Simplified version integrated with useTasksCore
 * Handles task history export and deletion operations
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export const useTaskCleanup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Reset all tasks mutation
  const resetAllTasksMutation = useMutation({
    mutationFn: async (options?: { includeHistory?: boolean }) => {
      if (!user) throw new Error("User not authenticated");

      // Delete tasks
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      // Optionally delete task history
      if (options?.includeHistory) {
        const { error: historyError } = await supabase
          .from('task_history')
          .delete()
          .eq('user_id', user.id);

        if (historyError) throw historyError;
      }

      // Delete related notification reminders
      const { error: remindersError } = await supabase
        .from('notification_reminders')
        .delete()
        .match({ user_id: user.id, notification_type: 'task_reminder' });

      if (remindersError) logger.error('useTaskCleanup', 'Failed to delete reminders', remindersError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-core'] });
      queryClient.invalidateQueries({ queryKey: ['dades-app'] });
      toast.success('Totes les tasques han estat eliminades correctament');
    },
    onError: (error: Error) => {
      logger.error('useTaskCleanup', 'Failed to reset tasks', error);
      toast.error('Error al eliminar les tasques');
    }
  });

  // Delete completed tasks mutation
  const deleteCompletedTasksMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'completada');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-core'] });
      queryClient.invalidateQueries({ queryKey: ['dades-app'] });
      toast.success('Tasques completades eliminades correctament');
    },
    onError: (error: Error) => {
      logger.error('useTaskCleanup', 'Failed to delete completed tasks', error);
      toast.error('Error al eliminar les tasques completades');
    }
  });

  // Export task data
  const exportTaskData = useCallback(async () => {
    try {
      const cachedData = queryClient.getQueryData(['tasks-core', user?.id]) || 
                         queryClient.getQueryData(['dades-app', user?.id]);
      
      if (!cachedData) {
        toast.error('No hi ha dades per exportar');
        return;
      }

      const dataStr = JSON.stringify(cachedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Dades exportades correctament');
    } catch (error) {
      logger.error('useTaskCleanup', 'Failed to export data', error);
      toast.error('Error al exportar les dades');
    }
  }, [queryClient, user]);

  return {
    resetAllTasks: resetAllTasksMutation.mutate,
    deleteCompletedTasks: deleteCompletedTasksMutation.mutate,
    exportTaskData,
    resettingTasks: resetAllTasksMutation.isPending,
    deletingCompletedTasks: deleteCompletedTasksMutation.isPending,
  };
};
