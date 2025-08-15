import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDadesApp } from './useDadesApp';

// Enhanced task cache for smooth navigation
export const useTaskCache = () => {
  const queryClient = useQueryClient();
  const { tasks } = useDadesApp();

  // Create a task lookup map for fast access
  const taskMap = useMemo(() => {
    const map = new Map();
    tasks.forEach(task => {
      map.set(task.id, task);
    });
    return map;
  }, [tasks]);

  // Preload task data with related information
  const preloadTask = useCallback(async (taskId: string) => {
    const task = taskMap.get(taskId);
    if (!task) return;

    // Preload task properties
    queryClient.prefetchQuery({
      queryKey: ['task-properties', taskId],
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Preload task subtasks
    queryClient.prefetchQuery({
      queryKey: ['task-subtasks', taskId],
      staleTime: 1000 * 60 * 5,
    });

    // Preload task notes
    queryClient.prefetchQuery({
      queryKey: ['task-notes', taskId],
      staleTime: 1000 * 60 * 5,
    });
  }, [taskMap, queryClient]);

  // Get cached task data instantly
  const getCachedTask = useCallback((taskId: string) => {
    return taskMap.get(taskId);
  }, [taskMap]);

  // Preload adjacent tasks for better navigation
  const preloadAdjacentTasks = useCallback((currentTaskId: string) => {
    const currentIndex = tasks.findIndex(task => task.id === currentTaskId);
    
    // Preload previous and next tasks
    const adjacentTasks = [
      tasks[currentIndex - 1],
      tasks[currentIndex + 1]
    ].filter(Boolean);

    adjacentTasks.forEach(task => {
      preloadTask(task.id);
    });
  }, [tasks, preloadTask]);

  return {
    preloadTask,
    getCachedTask,
    preloadAdjacentTasks,
    taskMap
  };
};