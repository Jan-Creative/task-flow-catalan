import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDadesApp } from '@/hooks/useDadesApp';
import { useTaskSubtasks } from '@/hooks/useTaskSubtasks';
import { useTaskNotes } from '@/hooks/useTaskNotes';

interface TaskContextValue {
  // Task basic data
  task: any;
  folder: any;
  loading: boolean;
  error: any;
  
  // Subtasks data and methods
  subtasks: any[];
  subtasksLoading: boolean;
  completedCount: number;
  progressPercentage: number;
  createSubtask: (title: string) => Promise<any>;
  deleteSubtask: (id: string) => Promise<any>;
  toggleSubtask: (id: string) => void;
  
  // Notes data and methods
  notes: string;
  notesLoading: boolean;
  isSaving: boolean;
  isModified: boolean;
  lastSaved: Date | null;
  updateNotes: (notes: string) => void;
  forceSave: () => void;
  
  // Task operations
  updateTask: (data: any) => Promise<any>;
  deleteTask: () => Promise<any>;
  
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
  
  // Notes management
  const {
    notes,
    loading: notesLoading,
    isSaving,
    isModified,
    lastSaved,
    updateNotes,
    forceSave
  } = useTaskNotes(taskId!);
  
  // Task operations
  const updateTask = useCallback(async (data: any) => {
    if (!taskId) return;
    return appUpdateTask(taskId, data);
  }, [taskId, appUpdateTask]);
  
  const deleteTask = useCallback(async () => {
    if (!taskId) return;
    return appDeleteTask(taskId);
  }, [taskId, appDeleteTask]);
  
  // Performance optimizations
  const refreshTaskData = useCallback(() => {
    refreshData();
  }, [refreshData]);
  
  const preloadAdjacentTasks = useCallback(() => {
    // TODO: Implement preloading of adjacent tasks
    // This will help with smoother navigation
  }, []);
  
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
    
    // Notes
    notes,
    notesLoading,
    isSaving,
    isModified,
    lastSaved,
    updateNotes,
    forceSave,
    
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
    notes, notesLoading, isSaving, isModified, lastSaved,
    updateNotes, forceSave,
    updateTask, deleteTask,
    refreshTaskData, preloadAdjacentTasks
  ]);
  
  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};