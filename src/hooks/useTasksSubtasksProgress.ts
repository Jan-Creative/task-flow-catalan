import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSafety } from './useRealtimeSafety';

export interface TaskProgress {
  taskId: string;
  totalSubtasks: number;
  completedSubtasks: number;
  progressPercentage: number;
}

export const useTasksSubtasksProgress = (taskIds: string[]) => {
  const [progressMap, setProgressMap] = useState<Map<string, TaskProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const { isRealtimeAvailable, createSafeSubscription } = useRealtimeSafety();

  // Memoize taskIds to prevent unnecessary re-fetches
  const stableTaskIds = useMemo(() => taskIds, [taskIds.join(',')]);

  // Fetch progress for all tasks in a single query
  const fetchProgress = async () => {
    if (stableTaskIds.length === 0) {
      setProgressMap(new Map());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Single query to get all subtasks for the given task IDs
      console.debug('Fetching subtask progress for tasks:', stableTaskIds);
      
      const { data, error } = await supabase
        .from('task_subtasks')
        .select('task_id, completed')
        .in('task_id', stableTaskIds);
      
      console.debug('Subtasks query result:', { data, error });

      if (error) throw error;

      // Calculate progress for each task
      const newProgressMap = new Map<string, TaskProgress>();
      
      // Group subtasks by task_id
      const subtasksByTask = new Map<string, { total: number; completed: number }>();
      
      data?.forEach(subtask => {
        const current = subtasksByTask.get(subtask.task_id) || { total: 0, completed: 0 };
        current.total += 1;
        if (subtask.completed) {
          current.completed += 1;
        }
        subtasksByTask.set(subtask.task_id, current);
      });

      // Create progress objects for tasks with subtasks
      subtasksByTask.forEach((stats, taskId) => {
        const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        newProgressMap.set(taskId, {
          taskId,
          totalSubtasks: stats.total,
          completedSubtasks: stats.completed,
          progressPercentage
        });
      });

      setProgressMap(newProgressMap);
    } catch (error) {
      console.error('Error fetching task progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load progress on mount and when taskIds change
  useEffect(() => {
    fetchProgress();
  }, [stableTaskIds.length > 0 ? stableTaskIds.join(',') : '']);

  // Realtime subscription for subtasks changes
  useEffect(() => {
    if (stableTaskIds.length === 0) return;

    if (!isRealtimeAvailable) {
      // Polling fallback every 30 seconds
      const pollInterval = setInterval(() => {
        fetchProgress();
      }, 30000);

      return () => clearInterval(pollInterval);
    }

    // Safe realtime subscription
    const channel = createSafeSubscription(
      'task-subtasks-progress',
      { 
        event: '*', 
        schema: 'public', 
        table: 'task_subtasks'
      },
      () => {
        console.debug('Subtask change detected, refreshing progress');
        fetchProgress();
      }
    );

    return () => {
      try {
        if (channel) supabase.removeChannel(channel);
      } catch (error) {
        // Silent cleanup
      }
    };
  }, [stableTaskIds.join(','), isRealtimeAvailable, createSafeSubscription]);

  // Helper function to get progress for a specific task
  const getTaskProgress = (taskId: string): TaskProgress | null => {
    return progressMap.get(taskId) || null;
  };

  // Helper function to check if a task has subtasks
  const hasSubtasks = (taskId: string): boolean => {
    const progress = progressMap.get(taskId);
    return progress ? progress.totalSubtasks > 0 : false;
  };

  return {
    progressMap,
    loading,
    getTaskProgress,
    hasSubtasks,
    refreshProgress: fetchProgress
  };
};