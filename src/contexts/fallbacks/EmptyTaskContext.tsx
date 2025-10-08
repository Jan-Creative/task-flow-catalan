import React, { ReactNode } from 'react';
import { UnifiedTaskContext } from '../UnifiedTaskContext';
import { logger } from '@/lib/logger';

// Empty context value with safe defaults
export const EMPTY_TASK_CONTEXT = {
  // Data
  tasks: [],
  folders: [],
  properties: [],
  taskStats: {
    total: 0,
    completades: 0,
    actives: 0,
    vencides: 0,
    enProces: 0,
    pendents: 0,
  },

  // Loading states
  loading: false,
  
  // Error state
  error: new Error('TaskProvider failed to initialize'),

  // No-op functions
  createTask: async () => {
    logger.warn('EmptyTaskContext', 'Task operations unavailable - provider failed');
  },
  updateTask: async () => {
    logger.warn('EmptyTaskContext', 'Task operations unavailable - provider failed');
  },
  deleteTask: async () => {
    logger.warn('EmptyTaskContext', 'Task operations unavailable - provider failed');
  },
  setTaskProperty: async () => {
    logger.warn('EmptyTaskContext', 'Property operations unavailable - provider failed');
  },
  refreshData: () => {
    logger.warn('EmptyTaskContext', 'Refresh unavailable - provider failed');
  },
};

export const EmptyTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <UnifiedTaskContext.Provider value={EMPTY_TASK_CONTEXT}>
      {children}
    </UnifiedTaskContext.Provider>
  );
};
