import { useCallback } from 'react';
import { useDadesApp } from './useDadesApp';
import { useProperties } from './useProperties';
import { logger } from '@/lib/logger';
import type { CustomProperty } from '@/types';

// ============= UNIFIED TASK OPERATIONS =============
export const useTaskOperations = () => {
  const { createTask, updateTask } = useDadesApp();
  const { setTaskProperty } = useProperties();

  const handleCreateTask = useCallback(async (
    taskData: any, 
    customProperties?: CustomProperty[]
  ) => {
    try {
      // FASE 1: Process isToday flag
      const processedTaskData = { ...taskData };
      
      // Map isToday to is_today for database persistence
      if (taskData.isToday !== undefined) {
        processedTaskData.is_today = taskData.isToday;
        delete processedTaskData.isToday;
      }
      
      // Create the task
      logger.debug('useTaskOperations', 'Creating task', { due_date: processedTaskData.due_date ?? null, hasDueDate: !!processedTaskData.due_date });
      const created = await createTask(processedTaskData);
      logger.debug('useTaskOperations', 'Task created', { taskId: created?.id, due_date: created?.due_date ?? null });
      
      // Apply custom properties if any
      if (created?.id && customProperties && customProperties.length > 0) {
        await Promise.all(
          customProperties.map((prop) => 
            setTaskProperty(created.id, prop.propertyId, prop.optionId)
          )
        );
      }
      
      return created;
    } catch (error) {
      logger.error('useTaskOperations', 'Error creating task with properties', error);
      // Don't re-throw here, let the UI handle the original error
      throw error;
    }
  }, [createTask, setTaskProperty]);

  const handleEditTask = useCallback(async (
    taskId: string,
    taskData: any,
    customProperties?: CustomProperty[]
  ) => {
    try {
      // Update the task
      await updateTask(taskId, taskData);
      
      // Apply custom properties if any
      if (customProperties && customProperties.length > 0) {
        await Promise.all(
          customProperties.map((prop) => 
            setTaskProperty(taskId, prop.propertyId, prop.optionId)
          )
        );
      }
    } catch (error) {
      logger.error('useTaskOperations', 'Error updating task with properties', error);
      // Don't re-throw here, let the UI handle the original error
      throw error;
    }
  }, [updateTask, setTaskProperty]);

  return {
    handleCreateTask,
    handleEditTask
  };
};