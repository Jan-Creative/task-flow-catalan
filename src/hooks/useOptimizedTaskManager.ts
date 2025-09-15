/**
 * Optimized Task Manager - Performance-enhanced unified task operations
 * Consolidates all task operations with memoization and optimistic updates
 */

import { useCallback, useMemo } from 'react';
import { useConsolidatedTaskManager } from './useConsolidatedTaskManager';
import { useTasksSubtasksProgress } from './useTasksSubtasksProgress';
import { useStableCallback } from './performance';
import { logger } from '@/lib/debugUtils';
import { toast } from 'sonner';
import type { Task, CreateTaskData, UpdateTaskData, CustomProperty } from '@/types';

export const useOptimizedTaskManager = () => {
  const {
    tasks,
    folders,
    loading,
    error,
    createTask: rawCreateTask,
    updateTask: rawUpdateTask,
    updateStatus,
    deleteTask,
    updateTaskProperty,
    refreshData,
    getTaskById,
    getTasksByFolder,
    getTasksByStatus,
  } = useConsolidatedTaskManager();

  // Memoized visible task IDs for performance
  const visibleTaskIds = useMemo(() => 
    tasks.map(task => task.id), 
    [tasks]
  );

  const { progressMap, getTaskProgress, hasSubtasks, refreshProgress } = useTasksSubtasksProgress(visibleTaskIds);

  // Optimized create task with stable callbacks
  const createTask = useStableCallback(async (
    taskData: CreateTaskData,
    customProperties?: CustomProperty[]
  ) => {
    try {
      logger.debug('TaskManager', 'Creating task', { taskData, customProperties });
      const result = await rawCreateTask(taskData, customProperties);
      
      // Refresh progress data if task was created successfully
      refreshProgress();
      
      toast.success("Tasca creada correctament");
      return result;
    } catch (error) {
      logger.error('Failed to create task', error);
      toast.error("Error al crear la tasca. Torna-ho a intentar.");
      throw error;
    }
  });

  // Optimized update task with stable callbacks
  const updateTask = useStableCallback(async (
    taskId: string,
    taskData: UpdateTaskData,
    customProperties?: CustomProperty[]
  ) => {
    try {
      logger.debug('TaskManager', 'Updating task', { taskId, taskData, customProperties });
      await rawUpdateTask(taskId, taskData, customProperties);
      
      // Refresh progress data if task was updated successfully
      refreshProgress();
      
      toast.success("Tasca actualitzada correctament");
    } catch (error) {
      logger.error('Failed to update task', error);
      toast.error("Error al actualitzar la tasca. Torna-ho a intentar.");
      throw error;
    }
  });

  // Memoized task with progress data getter
  const getTaskWithProgress = useCallback((taskId: string) => {
    const task = getTaskById(taskId);
    if (!task) return null;

    const progress = getTaskProgress(taskId);
    return {
      ...task,
      progress
    };
  }, [getTaskById, getTaskProgress]);

  // Memoized tasks with progress data
  const tasksWithProgress = useMemo(() => 
    tasks.map(task => ({
      ...task,
      progress: getTaskProgress(task.id)
    })), 
    [tasks, getTaskProgress]
  );

  // Memoized task statistics
  const taskStats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completat').length,
    inProgress: tasks.filter(t => t.status === 'en_proces').length,
    pending: tasks.filter(t => t.status === 'pendent').length,
    withProgress: Object.keys(progressMap).length
  }), [tasks, progressMap]);

  return {
    // Data
    tasks,
    folders,
    loading,
    error,
    progressMap,
    taskStats,
    
    // Enhanced operations
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
    updateTaskProperty,
    refreshData,
    refreshProgress,
    
    // Enhanced helpers
    getTaskById,
    getTasksByFolder,
    getTasksByStatus,
    getTaskWithProgress,
    tasksWithProgress,
    getTaskProgress,
    hasSubtasks,
  };
};