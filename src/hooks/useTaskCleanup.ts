import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export const useTaskCleanup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Reset all tasks (delete everything)
  const resetAllTasksMutation = useMutation({
    mutationFn: async (options: { includeHistory?: boolean } = {}) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Delete all tasks
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      // Delete task history if requested
      if (options.includeHistory) {
        const { error: historyError } = await supabase
          .from('task_history')
          .delete()
          .eq('user_id', user.id);

        if (historyError) throw historyError;
      }

      // Delete notification reminders related to tasks
      const { error: remindersError } = await supabase
        .from('notification_reminders')
        .delete()
        .eq('user_id', user.id)
        .not('task_id', 'is', null);

      if (remindersError) throw remindersError;

      return { includeHistory: options.includeHistory };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dades-app'] });
      queryClient.invalidateQueries({ queryKey: ['task-history'] });
      queryClient.invalidateQueries({ queryKey: ['notification-history'] });
      
      if (result.includeHistory) {
        toast.success('Totes les tasques i historial eliminats');
      } else {
        toast.success('Totes les tasques eliminades (historial conservat)');
      }
    },
    onError: (error) => {
      logger.error('useTaskCleanup', 'Error resetting tasks', error);
      toast.error('Error en eliminar les tasques');
    }
  });

  // Delete only completed tasks
  const deleteCompletedTasksMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'completada');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dades-app'] });
      toast.success('Tasques completades eliminades');
    },
    onError: (error) => {
      logger.error('useTaskCleanup', 'Error deleting completed tasks', error);
      toast.error('Error en eliminar les tasques completades');
    }
  });

  // Export task data (for backup before reset)
  const exportTaskData = () => {
    const cachedData = queryClient.getQueryData(['dades-app']) as any;
    if (!cachedData?.tasks) {
      toast.error('No hi ha dades per exportar');
      return;
    }

    const exportData = {
      tasks: cachedData.tasks,
      folders: cachedData.folders,
      exportDate: new Date().toISOString(),
      userId: user?.id
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Còpia de seguretat descarregada');
  };

  return {
    resetAllTasks: resetAllTasksMutation.mutate,
    resettingTasks: resetAllTasksMutation.isPending,
    deleteCompletedTasks: deleteCompletedTasksMutation.mutate,
    deletingCompletedTasks: deleteCompletedTasksMutation.isPending,
    exportTaskData,
  };
};