/**
 * Consolidated Task Manager - Single source of truth for all task operations
 * This hook consolidates and centralizes task CRUD operations to prevent coordination issues
 */

import { useCallback } from 'react';
import { useDadesApp } from './useDadesApp';
import { useTaskOperations } from './useTaskOperations';
import { useProperties } from './useProperties';
import { toast } from 'sonner';
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
      console.debug('Creating task:', { taskData, customProperties });
      const result = await handleCreateTask(taskData, customProperties);
      console.debug('Task created successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to create task:', error);
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
      console.debug('Updating task:', { taskId, taskData, customProperties });
      await handleEditTask(taskId, taskData, customProperties);
      console.debug('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error("No s'ha pogut actualitzar la tasca. Torna-ho a intentar.");
      throw error;
    }
  }, [handleEditTask]);

  // Centralized task status update
  const updateStatus = useCallback(async (taskId: string, status: Task['status']) => {
    try {
      console.debug('Updating task status:', { taskId, status });
      await updateTaskStatus(taskId, status);
      console.debug('Task status updated successfully');
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error("No s'ha pogut actualitzar l'estat de la tasca.");
      throw error;
    }
  }, [updateTaskStatus]);

  // Centralized task deletion
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      console.debug('Deleting task:', { taskId });
      await deleteSingleTask(taskId);
      console.debug('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
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
      console.debug('Updating task property:', { taskId, propertyId, optionId });
      await setTaskProperty(taskId, propertyId, optionId);
      console.debug('Task property updated successfully');
    } catch (error) {
      console.error('Failed to update task property:', error);
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