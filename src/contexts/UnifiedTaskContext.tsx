/**
 * Unified Task Context - Consolidates task, notifications and properties management
 * Optimized to minimize re-renders and improve performance
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useDadesApp } from '@/hooks/useDadesApp';
import { useProperties } from '@/hooks/useProperties';
import { useNotificationContext } from './NotificationContext';
import { useStableCallback } from '@/hooks/performance';
import { logger } from '@/lib/logger';
import type { Tasca, Carpeta, PropertyWithOptions, CrearTascaData } from '@/types';
import type { ID, ApiError } from '@/types/common';

interface TaskCreateData extends CrearTascaData {
  [key: string]: unknown;
}

interface TaskUpdateData {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  completed?: boolean;
  folder_id?: ID;
  [key: string]: unknown;
}

interface TaskProperty extends PropertyWithOptions {
  type: 'select' | 'multiselect'; // Use existing type from PropertyDefinition
}

import type { EstadistiquesTasques } from '@/types';

interface TaskStats extends EstadistiquesTasques {
  // Extend existing stats with additional fields if needed
}

interface UnifiedTaskContextValue {
  // Task data and operations
  tasks: Tasca[];
  folders: Carpeta[];
  createTask: (taskData: TaskCreateData, customProperties?: PropertyWithOptions[]) => Promise<void>;
  updateTask: (taskId: ID, updates: TaskUpdateData) => Promise<void>;
  deleteTask: (taskId: ID) => Promise<void>;
  
  // Properties
  properties: PropertyWithOptions[];
  setTaskProperty: (taskId: ID, propertyId: ID, optionId: ID) => Promise<void>;
  
  // Task filtering and stats
  taskStats: EstadistiquesTasques;
  
  // Loading states
  loading: boolean;
  error: unknown;
  
  // Actions
  refreshData: () => void;
}

const UnifiedTaskContext = createContext<UnifiedTaskContextValue | null>(null);

export const useUnifiedTaskContext = () => {
  const context = useContext(UnifiedTaskContext);
  if (!context) {
    throw new Error('useUnifiedTaskContext must be used within UnifiedTaskProvider');
  }
  return context;
};

interface UnifiedTaskProviderProps {
  children: React.ReactNode;
}

export const UnifiedTaskProvider = ({ children }: UnifiedTaskProviderProps) => {
  // Data hooks
  const {
    tasks,
    folders,
    createTask: rawCreateTask,
    updateTask: rawUpdateTask,
    deleteTask: rawDeleteTask,
    loading,
    error,
    refreshData,
    taskStats
  } = useDadesApp();

  const { properties, setTaskProperty } = useProperties();

  // Stable callbacks to prevent unnecessary re-renders
  const createTask = useStableCallback(async (taskData: TaskCreateData, customProperties?: PropertyWithOptions[]) => {
    logger.info('UnifiedTaskContext', 'Creating task', { 
      title: taskData.title, 
      hasCustomProperties: !!customProperties?.length 
    });
    await rawCreateTask(taskData);
  });

  const updateTask = useStableCallback(async (taskId: ID, updates: TaskUpdateData) => {
    logger.info('UnifiedTaskContext', 'Updating task', { 
      taskId, 
      updateFields: Object.keys(updates) 
    });
    await rawUpdateTask(taskId, updates);
  });

  const deleteTask = useStableCallback(async (taskId: ID) => {
    logger.info('UnifiedTaskContext', 'Deleting task', { taskId });
    await rawDeleteTask(taskId);
  });

  // Memoized context value
  const contextValue = useMemo(() => ({
    tasks,
    folders,
    createTask,
    updateTask,
    deleteTask,
    properties,
    setTaskProperty,
    taskStats,
    loading,
    error,
    refreshData
  }), [
    tasks,
    folders,
    createTask,
    updateTask,
    deleteTask,
    properties,
    setTaskProperty,
    taskStats,
    loading,
    error,
    refreshData
  ]);

  return (
    <UnifiedTaskContext.Provider value={contextValue}>
      {children}
    </UnifiedTaskContext.Provider>
  );
};