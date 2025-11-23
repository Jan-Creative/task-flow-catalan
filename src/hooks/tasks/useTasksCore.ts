/**
 * Hook Core de Tasques - Simplificat i Optimitzat
 * Substitueix: useDadesApp (només part de tasques), useTaskManager, useConsolidatedTaskManager, useTaskOperations
 * Manté: Nomenclatura Catalan per consistència amb l'app
 */

import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toastUtils";
import { useAuth } from "../useAuth";
import { useProperties } from "../useProperties";
import { logger } from "@/lib/logger";
import type { Task, FolderInfo, TaskStatistics, CustomProperty } from "@/types";

const CLAU_CACHE = 'tasks-core';

export const useTasksCore = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { setTaskProperty, getPropertyByName } = useProperties();

  // Fetch tasks and folders optimized
  const { data, isLoading: loading, error } = useQuery({
    queryKey: [CLAU_CACHE, user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Sessió no vàlida. Si us plau, torna a iniciar sessió.");
      }

      const [tasksResult, foldersResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, description, status, priority, folder_id, due_date, created_at, updated_at, is_today, time_block_id, scheduled_start_time, scheduled_end_time")
          .eq("user_id", user.id)
          .neq("status", "completat") // ✅ FASE 2: Només tasques actives
          .order("created_at", { ascending: false })
          .limit(100), // ✅ FASE 2: Limitar a 100 tasques actives
        supabase
          .from("folders")
          .select("id, name, color, is_system, icon, is_smart, smart_rules")
          .eq("user_id", user.id)
          .order("is_system", { ascending: false })
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (foldersResult.error) throw foldersResult.error;

      return {
        tasks: (tasksResult.data || []) as Task[],
        folders: (foldersResult.data || []) as FolderInfo[],
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchInterval: false,
  });

  // Processed data with memoization
  const processedData = useMemo(() => {
    if (!data) return null;

    const { tasks, folders } = data;
    const today = new Date().toISOString().split('T')[0];

    // Statistics
    const statistics: TaskStatistics = {
      total: tasks.length,
      completades: tasks.filter(t => t.status === "completat").length,
      enProces: tasks.filter(t => t.status === "en_proces").length,
      pendents: tasks.filter(t => t.status === "pendent").length,
      overdue: tasks.filter(t => {
        if (!t.due_date || t.status === "completat") return false;
        return t.due_date < today;
      }).length,
    };

    // Today tasks
    const todayTasks = tasks.filter(t => {
      if (t.is_today) return true;
      if (!t.due_date) return false;
      return t.due_date === today;
    });

    // Tasks by folder
    const tasksByFolder: Record<string, Task[]> = {};
    tasks.forEach(task => {
      const folderId = task.folder_id || 'inbox';
      if (!tasksByFolder[folderId]) tasksByFolder[folderId] = [];
      tasksByFolder[folderId].push(task);
    });

    return {
      tasks,
      folders,
      todayTasks,
      statistics,
      tasksByFolder,
    };
  }, [data]);

  // CREATE TASK with optimistic update
  const crearTasca = useCallback(async (
    taskData: Partial<Task>,
    customProperties?: CustomProperty[]
  ) => {
    if (!user) throw new Error("User not authenticated");

    const priorityMapping: Record<string, string> = {
      'alta': 'alta',
      'high': 'alta',
      'mitjana': 'mitjana',
      'medium': 'mitjana',
      'baixa': 'baixa',
      'low': 'baixa',
      'urgent': 'urgent'
    };

    const normalizedData = {
      title: taskData.title || '',
      description: taskData.description || null,
      status: taskData.status || 'pendent',
      due_date: taskData.due_date || null,
      priority: priorityMapping[taskData.priority || ''] || 'mitjana',
      folder_id: taskData.folder_id || null,
      is_today: taskData.is_today || false,
      time_block_id: taskData.time_block_id || null,
      scheduled_start_time: taskData.scheduled_start_time || null,
      scheduled_end_time: taskData.scheduled_end_time || null,
    };

    const optimisticTask: Task = {
      ...normalizedData,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    } as Task;

    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE, user.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: [optimisticTask, ...old.tasks]
      };
    });

    try {
      // Find inbox if no folder specified
      let finalFolderId = normalizedData.folder_id;
      if (!finalFolderId && processedData) {
        const inboxFolder = processedData.folders.find(f => f.is_system && f.name === "Bustia");
        if (inboxFolder) {
          finalFolderId = inboxFolder.id;
        }
      }

      const insertData = {
        ...normalizedData,
        user_id: user.id,
        folder_id: finalFolderId ?? null
      };

      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      // Apply custom properties if provided
      if (customProperties && customProperties.length > 0) {
        await Promise.all(
          customProperties.map(prop => 
            setTaskProperty(newTask.id, prop.propertyId, prop.optionId)
          )
        );
      }

      // Replace optimistic with real data
      queryClient.setQueryData([CLAU_CACHE, user.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: [newTask, ...old.tasks.filter((t: Task) => t.id !== optimisticTask.id)]
        };
      });

      logger.info('useTasksCore', 'Task created successfully', { taskId: newTask.id });
      toast.success("Tasca creada correctament");

      return newTask;
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData([CLAU_CACHE, user.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t: Task) => t.id !== optimisticTask.id)
        };
      });

      logger.error('useTasksCore', 'Failed to create task', error);
      toast.error("Error al crear la tasca");
      throw error;
    }
  }, [user, queryClient, processedData, setTaskProperty]);

  // UPDATE TASK with optimistic update
  const actualitzarTasca = useCallback(async (
    taskId: string,
    updates: Partial<Task>,
    customProperties?: CustomProperty[]
  ) => {
    if (!user) throw new Error("User not authenticated");

    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE, user.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.map((t: Task) =>
          t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
        )
      };
    });

    try {
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Apply custom properties if provided
      if (customProperties && customProperties.length > 0) {
        await Promise.all(
          customProperties.map(prop =>
            setTaskProperty(taskId, prop.propertyId, prop.optionId)
          )
        );
      }

      toast.success("Tasca actualitzada correctament");
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: [CLAU_CACHE, user.id] });
      logger.error('useTasksCore', 'Failed to update task', error);
      toast.error("Error al actualitzar la tasca");
      throw error;
    }
  }, [user, queryClient, setTaskProperty]);

  // UPDATE STATUS (shortcut)
  const actualitzarEstat = useCallback(async (taskId: string, status: Task['status']) => {
    const updates: any = { status };
    if (status === "completat") {
      updates.completed_at = new Date().toISOString();
    }
    return actualitzarTasca(taskId, updates);
  }, [actualitzarTasca]);

  // DELETE TASK with optimistic update
  const eliminarTasca = useCallback(async (taskId: string) => {
    if (!user) throw new Error("User not authenticated");

    // Store deleted task for revert
    const deletedTask = processedData?.tasks.find(t => t.id === taskId);

    // Optimistic delete
    queryClient.setQueryData([CLAU_CACHE, user.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.filter((t: Task) => t.id !== taskId)
      };
    });

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Tasca eliminada correctament");
    } catch (error) {
      // Revert on error
      if (deletedTask) {
        queryClient.setQueryData([CLAU_CACHE, user.id], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            tasks: [deletedTask, ...old.tasks]
          };
        });
      }
      logger.error('useTasksCore', 'Failed to delete task', error);
      toast.error("Error al eliminar la tasca");
      throw error;
    }
  }, [user, queryClient, processedData]);

  // HELPERS
  const obtenirTascaPerId = useCallback((taskId: string) => {
    return processedData?.tasks.find(t => t.id === taskId);
  }, [processedData]);

  const obtenirTasquesPerCarpeta = useCallback((folderId: string) => {
    return processedData?.tasksByFolder[folderId] || [];
  }, [processedData]);

  const obtenirTasquesPerEstat = useCallback((status: Task['status']) => {
    return processedData?.tasks.filter(t => t.status === status) || [];
  }, [processedData]);

  const actualitzarDades = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [CLAU_CACHE, user?.id] });
  }, [queryClient, user?.id]);

  // CREATE FOLDER with optimistic update
  const crearCarpeta = useCallback(async (carpetaData: any) => {
    if (!user) throw new Error("User not authenticated");

    const isSmartFolder = carpetaData.is_smart === true;
    
    const insertData: any = {
      name: carpetaData.name || carpetaData,
      color: carpetaData.color || "#6366f1",
      icon: carpetaData.icon,
      user_id: user.id,
    };

    if (isSmartFolder) {
      insertData.is_smart = true;
      insertData.smart_rules = carpetaData.smart_rules;
    }

    try {
      const { data: newFolder, error } = await supabase
        .from("folders")
        .insert(insertData)
        .select("id, name, color, is_system, icon, is_smart, smart_rules")
        .single();

      if (error) throw error;

      // Update cache with new folder
      queryClient.setQueryData([CLAU_CACHE, user.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          folders: [...old.folders, newFolder]
        };
      });

      toast.success("Carpeta creada correctament");
      return newFolder;
    } catch (error) {
      logger.error('useTasksCore', 'Failed to create folder', error);
      toast.error("Error al crear la carpeta");
      throw error;
    }
  }, [user, queryClient]);

  // UPDATE FOLDER with optimistic update
  const actualitzarCarpeta = useCallback(async (folderId: string, updates: Partial<FolderInfo>) => {
    if (!user) throw new Error("User not authenticated");

    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE, user.id], (old: any) => {
      if (!old) return old;
      const updatedFolders = old.folders.map((folder: FolderInfo) => 
        folder.id === folderId ? { ...folder, ...updates } : folder
      );
      
      return {
        ...old,
        folders: updatedFolders
      };
    });

    try {
      const { error } = await supabase
        .from("folders")
        .update(updates)
        .eq("id", folderId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Carpeta actualitzada correctament");
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: [CLAU_CACHE, user.id] });
      logger.error('useTasksCore', 'Failed to update folder', error);
      toast.error("Error al actualitzar la carpeta");
      throw error;
    }
  }, [user, queryClient]);

  // DELETE FOLDER with validation and optimistic update
  const eliminarCarpeta = useCallback(async (folderId: string) => {
    if (!user) throw new Error("User not authenticated");

    // Check if folder has tasks
    const tasksInFolder = processedData?.tasks.filter(task => task.folder_id === folderId) || [];
    if (tasksInFolder.length > 0) {
      toast.error(`No es pot eliminar la carpeta perquè conté ${tasksInFolder.length} tasques. Mou-les primer a una altra carpeta.`);
      return false;
    }

    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE, user.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        folders: old.folders.filter((folder: FolderInfo) => folder.id !== folderId)
      };
    });

    try {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId)
        .eq("user_id", user.id)
        .eq("is_system", false);

      if (error) throw error;

      toast.success("Carpeta eliminada correctament");
      return true;
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: [CLAU_CACHE, user.id] });
      logger.error('useTasksCore', 'Failed to delete folder', error);
      toast.error("Error al eliminar la carpeta");
      return false;
    }
  }, [user, processedData, queryClient]);

  return {
    // Data
    tasks: processedData?.tasks || [],
    folders: processedData?.folders || [],
    todayTasks: processedData?.todayTasks || [],
    statistics: processedData?.statistics || { total: 0, completades: 0, enProces: 0, pendents: 0, overdue: 0 },
    tasksByFolder: processedData?.tasksByFolder || {},
    loading,
    error,

    // Task Operations (Catalan naming)
    crearTasca,
    actualitzarTasca,
    actualitzarEstat,
    eliminarTasca,

    // Folder Operations (Catalan naming)
    crearCarpeta,
    actualitzarCarpeta,
    eliminarCarpeta,

    // Helpers (Catalan naming)
    obtenirTascaPerId,
    obtenirTasquesPerCarpeta,
    obtenirTasquesPerEstat,
    actualitzarDades,
    
    // English aliases for compatibility
    createTask: crearTasca,
    updateTask: actualitzarTasca,
    updateStatus: actualitzarEstat,
    deleteTask: eliminarTasca,
    createFolder: crearCarpeta,
    updateFolder: actualitzarCarpeta,
    deleteFolder: eliminarCarpeta,
    getTaskById: obtenirTascaPerId,
    getTasksByFolder: obtenirTasquesPerCarpeta,
    getTasksByStatus: obtenirTasquesPerEstat,
    refreshData: actualitzarDades,
  };
};
