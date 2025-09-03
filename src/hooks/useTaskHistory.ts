import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { Task } from '@/types/task';

export interface TaskHistoryItem {
  id: string;
  user_id: string;
  original_task_id: string;
  title: string;
  description?: string;
  folder_name?: string;
  folder_color?: string;
  priority: string;
  completed_at: string;
  archived_at: string;
  original_created_at: string;
  metadata: any;
}

export const useTaskHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch task history
  const {
    data: taskHistory = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['task-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('task_history')
        .select('*')
        .eq('user_id', user.id)
        .order('archived_at', { ascending: false });

      if (error) {
        console.error('Error fetching task history:', error);
        throw error;
      }

      return data as TaskHistoryItem[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Archive completed tasks
  const archiveTasksMutation = useMutation({
    mutationFn: async (tasks: Task[]) => {
      if (!user?.id) throw new Error('User not authenticated');

      const historyItems = tasks.map(task => ({
        user_id: user.id,
        original_task_id: task.id,
        title: task.title,
        description: task.description,
        folder_name: (task as any).folder?.name,
        folder_color: (task as any).folder?.color,
        priority: task.priority,
        completed_at: (task as any).completed_at,
        original_created_at: task.created_at,
        metadata: {
          has_subtasks: (task as any).subtasks?.length > 0,
          subtasks_count: (task as any).subtasks?.length || 0,
          properties: (task as any).properties || []
        }
      }));

      // Insert into history
      const { error: historyError } = await supabase
        .from('task_history')
        .insert(historyItems);

      if (historyError) throw historyError;

      // Delete original tasks
      const taskIds = tasks.map(task => task.id);
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .in('id', taskIds);

      if (deleteError) throw deleteError;

      return { archivedCount: tasks.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['task-history'] });
      queryClient.invalidateQueries({ queryKey: ['dades-app'] });
      toast.success(`${result.archivedCount} tasques arxivades correctament`);
    },
    onError: (error) => {
      console.error('Error archiving tasks:', error);
      toast.error('Error en arxivar les tasques');
    }
  });

  // Delete from history
  const deleteFromHistoryMutation = useMutation({
    mutationFn: async (historyIds: string[]) => {
      const { error } = await supabase
        .from('task_history')
        .delete()
        .in('id', historyIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-history'] });
      toast.success('Tasques eliminades de l\'historial');
    },
    onError: (error) => {
      console.error('Error deleting from history:', error);
      toast.error('Error en eliminar de l\'historial');
    }
  });

  // Clear all history
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('task_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-history'] });
      toast.success('Historial netejat completament');
    },
    onError: (error) => {
      console.error('Error clearing history:', error);
      toast.error('Error en netejar l\'historial');
    }
  });

  return {
    taskHistory,
    loading,
    error,
    refetch,
    archiveTasks: archiveTasksMutation.mutate,
    archivingTasks: archiveTasksMutation.isPending,
    deleteFromHistory: deleteFromHistoryMutation.mutate,
    deletingFromHistory: deleteFromHistoryMutation.isPending,
    clearHistory: clearHistoryMutation.mutate,
    clearingHistory: clearHistoryMutation.isPending,
  };
};