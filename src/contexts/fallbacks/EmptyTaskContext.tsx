/**
 * Empty Task Context - Fallback when providers fail
 */

import React, { ReactNode } from 'react';
import { logger } from '@/lib/logger';

// Empty context for fallback
export const EMPTY_TASK_CONTEXT = {
  tasks: [],
  folders: [],
  loading: false,
  error: new Error('TaskProvider failed to initialize'),
  createTask: async () => {
    logger.warn('EmptyTaskContext', 'Task operations unavailable');
  },
  updateTask: async () => {
    logger.warn('EmptyTaskContext', 'Task operations unavailable');
  },
  deleteTask: async () => {
    logger.warn('EmptyTaskContext', 'Task operations unavailable');
  },
};

export const EmptyTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
