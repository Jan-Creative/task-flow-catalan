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
      // Create the task
      const created = await createTask(taskData);
      
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
      throw error;
    }
  }, [updateTask, setTaskProperty]);

  return {
    handleCreateTask,
    handleEditTask
  };
};