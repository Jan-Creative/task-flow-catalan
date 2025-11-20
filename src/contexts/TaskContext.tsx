/**
 * Task Context - Simplified version for compatibility
 * Provides task data from URL params and subtask management
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTasksCore } from '@/hooks/tasks/useTasksCore';
import { useTaskSubtasks } from '@/hooks/useTaskSubtasks';
import type { Task, FolderInfo } from '@/types';

interface TaskContextValue {
  task: Task | null;
  folder: FolderInfo | null;
  loading: boolean;
  error: any;
  preloadAdjacentTasks: () => void;
  // Subtasks
  subtasks: any[];
  subtasksLoading: boolean;
  completedCount: number;
  progressPercentage: number;
  createSubtask: (title: string) => Promise<any>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
  toggleSubtask: (subtaskId: string) => Promise<void>;
  // Task updates
  updateTask: (updates: Partial<Task>) => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { taskId } = useParams();
  const { tasks, folders, loading, error, actualitzarTasca } = useTasksCore();
  
  const task = useMemo(() => 
    tasks.find(t => t.id === taskId) || null, 
    [tasks, taskId]
  );
  
  const folder = useMemo(() => 
    task?.folder_id ? folders.find(f => f.id === task.folder_id) || null : null,
    [task, folders]
  );

  // Use subtasks hook if task exists
  const subtasksData = useTaskSubtasks(taskId || '');

  const updateTask = async (updates: Partial<Task>) => {
    if (taskId) {
      await actualitzarTasca(taskId, updates);
    }
  };

  const preloadAdjacentTasks = () => {
    // No-op for now - could implement task preloading if needed
  };
  
  const contextValue = useMemo(() => ({
    task,
    folder,
    loading,
    error,
    preloadAdjacentTasks,
    updateTask,
    // Subtasks data
    subtasks: subtasksData.subtasks,
    subtasksLoading: subtasksData.loading,
    completedCount: subtasksData.completedCount,
    progressPercentage: subtasksData.progressPercentage,
    createSubtask: subtasksData.createSubtask,
    deleteSubtask: subtasksData.deleteSubtask,
    toggleSubtask: subtasksData.toggleSubtask,
  }), [task, folder, loading, error, subtasksData, updateTask]);
  
  return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>;
};
