/**
 * Task Cache Hook - Simplified version
 * Basic task caching functionality
 */

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTasksCore } from './tasks/useTasksCore';

export const useTaskCache = () => {
  const queryClient = useQueryClient();
  const { tasks } = useTasksCore();

  const taskMap = useMemo(() => {
    const map = new Map();
    tasks.forEach(task => {
      map.set(task.id, task);
    });
    return map;
  }, [tasks]);

  const getCachedTask = useCallback((taskId: string) => {
    return taskMap.get(taskId);
  }, [taskMap]);

  const preloadTask = useCallback(async (taskId: string) => {
    // Basic preload - task data already in memory from useTasksCore
    return taskMap.get(taskId);
  }, [taskMap]);

  const preloadAdjacentTasks = useCallback((currentTaskId: string) => {
    const currentIndex = tasks.findIndex(task => task.id === currentTaskId);
    // Adjacent tasks already loaded via useTasksCore
    return;
  }, [tasks]);

  return {
    preloadTask,
    getCachedTask,
    preloadAdjacentTasks,
    taskMap
  };
};
