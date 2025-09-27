import { useCallback } from 'react';
import { useDadesApp } from './useDadesApp';
import { useProperties } from './useProperties';
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
      
      // If isToday is true, set due_date to today
      if (processedTaskData.isToday) {
        const today = new Date().toISOString().split('T')[0];
        processedTaskData.due_date = today;
      }
      
      // Remove isToday from the data sent to database (it's not a DB field)
      delete processedTaskData.isToday;
      
      // Create the task
      const created = await createTask(processedTaskData);
      
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
      console.error("Error creating task with properties:", error);
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
      console.error("Error updating task with properties:", error);
      // Don't re-throw here, let the UI handle the original error
      throw error;
    }
  }, [updateTask, setTaskProperty]);

  return {
    handleCreateTask,
    handleEditTask
  };
};