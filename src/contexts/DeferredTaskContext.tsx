/**
 * Deferred Task Context - Loads task data in background after critical boot
 */

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useDadesApp } from '@/hooks/useDadesApp';
import { useProperties } from '@/hooks/useProperties';
import { useStableCallback } from '@/hooks/performance';
import { logger } from '@/lib/logger';
import type { Tasca, Carpeta, PropertyWithOptions, CrearTascaData } from '@/types';
import type { ID } from '@/types/common';
import type { EstadistiquesTasques } from '@/types';

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

interface DeferredTaskContextValue {
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
  dataReady: boolean;
  error: unknown;
  
  // Actions
  refreshData: () => void;
}

const DeferredTaskContext = createContext<DeferredTaskContextValue | null>(null);

export const useDeferredTaskContext = () => {
  const context = useContext(DeferredTaskContext);
  if (!context) {
    throw new Error('useDeferredTaskContext must be used within DeferredTaskProvider');
  }
  return context;
};

interface DeferredTaskProviderProps {
  children: React.ReactNode;
}

export const DeferredTaskProvider = ({ children }: DeferredTaskProviderProps) => {
  // Load data immediately - no artificial delays
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
  
  const dataReady = !loading;

  // Stable callbacks to prevent unnecessary re-renders
  const createTask = useStableCallback(async (taskData: TaskCreateData, customProperties?: PropertyWithOptions[]) => {
    logger.info('DeferredTaskContext', 'Creating task', { 
      title: taskData.title, 
      hasCustomProperties: !!customProperties?.length 
    });
    await rawCreateTask(taskData);
  });

  const updateTask = useStableCallback(async (taskId: ID, updates: TaskUpdateData) => {
    logger.info('DeferredTaskContext', 'Updating task', { 
      taskId, 
      updateFields: Object.keys(updates) 
    });
    await rawUpdateTask(taskId, updates);
  });

  const deleteTask = useStableCallback(async (taskId: ID) => {
    logger.info('DeferredTaskContext', 'Deleting task', { taskId });
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
    dataReady,
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
    dataReady,
    error,
    refreshData
  ]);

  return (
    <DeferredTaskContext.Provider value={contextValue}>
      {children}
    </DeferredTaskContext.Provider>
  );
};

// Legacy export for backward compatibility
export const useUnifiedTaskContext = useDeferredTaskContext;
export const UnifiedTaskProvider = DeferredTaskProvider;