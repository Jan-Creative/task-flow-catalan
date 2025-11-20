import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useDadesApp } from '@/hooks/useDadesApp';
import { useTaskSubtasks } from '@/hooks/useTaskSubtasks';
// ✅ FASE 4: useTaskNotes eliminat
import { logger } from '@/lib/logger';
import type { Tasca, Carpeta, Subtask } from '@/types';
import type { ID, Nullable } from '@/types/common';

interface TaskSubtask extends Subtask {
  completed: boolean; // Map is_completed to completed for interface compatibility
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

interface TaskContextValue {
  // Task basic data
  task: Nullable<Tasca>;
  folder: Nullable<Carpeta>;
  loading: boolean;
  error: unknown;
  
  // Subtasks data and methods
  subtasks: Subtask[];
  subtasksLoading: boolean;
  completedCount: number;
  progressPercentage: number;
  createSubtask: (title: string) => Promise<Subtask>;
  deleteSubtask: (id: string) => Promise<void>;
  toggleSubtask: (id: string) => void;
  
  // Task operations
  updateTask: (data: TaskUpdateData) => Promise<void>;
  deleteTask: () => Promise<void>;
  
  // Navigation helpers
  refreshTaskData: () => void;
  preloadAdjacentTasks: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { taskId } = useParams();
  const queryClient = useQueryClient();
  
  // Main task data
  const { 
    tasks, 
    folders, 
    loading: appLoading, 
    error: appError,
    updateTask: appUpdateTask,
    deleteTask: appDeleteTask,
    refreshData 
  } = useDadesApp();

  // Preload adjacent tasks when component mounts or taskId changes
  useEffect(() => {
    if (taskId && tasks.length > 0) {
      logger.performance('TaskContext', 'Preloading adjacent tasks', { taskId, tasksCount: tasks.length });
      
      const currentIndex = tasks.findIndex(t => t.id === taskId);
      if (currentIndex !== -1) {
        const adjacentTasks = [
          tasks[currentIndex - 1],
          tasks[currentIndex + 1]
        ].filter(Boolean);

        adjacentTasks.forEach(task => {
          // Prefetch task data for smoother navigation
          queryClient.prefetchQuery({
            queryKey: ['task-properties', task.id],
            staleTime: 1000 * 60 * 5
          });
        });
        
        logger.performance('TaskContext', 'Adjacent tasks preloaded', { 
          adjacentCount: adjacentTasks.length,
          currentIndex 
        });
      }
    }
  }, [taskId, tasks, queryClient]);
  
  // Find current task and folder
  const task = useMemo(() => 
    tasks.find(t => t.id === taskId), 
    [tasks, taskId]
  );
  
  const folder = useMemo(() => 
    task?.folder_id ? folders.find(f => f.id === task.folder_id) : null,
    [task, folders]
  );
  
  // Subtasks management
  const {
    subtasks,
    loading: subtasksLoading,
    completedCount,
    progressPercentage,
    createSubtask,
    deleteSubtask,
    toggleSubtask
  } = useTaskSubtasks(taskId!);
  
  // ✅ FASE 4: Notes management eliminat
  // useTaskNotes eliminat
  
  // Task operations
  const updateTask = useCallback(async (data: TaskUpdateData): Promise<void> => {
    if (!taskId) {
      logger.warn('TaskContext', 'Update task called without taskId', { data });
      throw new Error('No task ID provided');
    }
    
    logger.info('TaskContext', 'Updating task', { taskId, updates: Object.keys(data) });
    await appUpdateTask(taskId, data);
  }, [taskId, appUpdateTask]);
  
  const deleteTask = useCallback(async (): Promise<void> => {
    if (!taskId) {
      logger.warn('TaskContext', 'Delete task called without taskId');
      throw new Error('No task ID provided');
    }
    
    logger.info('TaskContext', 'Deleting task', { taskId });
    return appDeleteTask(taskId);
  }, [taskId, appDeleteTask]);
  
  // Performance optimizations
  const refreshTaskData = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const preloadAdjacentTasks = useCallback(() => {
    if (!taskId || !tasks.length) return;
    
    const currentIndex = tasks.findIndex(t => t.id === taskId);
    if (currentIndex === -1) return;

    // Preload adjacent tasks data
    const adjacentTasks = [
      tasks[currentIndex - 1],
      tasks[currentIndex + 1]
    ].filter(Boolean);

    adjacentTasks.forEach(task => {
      // Trigger preload for task properties, subtasks, and notes
      queryClient.prefetchQuery({
        queryKey: ['task-properties', task.id],
        staleTime: 1000 * 60 * 5
      });
      queryClient.prefetchQuery({
        queryKey: ['task-subtasks', task.id], 
        staleTime: 1000 * 60 * 5
      });
      queryClient.prefetchQuery({
        queryKey: ['task-notes', task.id],
        staleTime: 1000 * 60 * 5
      });
    });
  }, [taskId, tasks]);
  
  const contextValue = useMemo(() => ({
    // Task basic data
    task,
    folder,
    loading: appLoading,
    error: appError,
    
    // Subtasks
    subtasks,
    subtasksLoading,
    completedCount,
    progressPercentage,
    createSubtask,
    deleteSubtask,
    toggleSubtask,
    
    // ✅ FASE 4: Notes eliminades del context
    
    // Task operations
    updateTask,
    deleteTask,
    
    // Navigation helpers
    refreshTaskData,
    preloadAdjacentTasks
  }), [
    task, folder, appLoading, appError,
    subtasks, subtasksLoading, completedCount, progressPercentage,
    createSubtask, deleteSubtask, toggleSubtask,
    updateTask, deleteTask,
    refreshTaskData, preloadAdjacentTasks
  ]);
  
  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};