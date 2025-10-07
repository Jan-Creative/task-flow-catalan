/**
 * Offline-first tasks hook
 * Provides tasks data with offline fallback and optimistic updates
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useOfflineContext } from '@/contexts/OfflineContext';
import { useDadesApp } from './useDadesApp';
import { offlineStorage } from '@/lib/offlineStorage';
import type { Tasca, CrearTascaData, ActualitzarTascaData } from '@/types';
import { logger } from '@/lib/logger';

export const useOfflineTasks = () => {
  const { user } = useAuth();
  const { isOnline, isOfflineMode, addMutation, getOfflineData } = useOfflineContext();
  const queryClient = useQueryClient();
  
  // Use online hook when available
  const onlineData = useDadesApp();
  
  // Local state for offline data
  const [offlineData, setOfflineData] = useState<{
    tasks: Tasca[];
    folders: any[];
    lastUpdated: number;
  }>({
    tasks: [],
    folders: [],
    lastUpdated: 0
  });

  // Load offline data when needed
  useEffect(() => {
    const loadOfflineData = async () => {
      if (!user || (isOnline && !isOfflineMode)) return;

      try {
        const data = await getOfflineData();
        setOfflineData({
          tasks: data.tasks,
          folders: data.folders,
          lastUpdated: Date.now()
        });
      } catch (error) {
        logger.error('useOfflineTasks', 'Failed to load offline data', error);
      }
    };

    loadOfflineData();
  }, [user, isOnline, isOfflineMode, getOfflineData]);

  // Determine which data source to use
  const shouldUseOfflineData = !isOnline || isOfflineMode;
  
  const tasks = useMemo(() => {
    if (shouldUseOfflineData) {
      return offlineData.tasks;
    }
    return onlineData.tasks || [];
  }, [shouldUseOfflineData, offlineData.tasks, onlineData.tasks]);

  const folders = useMemo(() => {
    if (shouldUseOfflineData) {
      return offlineData.folders;
    }
    return onlineData.folders || [];
  }, [shouldUseOfflineData, offlineData.folders, onlineData.folders]);

  const loading = useMemo(() => {
    if (shouldUseOfflineData) {
      return false; // Offline data is loaded synchronously
    }
    return onlineData.loading;
  }, [shouldUseOfflineData, onlineData.loading]);

  const error = useMemo(() => {
    if (shouldUseOfflineData) {
      return null; // No errors in offline mode
    }
    return onlineData.error;
  }, [shouldUseOfflineData, onlineData.error]);

  // Generate temporary ID for offline tasks
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create task with offline support
  const createTask = useCallback(async (taskData: CrearTascaData) => {
    if (!user) throw new Error('User not authenticated');

    const tempId = generateTempId();
    const tempTask: Tasca = {
      id: tempId,
      title: taskData.title?.trim() || '',
      description: taskData.description?.trim() || null,
      status: taskData.status || 'pendent',
      priority: taskData.priority || 'mitjana',
      folder_id: taskData.folder_id || null,
      due_date: taskData.due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      user_id: user.id,
      folder: null
    };

    try {
      if (isOnline && !isOfflineMode) {
        // Online mode - use standard create
        return await onlineData.createTask(taskData);
      } else {
        // Offline mode - add to local storage and queue
        await offlineStorage.put('tasks', tempTask);
        await addMutation('CREATE_TASK', taskData, tempId);

        // Update local state
        setOfflineData(prev => ({
          ...prev,
          tasks: [tempTask, ...prev.tasks],
          lastUpdated: Date.now()
        }));

        return tempTask;
      }
    } catch (error) {
      logger.error('useOfflineTasks', 'Failed to create task', error);
      throw error;
    }
  }, [user, isOnline, isOfflineMode, onlineData.createTask, addMutation]);

  // Update task with offline support
  const updateTask = useCallback(async (taskId: string, updates: ActualitzarTascaData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      if (isOnline && !isOfflineMode) {
        // Online mode - use standard update
        return await onlineData.updateTask(taskId, updates);
      } else {
        // Offline mode - update local storage and queue
        const existingTask = tasks.find(t => t.id === taskId);
        if (!existingTask) throw new Error('Task not found');

        const updatedTask = {
          ...existingTask,
          ...updates,
          updated_at: new Date().toISOString()
        };

        await offlineStorage.put('tasks', updatedTask);
        await addMutation('UPDATE_TASK', { taskId, ...updates });

        // Update local state
        setOfflineData(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t),
          lastUpdated: Date.now()
        }));

        return updatedTask;
      }
    } catch (error) {
      logger.error('useOfflineTasks', 'Failed to update task', error);
      throw error;
    }
  }, [user, isOnline, isOfflineMode, tasks, onlineData.updateTask, addMutation]);

  // Update task status with offline support
  const updateTaskStatus = useCallback(async (taskId: string, status: Tasca['status']) => {
    const updates: any = {
      status
    };
    
    // Only add completed_at if status is completat
    if (status === 'completat') {
      updates.completed_at = new Date().toISOString();
    }
    
    return updateTask(taskId, updates);
  }, [updateTask]);

  // Delete task with offline support
  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      if (isOnline && !isOfflineMode) {
        // Online mode - use standard delete
        return await onlineData.deleteTask(taskId);
      } else {
        // Offline mode - remove from local storage and queue deletion
        await offlineStorage.delete('tasks', taskId);
        await addMutation('DELETE_TASK', { taskId });

        // Update local state
        setOfflineData(prev => ({
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== taskId),
          lastUpdated: Date.now()
        }));
      }
    } catch (error) {
      logger.error('useOfflineTasks', 'Failed to delete task', error);
      throw error;
    }
  }, [user, isOnline, isOfflineMode, onlineData.deleteTask, addMutation]);

  // Computed properties
  const taskStats = useMemo(() => {
    const stats = {
      total: tasks.length,
      completades: tasks.filter(t => t.status === 'completat').length,
      enProces: tasks.filter(t => t.status === 'en_proces').length,
      pendents: tasks.filter(t => t.status === 'pendent').length
    };
    return stats;
  }, [tasks]);

  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      task.due_date === today || 
      (task.status !== 'completat' && !task.due_date)
    );
  }, [tasks]);

  const tasksByFolder = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const folderId = task.folder_id || 'inbox';
      if (!acc[folderId]) acc[folderId] = [];
      acc[folderId].push(task);
      return acc;
    }, {} as Record<string, Tasca[]>);
  }, [tasks]);

  // Refresh data
  const refreshData = useCallback(() => {
    if (isOnline && !isOfflineMode) {
      onlineData.refreshData();
    } else {
      // Reload offline data
      getOfflineData().then(data => {
        setOfflineData({
          tasks: data.tasks,
          folders: data.folders,
          lastUpdated: Date.now()
        });
      });
    }
  }, [isOnline, isOfflineMode, onlineData.refreshData, getOfflineData]);

  return {
    // Data
    tasks,
    folders,
    taskStats,
    tasksByFolder,
    todayTasks,
    
    // State
    loading,
    error,
    isOfflineMode: shouldUseOfflineData,
    lastUpdated: shouldUseOfflineData ? offlineData.lastUpdated : Date.now(),
    
    // Operations
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    
    // Folder operations (delegate to online for now)
    createFolder: onlineData.createFolder,
    updateFolder: onlineData.updateFolder,
    deleteFolder: onlineData.deleteFolder,
    
    // Utility
    refreshData
  };
};