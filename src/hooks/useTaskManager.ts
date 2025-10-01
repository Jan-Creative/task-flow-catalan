/**
 * Unified Task Manager - Consolidates all task operations for reliability
 */

import { useCallback } from 'react';
import { useConsolidatedTaskManager } from './useConsolidatedTaskManager';
import { useTasksSubtasksProgress } from './useTasksSubtasksProgress';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Task, CreateTaskData, UpdateTaskData, CustomProperty } from '@/types';

export const useTaskManager = () => {
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

  // Get visible task IDs for progress fetching
  const visibleTaskIds = tasks.map(task => task.id);
  const { progressMap, getTaskProgress, hasSubtasks, refreshProgress } = useTasksSubtasksProgress(visibleTaskIds);

  // Enhanced create task with better error handling
  const createTask = useCallback(async (
    taskData: CreateTaskData,
    customProperties?: CustomProperty[]
  ) => {
    try {
      logger.debug('useTaskManager', 'Creating task through unified manager', { 
        taskData, 
        hasCustomProperties: !!customProperties?.length 
      });
      const result = await rawCreateTask(taskData, customProperties);
      
      // Refresh progress data if task was created successfully
      refreshProgress();
      
      toast.success("Tasca creada correctament");
      return result;
    } catch (error) {
      logger.error('useTaskManager', 'Failed to create task', error);
      toast.error("Error al crear la tasca. Torna-ho a intentar.");
      throw error;
    }
  }, [rawCreateTask, refreshProgress]);

  // Enhanced update task with better error handling
  const updateTask = useCallback(async (
    taskId: string,
    taskData: UpdateTaskData,
    customProperties?: CustomProperty[]
  ) => {
    try {
      logger.debug('useTaskManager', 'Updating task through unified manager', { 
        taskId, 
        updateFields: Object.keys(taskData),
        hasCustomProperties: !!customProperties?.length 
      });
      await rawUpdateTask(taskId, taskData, customProperties);
      
      // Refresh progress data if task was updated successfully
      refreshProgress();
      
      toast.success("Tasca actualitzada correctament");
    } catch (error) {
      logger.error('useTaskManager', 'Failed to update task', error);
      toast.error("Error al actualitzar la tasca. Torna-ho a intentar.");
      throw error;
    }
  }, [rawUpdateTask, refreshProgress]);

  // Enhanced task with progress data
  const getTaskWithProgress = useCallback((taskId: string) => {
    const task = getTaskById(taskId);
    if (!task) return null;

    const progress = getTaskProgress(taskId);
    return {
      ...task,
      progress
    };
  }, [getTaskById, getTaskProgress]);

  // Get all tasks with their progress data
  const getTasksWithProgress = useCallback(() => {
    return tasks.map(task => ({
      ...task,
      progress: getTaskProgress(task.id)
    }));
  }, [tasks, getTaskProgress]);

  return {
    // Data
    tasks,
    folders,
    loading,
    error,
    progressMap,
    
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
    getTasksWithProgress,
    getTaskProgress,
    hasSubtasks,
  };
};