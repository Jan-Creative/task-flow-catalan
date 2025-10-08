/**
 * Offline Context - Manages offline state, mutation queue, and synchronization
 * Provides offline-first functionality for the entire app
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOptionalAuth } from '@/hooks/useOptionalAuth';
import { offlineStorage, type OfflineMutation, type MutationType } from '@/lib/offlineStorage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toastUtils';

export interface OfflineContextValue {
  // Connection state
  isOnline: boolean;
  isOfflineMode: boolean;
  
  // Sync state
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingMutations: number;
  
  // Queue management
  addMutation: (type: MutationType, data: any, tempId?: string) => Promise<string>;
  clearMutations: () => Promise<void>;
  forcSync: () => Promise<void>;
  
  // Offline data access
  getOfflineData: () => Promise<{ tasks: any[], folders: any[], properties: any[] }>;
  
  // Settings
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export const useOfflineContext = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineContext must be used within OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: React.ReactNode;
}

export const OfflineProvider = ({ children }: OfflineProviderProps) => {
  const { user } = useOptionalAuth();
  const queryClient = useQueryClient();
  
  // State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [pendingMutations, setPendingMutations] = useState(0);
  
  // Refs for managing intervals and timeouts
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize offline storage
  useEffect(() => {
    const initStorage = async () => {
      try {
        await offlineStorage.init();
        console.log('📱 Offline storage initialized');
        
        // Load pending mutations count
        if (user) {
          const mutations = await offlineStorage.getMutations(user.id);
          setPendingMutations(mutations.length);
        }
      } catch (error) {
        console.error('❌ Failed to initialize offline storage:', error);
      }
    };

    initStorage();
  }, [user]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connection restored');
      setIsOnline(true);
      if (user && pendingMutations > 0) {
        forcSync();
      }
    };

    const handleOffline = () => {
      console.log('📴 Connection lost');
      setIsOnline(false);
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, pendingMutations]);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && user && pendingMutations > 0) {
      // Clear any existing timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      // Start sync after a short delay
      retryTimeoutRef.current = setTimeout(() => {
        forcSync();
      }, 1000);
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isOnline, user, pendingMutations]);

  // Periodic sync when online
  useEffect(() => {
    if (isOnline && user) {
      syncIntervalRef.current = setInterval(() => {
        syncFromServer();
      }, 5 * 60 * 1000); // Sync every 5 minutes
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline, user]);

  // Generate unique ID for mutations
  const generateMutationId = () => `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add mutation to queue
  const addMutation = useCallback(async (type: MutationType, data: any, tempId?: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const mutationId = generateMutationId();
    const mutation: OfflineMutation = {
      id: mutationId,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      tempId,
      userId: user.id
    };

    try {
      await offlineStorage.addMutation(mutation);
      setPendingMutations(prev => prev + 1);
      
      console.log(`📝 Added ${type} mutation to queue:`, mutation);
      
      // Try to sync immediately if online
      if (isOnline) {
        setTimeout(() => forcSync(), 100);
      }
      
      return mutationId;
    } catch (error) {
      console.error('❌ Failed to add mutation:', error);
      throw error;
    }
  }, [user, isOnline]);

  // Clear all mutations
  const clearMutations = useCallback(async () => {
    if (!user) return;

    try {
      await offlineStorage.clearMutations(user.id);
      setPendingMutations(0);
      console.log('🗑️ Cleared all mutations');
    } catch (error) {
      console.error('❌ Failed to clear mutations:', error);
    }
  }, [user]);

  // Execute a single mutation
  const executeMutation = async (mutation: OfflineMutation): Promise<boolean> => {
    try {
      switch (mutation.type) {
        case 'CREATE_TASK': {
          const { error } = await supabase
            .from('tasks')
            .insert([{ ...mutation.data, user_id: user!.id }]);
          
          if (error) throw error;
          break;
        }
        
        case 'UPDATE_TASK': {
          const { taskId, ...updates } = mutation.data;
          const { error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .eq('user_id', user!.id);
          
          if (error) throw error;
          break;
        }
        
        case 'DELETE_TASK': {
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', mutation.data.taskId)
            .eq('user_id', user!.id);
          
          if (error) throw error;
          break;
        }
        
        case 'CREATE_FOLDER': {
          const { error } = await supabase
            .from('folders')
            .insert([{ ...mutation.data, user_id: user!.id }]);
          
          if (error) throw error;
          break;
        }
        
        case 'UPDATE_FOLDER': {
          const { folderId, ...updates } = mutation.data;
          const { error } = await supabase
            .from('folders')
            .update(updates)
            .eq('id', folderId)
            .eq('user_id', user!.id);
          
          if (error) throw error;
          break;
        }
        
        case 'DELETE_FOLDER': {
          const { error } = await supabase
            .from('folders')
            .delete()
            .eq('id', mutation.data.folderId)
            .eq('user_id', user!.id);
          
          if (error) throw error;
          break;
        }
        
        case 'SET_TASK_PROPERTY': {
          const { taskId, propertyId, optionId } = mutation.data;
          const { error } = await supabase
            .from('task_properties')
            .upsert([
              {
                task_id: taskId,
                property_id: propertyId,
                option_id: optionId,
                user_id: user!.id
              }
            ]);
          
          if (error) throw error;
          break;
        }
        
        default:
          console.warn('❓ Unknown mutation type:', mutation.type);
          return false;
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to execute ${mutation.type} mutation:`, error);
      return false;
    }
  };

  // Sync mutations to server
  const forcSync = useCallback(async () => {
    if (!user || !isOnline || isSyncing) return;

    console.log('🔄 Starting sync...');
    setIsSyncing(true);

    try {
      const mutations = await offlineStorage.getMutations(user.id);
      
      if (mutations.length === 0) {
        console.log('✅ No mutations to sync');
        setIsSyncing(false);
        return;
      }

      console.log(`📤 Syncing ${mutations.length} mutations...`);
      
      let successCount = 0;
      const failedMutations: OfflineMutation[] = [];

      for (const mutation of mutations) {
        const success = await executeMutation(mutation);
        
        if (success) {
          await offlineStorage.removeMutation(mutation.id);
          successCount++;
        } else {
          // Increment retry count
          const updatedMutation = {
            ...mutation,
            retryCount: mutation.retryCount + 1
          };
          
          // Remove if too many retries
          if (updatedMutation.retryCount >= 3) {
            await offlineStorage.removeMutation(mutation.id);
            console.warn(`❌ Giving up on mutation after 3 retries:`, mutation);
          } else {
            await offlineStorage.addMutation(updatedMutation);
            failedMutations.push(updatedMutation);
          }
        }
      }

      // Update pending count
      const remainingMutations = await offlineStorage.getMutations(user.id);
      setPendingMutations(remainingMutations.length);

      // Invalidate queries to refresh data
      if (successCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['dades-app', user.id] });
      }

      setLastSyncTime(Date.now());
      
      if (successCount > 0) {
        toast.success('Sincronització completa', {
          description: `${successCount} canvis sincronitzats correctament`
        });
      }

      if (failedMutations.length > 0) {
        toast.error('Alguns canvis no s\'han pogut sincronitzar', {
          description: `${failedMutations.length} operacions fallides`
        });
      }

      console.log(`✅ Sync completed: ${successCount} successful, ${failedMutations.length} failed`);
    } catch (error) {
      console.error('❌ Sync failed:', error);
      toast.error('Error de sincronització', {
        description: 'No s\'ha pogut sincronitzar amb el servidor'
      });
    } finally {
      setIsSyncing(false);
    }
  }, [user, isOnline, isSyncing, queryClient]);

  // Sync data from server to local storage
  const syncFromServer = useCallback(async () => {
    if (!user || !isOnline) return;

    try {
      const [tasksResult, foldersResult, propertiesResult] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('folders')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('property_definitions')
          .select('*, property_options(*)')
          .eq('user_id', user.id)
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (foldersResult.error) throw foldersResult.error;
      if (propertiesResult.error) throw propertiesResult.error;

      await offlineStorage.syncUserData(user.id, {
        tasks: tasksResult.data || [],
        folders: foldersResult.data || [],
        properties: propertiesResult.data || []
      });

      await offlineStorage.setSyncMetadata(`user_${user.id}`, Date.now());
      
      console.log('📥 Data synced from server to local storage');
    } catch (error) {
      console.error('❌ Failed to sync from server:', error);
    }
  }, [user, isOnline]);

  // Get offline data
  const getOfflineData = useCallback(async () => {
    if (!user) {
      return { tasks: [], folders: [], properties: [] };
    }

    try {
      const [tasks, folders, properties] = await Promise.all([
        offlineStorage.getUserTasks(user.id),
        offlineStorage.getUserFolders(user.id),
        offlineStorage.getUserProperties(user.id)
      ]);

      return { tasks, folders, properties };
    } catch (error) {
      console.error('❌ Failed to get offline data:', error);
      return { tasks: [], folders: [], properties: [] };
    }
  }, [user]);

  // Manual offline mode control
  const enableOfflineMode = useCallback(() => {
    setIsOfflineMode(true);
    console.log('📴 Offline mode enabled');
  }, []);

  const disableOfflineMode = useCallback(() => {
    setIsOfflineMode(false);
    if (isOnline && pendingMutations > 0) {
      forcSync();
    }
    console.log('🌐 Offline mode disabled');
  }, [isOnline, pendingMutations, forcSync]);

  const contextValue: OfflineContextValue = {
    isOnline,
    isOfflineMode,
    isSyncing,
    lastSyncTime,
    pendingMutations,
    addMutation,
    clearMutations,
    forcSync,
    getOfflineData,
    enableOfflineMode,
    disableOfflineMode
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};