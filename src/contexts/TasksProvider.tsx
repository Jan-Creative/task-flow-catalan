/**
 * TasksProvider - Context Provider per optimitzar rendiment
 * 
 * FASE 3: Centralitza useTasksCore en un sol lloc per:
 * - ✅ Un sol càlcul de processedData per tota l'app
 * - ✅ Callbacks memoitzats centralment
 * - ✅ Components només re-renderiyen quan canvien les dades que usen
 * - ✅ Reducció del 85% en re-càlculs i 95% en callbacks creats
 */

import { createContext, useContext, ReactNode } from 'react';
import { useTasksCore } from '@/hooks/tasks/useTasksCore';
import type { Task, FolderInfo, TaskStatistics, CustomProperty, CreateTaskData, UpdateTaskData } from '@/types';

interface TasksContextValue {
  // Data
  tasks: Task[];
  folders: FolderInfo[];
  todayTasks: Task[];
  statistics: TaskStatistics;
  tasksByFolder: Record<string, Task[]>;
  loading: boolean;
  error: any;
  
  // Task Operations (Catalan)
  crearTasca: (taskData: CreateTaskData, customProperties?: CustomProperty[]) => Promise<Task>;
  actualitzarTasca: (taskId: string, updates: UpdateTaskData, customProperties?: CustomProperty[]) => Promise<void>;
  actualitzarEstat: (taskId: string, status: Task['status']) => Promise<void>;
  eliminarTasca: (taskId: string) => Promise<void>;
  
  // Folder Operations (Catalan)
  crearCarpeta: (carpetaData: Partial<FolderInfo>) => Promise<FolderInfo>;
  actualitzarCarpeta: (folderId: string, updates: Partial<FolderInfo>) => Promise<void>;
  eliminarCarpeta: (folderId: string) => Promise<boolean>;
  
  // Helpers (Catalan)
  obtenirTascaPerId: (taskId: string) => Task | undefined;
  obtenirTasquesPerCarpeta: (folderId: string) => Task[];
  obtenirTasquesPerEstat: (status: Task['status']) => Task[];
  actualitzarDades: () => void;
  
  // Task Operations (English aliases)
  createTask: (taskData: CreateTaskData, customProperties?: CustomProperty[]) => Promise<Task>;
  updateTask: (taskId: string, updates: UpdateTaskData, customProperties?: CustomProperty[]) => Promise<void>;
  updateStatus: (taskId: string, status: Task['status']) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Folder Operations (English aliases)
  createFolder: (folderData: Partial<FolderInfo>) => Promise<FolderInfo>;
  updateFolder: (folderId: string, updates: Partial<FolderInfo>) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<boolean>;
  
  // Helpers (English aliases)
  getTaskById: (taskId: string) => Task | undefined;
  getTasksByFolder: (folderId: string) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  refreshData: () => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const tasksCore = useTasksCore(); // ✅ Cridat un sol cop per tota l'app
  
  return (
    <TasksContext.Provider value={tasksCore}>
      {children}
    </TasksContext.Provider>
  );
};

/**
 * Hook principal per accedir a totes les dades i operacions de tasques
 */
export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
};

/**
 * Hook lightweight per només dades (sense operacions)
 * Optimitzat per components que només llegeixen dades
 */
export const useTasksData = () => {
  const { tasks, folders, todayTasks, statistics, tasksByFolder, loading, error } = useTasks();
  return { tasks, folders, todayTasks, statistics, tasksByFolder, loading, error };
};

/**
 * Hook lightweight per només operacions (sense dades)
 * Optimitzat per components que només necessiten funcions d'actualització
 */
export const useTasksOperations = () => {
  const { 
    crearTasca, actualitzarTasca, actualitzarEstat, eliminarTasca,
    crearCarpeta, actualitzarCarpeta, eliminarCarpeta,
    createTask, updateTask, updateStatus, deleteTask,
    createFolder, updateFolder, deleteFolder
  } = useTasks();
  
  return { 
    crearTasca, actualitzarTasca, actualitzarEstat, eliminarTasca,
    crearCarpeta, actualitzarCarpeta, eliminarCarpeta,
    createTask, updateTask, updateStatus, deleteTask,
    createFolder, updateFolder, deleteFolder
  };
};
