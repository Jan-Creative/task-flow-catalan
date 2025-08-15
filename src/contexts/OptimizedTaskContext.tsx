import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useDadesApp } from '@/hooks/useDadesApp';
import { useTaskSubtasks } from '@/hooks/useTaskSubtasks';
import { useTaskNotes } from '@/hooks/useTaskNotes';
import { useTaskCache } from '@/hooks/useTaskCache';

interface TaskContextValue {
  task: any | null;
  folder: any | null;
  subtasks: any[];
  notes: string;
  loading: boolean;
  error: string | null;
  updateTask: (updates: any) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createSubtask: (title: string) => Promise<any>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
  toggleSubtask: (subtaskId: string) => void;
  updateNotes: (notes: string) => void;
  forceSave: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: React.ReactNode;
}

export const OptimizedTaskProvider = ({ children }: TaskProviderProps) => {
  const { taskId } = useParams();
  const queryClient = useQueryClient();
  const { getCachedTask, preloadAdjacentTasks } = useTaskCache();
  const { tasks, folders, updateTask: updateTaskInApp, deleteTask: deleteTaskFromApp, loading: appLoading } = useDadesApp();

  // Get task from cache first for instant access
  const cachedTask = taskId ? getCachedTask(taskId) : null;
  
  // Find task in current data or use cached version
  const task = useMemo(() => {
    if (!taskId) return null;
    
    // Try to find in current tasks
    const currentTask = tasks.find(t => t.id === taskId);
    if (currentTask) return currentTask;
    
    // Fall back to cached task
    return cachedTask;
  }, [taskId, tasks, cachedTask]);

  // Find folder
  const folder = useMemo(() => {
    if (!task) return null;
    return folders.find(f => f.id === task.folder_id) || null;
  }, [task, folders]);

  // Get subtasks and notes
  const {
    subtasks,
    createSubtask,
    deleteSubtask,
    toggleSubtask,
    loading: subtasksLoading
  } = useTaskSubtasks(taskId);

  const {
    notes,
    updateNotes,
    forceSave,
    loading: notesLoading
  } = useTaskNotes(taskId);

  // Preload adjacent tasks for smooth navigation
  useEffect(() => {
    if (taskId && task) {
      preloadAdjacentTasks(taskId);
    }
  }, [taskId, task, preloadAdjacentTasks]);

  // Prefetch related data
  useEffect(() => {
    if (taskId) {
      // Prefetch task properties
      queryClient.prefetchQuery({
        queryKey: ['task-properties', taskId],
        staleTime: 5 * 60 * 1000,
      });

      // Prefetch task subtasks if not already loading
      if (!subtasksLoading) {
        queryClient.prefetchQuery({
          queryKey: ['task-subtasks', taskId],
          staleTime: 5 * 60 * 1000,
        });
      }

      // Prefetch task notes if not already loading
      if (!notesLoading) {
        queryClient.prefetchQuery({
          queryKey: ['task-notes', taskId],
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [taskId, queryClient, subtasksLoading, notesLoading]);

  // Enhanced update task function
  const updateTask = async (updates: any) => {
    if (!task) return;
    await updateTaskInApp(task.id, updates);
  };

  // Enhanced delete task function
  const deleteTask = async (taskId: string) => {
    await deleteTaskFromApp(taskId);
  };

  // Intelligent loading state - only show loading if we have no task data at all
  const shouldShowLoading = appLoading && !task;
  
  // Error state - only show error after reasonable wait time and no cached data
  const hasError = !shouldShowLoading && !task && taskId;

  const contextValue = useMemo(() => ({
    task,
    folder,
    subtasks,
    notes,
    loading: shouldShowLoading,
    error: hasError ? 'Tasca no trobada' : null,
    updateTask,
    deleteTask,
    createSubtask,
    deleteSubtask,
    toggleSubtask,
    updateNotes,
    forceSave,
  }), [
    task,
    folder,
    subtasks,
    notes,
    shouldShowLoading,
    hasError,
    updateTask,
    deleteTask,
    createSubtask,
    deleteSubtask,
    toggleSubtask,
    updateNotes,
    forceSave,
  ]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};