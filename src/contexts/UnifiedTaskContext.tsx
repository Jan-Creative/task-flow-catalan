/**
 * Unified Task Context - Consolidates task, notifications and properties management
 * Optimized to minimize re-renders and improve performance
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useDadesApp } from '@/hooks/useDadesApp';
import { useProperties } from '@/hooks/useProperties';
import { useNotificationContext } from './NotificationContext';
import { useStableCallback } from '@/hooks/performance';
import type { Tasca } from '@/types';

interface UnifiedTaskContextValue {
  // Task data and operations
  tasks: Tasca[];
  folders: any[];
  createTask: (taskData: any, customProperties?: any[]) => Promise<void>;
  updateTask: (taskId: string, updates: any) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Properties
  properties: any[];
  setTaskProperty: (taskId: string, propertyId: string, optionId: string) => Promise<void>;
  
  // Task filtering and stats
  taskStats: any;
  
  // Loading states
  loading: boolean;
  error: any;
  
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
  const createTask = useStableCallback(async (taskData: any, customProperties?: any[]) => {
    await rawCreateTask(taskData);
  });

  const updateTask = useStableCallback(async (taskId: string, updates: any) => {
    await rawUpdateTask(taskId, updates);
  });

  const deleteTask = useStableCallback(async (taskId: string) => {
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