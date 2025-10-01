/**
 * Consolidated Task Manager - Single source of truth for all task operations
 * This hook consolidates and centralizes task CRUD operations to prevent coordination issues
 */

import { useCallback } from 'react';
import { useDadesApp } from './useDadesApp';
import { useTaskOperations } from './useTaskOperations';
import { useProperties } from './useProperties';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Task, CreateTaskData, UpdateTaskData, CustomProperty } from '@/types';

export const useConsolidatedTaskManager = () => {
  const { 
    tasks, 
    folders, 
    loading, 
    error,
    updateTaskStatus,
    deleteTask: deleteSingleTask,
    refreshData 
  } = useDadesApp();
  
  const { handleCreateTask, handleEditTask } = useTaskOperations();
  const { setTaskProperty } = useProperties();

  // Centralized task creation with comprehensive error handling
  const createTask = useCallback(async (
    taskData: CreateTaskData, 
    customProperties?: CustomProperty[]
  ) => {
    try {
      logger.debug('useConsolidatedTaskManager', 'Creating task', { taskData, hasCustomProperties: !!customProperties?.length });
      const result = await handleCreateTask(taskData, customProperties);
      logger.debug('useConsolidatedTaskManager', 'Task created successfully', { taskId: result?.id });
      return result;
    } catch (error) {
      logger.error('useConsolidatedTaskManager', 'Failed to create task', error);
      toast.error("No s'ha pogut crear la tasca. Torna-ho a intentar.");
      throw error;
    }
  }, [handleCreateTask]);

  // Centralized task update with comprehensive error handling
  const updateTask = useCallback(async (
    taskId: string,
    taskData: UpdateTaskData,
    customProperties?: CustomProperty[]
  ) => {
    try {
      logger.debug('useConsolidatedTaskManager', 'Updating task', { taskId, updateFields: Object.keys(taskData), hasCustomProperties: !!customProperties?.length });
      await handleEditTask(taskId, taskData, customProperties);
      logger.debug('useConsolidatedTaskManager', 'Task updated successfully', { taskId });
    } catch (error) {
      logger.error('useConsolidatedTaskManager', 'Failed to update task', error);
      toast.error("No s'ha pogut actualitzar la tasca. Torna-ho a intentar.");
      throw error;
    }
  }, [handleEditTask]);

  // Centralized task status update
  const updateStatus = useCallback(async (taskId: string, status: Task['status']) => {
    try {
      logger.debug('useConsolidatedTaskManager', 'Updating task status', { taskId, status });
      await updateTaskStatus(taskId, status);
      logger.debug('useConsolidatedTaskManager', 'Task status updated successfully', { taskId });
    } catch (error) {
      logger.error('useConsolidatedTaskManager', 'Failed to update task status', error);
      toast.error("No s'ha pogut actualitzar l'estat de la tasca.");
      throw error;
    }
  }, [updateTaskStatus]);

  // Centralized task deletion
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      logger.debug('useConsolidatedTaskManager', 'Deleting task', { taskId });
      await deleteSingleTask(taskId);
      logger.debug('useConsolidatedTaskManager', 'Task deleted successfully', { taskId });
    } catch (error) {
      logger.error('useConsolidatedTaskManager', 'Failed to delete task', error);
      toast.error("No s'ha pogut eliminar la tasca. Torna-ho a intentar.");
      throw error;
    }
  }, [deleteSingleTask]);

  // Task property management
  const updateTaskProperty = useCallback(async (
    taskId: string, 
    propertyId: string, 
    optionId: string
  ) => {
    try {
      logger.debug('useConsolidatedTaskManager', 'Updating task property', { taskId, propertyId, optionId });
      await setTaskProperty(taskId, propertyId, optionId);
      logger.debug('useConsolidatedTaskManager', 'Task property updated successfully', { taskId });
    } catch (error) {
      logger.error('useConsolidatedTaskManager', 'Failed to update task property', error);
      toast.error("No s'ha pogut actualitzar la propietat de la tasca.");
      throw error;
    }
  }, [setTaskProperty]);

  // Task retrieval helpers
  const getTaskById = useCallback((taskId: string): Task | undefined => {
    return tasks.find(task => task.id === taskId);
  }, [tasks]);

  const getTasksByFolder = useCallback((folderId: string): Task[] => {
    return tasks.filter(task => task.folder_id === folderId);
  }, [tasks]);

  const getTasksByStatus = useCallback((status: Task['status']): Task[] => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  return {
    // Data
    tasks,
    folders,
    loading,
    error,
    
    // Operations
    createTask,
    updateTask,
    updateStatus,
    deleteTask,
    updateTaskProperty,
    refreshData,
    
    // Helpers
    getTaskById,
    getTasksByFolder,
    getTasksByStatus,
  };
};