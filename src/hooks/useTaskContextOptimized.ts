import React, { createContext, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDadesApp } from '@/hooks/useDadesApp';

// ============= OPTIMIZED TASK BASIC CONTEXT =============
interface TaskBasicContextValue {
  task: any;
  folder: any;
  loading: boolean;
  error: any;
}

const TaskBasicContext = createContext<TaskBasicContextValue | null>(null);

export const useTaskBasicContext = () => {
  const context = useContext(TaskBasicContext);
  if (!context) {
    throw new Error('useTaskBasicContext must be used within a TaskBasicProvider');
  }
  return context;
};

export const TaskBasicProvider = ({ children }: { children: React.ReactNode }) => {
  const { taskId } = useParams();
  const { tasks, folders, loading, error } = useDadesApp();
  
  // Find current task and folder with memoization
  const task = useMemo(() => 
    tasks.find(t => t.id === taskId), 
    [tasks, taskId]
  );
  
  const folder = useMemo(() => 
    task?.folder_id ? folders.find(f => f.id === task.folder_id) : null,
    [task, folders]
  );
  
  const contextValue = useMemo(() => ({
    task,
    folder,
    loading,
    error
  }), [task, folder, loading, error]);
  
  return React.createElement(TaskBasicContext.Provider, { value: contextValue }, children);
};

// ============= OPTIMIZED TASK OPERATIONS CONTEXT =============
interface TaskOperationsContextValue {
  updateTask: (data: any) => Promise<any>;
  deleteTask: () => Promise<any>;
}

const TaskOperationsContext = createContext<TaskOperationsContextValue | null>(null);

export const useTaskOperationsContext = () => {
  const context = useContext(TaskOperationsContext);
  if (!context) {
    throw new Error('useTaskOperationsContext must be used within a TaskOperationsProvider');
  }
  return context;
};

export const TaskOperationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { taskId } = useParams();
  const { updateTask: appUpdateTask, deleteTask: appDeleteTask } = useDadesApp();
  
  const contextValue = useMemo(() => ({
    updateTask: async (data: any) => {
      if (!taskId) return;
      return appUpdateTask(taskId, data);
    },
    deleteTask: async () => {
      if (!taskId) return;
      return appDeleteTask(taskId);
    }
  }), [taskId, appUpdateTask, appDeleteTask]);
  
  return React.createElement(TaskOperationsContext.Provider, { value: contextValue }, children);
};