import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toastUtils";
import { useAuth } from "./useAuth";
import { useProperties } from "./useProperties";
import { useAuthGuard } from "./useAuthGuard";
import { logger } from "@/lib/logger";

import type { 
  Tasca, 
  Carpeta, 
  EstadistiquesTasques, 
  DadesOptimitzades,
  CrearTascaData,
  ActualitzarTascaData,
  ActualitzarCarpetaData 
} from "@/types";

// Clau de cache unificada
const CLAU_CACHE_DADES = 'dades-app';

export const useDadesApp = () => {
  const { user } = useAuth();
  const { withAuthGuard } = useAuthGuard();
  
  const queryClient = useQueryClient();
  const { setTaskProperty, getPropertyByName } = useProperties();
  
  const handleError = useCallback((error: Error) => {
    toast.error("Error", {
      description: error.message || "S'ha produït un error inesperat",
    });
  }, []);

  // Optimized parallel data fetching with React Query
  const { data, isLoading: loading, error } = useQuery({
    queryKey: [CLAU_CACHE_DADES, user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // Verify session is valid before fetching data
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Sessió no vàlida. Si us plau, torna a iniciar sessió.");
      }

      const [tasksResult, foldersResult] = await Promise.all([
        supabase
          .from("tasks")
          .select(`
            id, title, description, status, priority, folder_id, due_date, created_at, updated_at, completed_at,
            folder:folders(id, name, color)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("folders")
          .select("id, name, color, is_system, icon, is_smart, smart_rules")
          .eq("user_id", user.id)
          .order("is_system", { ascending: false })
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (foldersResult.error) throw foldersResult.error;

      return {
        tasks: (tasksResult.data || []) as Tasca[],
        folders: (foldersResult.data || []) as Carpeta[],
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes - Fresher data for dynamic tasks
    gcTime: 10 * 60 * 1000, // 10 minutes - Keep in memory longer
    refetchOnWindowFocus: true, // Auto-refresh when user returns
    refetchOnMount: true, // Refresh on component mount for latest data
    refetchOnReconnect: true, // Refresh when connection restored
    refetchInterval: false, // Disable automatic background refetching
    notifyOnChangeProps: ['data', 'error'] // Only notify on data/error changes
  });

  // Optimized data processing with memoization
  const dadesOptimitzades: DadesOptimitzades | null = useMemo(() => {
    if (!data) return null;

    const { tasks, folders } = data;

    // Calculate task statistics efficiently
    const estadistiquesTasques: EstadistiquesTasques = {
      total: tasks.length,
      completades: tasks.filter(task => task.status === "completat").length,
      enProces: tasks.filter(task => task.status === "en_proces").length,
      pendents: tasks.filter(task => task.status === "pendent").length,
    };

    // Group tasks by folder efficiently
    const tasquesPerCarpeta = tasks.reduce((acc, task) => {
      const folderId = task.folder_id || 'inbox';
      if (!acc[folderId]) acc[folderId] = [];
      acc[folderId].push(task);
      return acc;
    }, {} as Record<string, Tasca[]>);

    // Filter today's tasks efficiently - Use explicit is_today flag OR due_date=today
    const today = new Date().toISOString().split('T')[0];
    const tasquesAvui = tasks.filter(task => {
      if (task.status === "completat") return false;
      
      // Tasks explicitly marked for today OR tasks with due date today
      return task.is_today === true || task.due_date === today;
    });

    return {
      tasques: tasks,
      carpetes: folders,
      estadistiquesTasques,
      tasquesPerCarpeta,
      tasquesAvui,
    };
  }, [data]);

  // Task creation with enhanced optimistic updates and authentication guard
  const crearTasca = useCallback(async (taskData: CrearTascaData) => {
    return withAuthGuard(async () => {
      if (!user) {
        logger.error('useDadesApp', 'User not authenticated in crearTasca');
        throw new Error("User not authenticated");
      }

      logger.debug('useDadesApp', 'Authenticated, proceeding with task creation', { userId: user.id });

    // Normalize and map old English values to Catalan (safeguard)
    const statusMapping: Record<string, string> = {
      'pending': 'pendent',
      'in_progress': 'en_proces', 
      'completed': 'completat'
    };
    const priorityMapping: Record<string, string> = {
      'low': 'baixa',
      'medium': 'mitjana',
      'high': 'alta'
    };

    // Normalize task data - convert empty strings to null and map values
    const taskDataNormalized = {
      title: taskData.title?.trim() || '',
      description: taskData.description?.trim() || null,
      due_date: taskData.due_date || null,
      status: statusMapping[taskData.status] || taskData.status || 'pendent',
      priority: priorityMapping[taskData.priority] || taskData.priority || 'mitjana',
      folder_id: taskData.folder_id || null,
      is_today: taskData.is_today || false
    };

    logger.debug('useDadesApp', 'Creating task with normalized data', taskDataNormalized);

    const optimisticTask = {
      ...taskDataNormalized,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Tasca;

    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE_DADES, user.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: [optimisticTask, ...old.tasks]
      };
    });

    try {
      // Find inbox folder efficiently
      let finalFolderId = taskDataNormalized.folder_id;
      if (!finalFolderId) {
        const inboxFolder = dadesOptimitzades?.carpetes.find(f => f.is_system && f.name === "Bustia");
        if (!inboxFolder) {
          const { data: dbInboxFolder } = await supabase
            .from("folders")
            .select("id")
            .eq("user_id", user.id)
            .eq("is_system", true)
            .eq("name", "Bustia")
            .maybeSingle();
          finalFolderId = dbInboxFolder?.id;
        } else {
          finalFolderId = inboxFolder.id;
        }
      }

      const insertData = {
        ...taskDataNormalized,
        user_id: user.id,
        folder_id: finalFolderId ?? null
      };

      logger.debug('useDadesApp', 'Inserting task to database', insertData);

      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert([insertData])
        .select("id, title, description, status, priority, folder_id, due_date, created_at, updated_at")
        .single();

      if (error) throw error;

      // Set task properties efficiently
      const propertyPromises = [];
      
      if (taskData.status) {
        const statusProperty = getPropertyByName('Estat');
        const statusOption = statusProperty?.options.find(opt => opt.value === taskData.status);
        if (statusProperty && statusOption) {
          propertyPromises.push(setTaskProperty(newTask.id, statusProperty.id, statusOption.id));
        }
      }

      if (taskData.priority) {
        const priorityProperty = getPropertyByName('Prioritat');
        const priorityOption = priorityProperty?.options.find(opt => opt.value === taskData.priority);
        if (priorityProperty && priorityOption) {
          propertyPromises.push(setTaskProperty(newTask.id, priorityProperty.id, priorityOption.id));
        }
      }

      // Execute property updates in parallel
      await Promise.all(propertyPromises);

      // Replace optimistic update with real data
      queryClient.setQueryData([CLAU_CACHE_DADES, user.id], (old: any) => {
        if (!old) return old;
        const updatedData = {
          ...old,
          tasks: [newTask, ...old.tasks.filter((t: Tasca) => t.id !== optimisticTask.id)]
        };
        
        logger.debug('useDadesApp', 'Task created and cache updated', { 
          taskId: newTask.id,
          taskTitle: newTask.title,
          totalTasks: updatedData.tasks.length
        });
        
        return updatedData;
      });

      toast.success("Tasca creada", {
        description: "La tasca s'ha creat correctament",
      });

      return newTask;
    } catch (error) {
      // Revert optimistic update
      queryClient.setQueryData([CLAU_CACHE_DADES, user.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t: Tasca) => t.id !== optimisticTask.id)
        };
      });
      
      handleError(error instanceof Error ? error : new Error("No s'ha pogut crear la tasca"));
      throw error;
    }
    });
  }, [user, dadesOptimitzades?.carpetes, queryClient, setTaskProperty, getPropertyByName, handleError, withAuthGuard]);

  // Task update with enhanced optimistic updates
  const actualitzarTasca = useCallback(async (taskId: string, taskData: ActualitzarTascaData) => {
    // Normalize task data - convert empty strings to null
    const taskDataNormalized = {
      ...taskData,
      description: taskData.description?.trim() || null,
      due_date: taskData.due_date || null,
      status: taskData.status || 'pendent',
      priority: taskData.priority || 'mitjana'
    };

    logger.debug('useDadesApp', 'Updating task with normalized data', taskDataNormalized);

    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE_DADES, user?.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.map((task: Tasca) =>
          task.id === taskId ? { ...task, ...taskDataNormalized } : task
        )
      };
    });

    try {
      const { error } = await supabase
        .from("tasks")
        .update(taskDataNormalized)
        .eq("id", taskId);

      if (error) throw error;

      toast.success("Tasca actualitzada", {
        description: "La tasca s'ha actualitzat correctament",
      });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData([CLAU_CACHE_DADES, user?.id], (old: any) => {
        if (!old) return old;
        // Find the original task and revert
        const originalTask = old.tasks.find((t: Tasca) => t.id === taskId);
        if (originalTask) {
          return {
            ...old,
            tasks: old.tasks.map((task: Tasca) =>
              task.id === taskId ? originalTask : task
            )
          };
        }
        return old;
      });
      handleError(error instanceof Error ? error : new Error("No s'ha pogut actualitzar la tasca"));
      throw error; // Re-throw to allow handling in UI
    }
  }, [user?.id, queryClient, toast, handleError]);

  // Task status update with property synchronization
  const actualitzarEstatTasca = useCallback(async (taskId: string, status: Tasca['status']) => {
    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE_DADES, user?.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.map((task: Tasca) =>
          task.id === taskId ? { ...task, status } : task
        )
      };
    });

    try {
      const updateData = {
        status,
        completed_at: status === 'completat' ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;

      // Update property efficiently
      const statusProperty = getPropertyByName('Estat');
      const statusOption = statusProperty?.options.find(opt => opt.value === status);
      if (statusProperty && statusOption) {
        await setTaskProperty(taskId, statusProperty.id, statusOption.id);
      }

      toast.success("Tasca actualitzada", {
        description: `Estat canviat a ${status}`,
      });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData([CLAU_CACHE_DADES, user?.id], (old: any) => {
        if (!old) return old;
        // Find the original task and revert status
        const originalTask = old.tasks.find((t: Tasca) => t.id === taskId);
        if (originalTask) {
          return {
            ...old,
            tasks: old.tasks.map((task: Tasca) =>
              task.id === taskId ? originalTask : task
            )
          };
        }
        return old;
      });
      handleError(error instanceof Error ? error : new Error("No s'ha pogut actualitzar la tasca"));
      throw error; // Re-throw to allow handling in UI
    }
  }, [user?.id, queryClient, toast, setTaskProperty, getPropertyByName, handleError]);

  // Task deletion with optimistic updates
  const eliminarTasca = useCallback(async (taskId: string) => {
    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE_DADES, user?.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.filter((task: Tasca) => task.id !== taskId)
      };
    });

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      toast.success("Tasca eliminada", {
        description: "La tasca s'ha eliminat correctament",
      });
    } catch (error) {
      // Revert optimistic update on error - restore the deleted task
      queryClient.setQueryData([CLAU_CACHE_DADES, user?.id], (old: any) => {
        if (!old) return old;
        // We need to restore the task - we'll need to refetch to get it back
        queryClient.invalidateQueries({ queryKey: [CLAU_CACHE_DADES, user?.id] });
        return old;
      });
      handleError(error instanceof Error ? error : new Error("No s'ha pogut eliminar la tasca"));
      throw error; // Re-throw to allow handling in UI
    }
  }, [user?.id, queryClient, toast, handleError]);

  // Folder creation with optimistic updates - supports both regular and smart folders
  const crearCarpeta = useCallback(async (carpetaData: any) => {
    if (!user) throw new Error("User not authenticated");

    const isSmartFolder = carpetaData.is_smart === true;
    
    // Prepare insert data
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
      queryClient.setQueryData([CLAU_CACHE_DADES, user.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          folders: [...old.folders, newFolder]
        };
      });

      // Force refresh to ensure all related data is updated
      queryClient.invalidateQueries({ queryKey: [CLAU_CACHE_DADES, user.id] });

      toast.success("Carpeta creada", {
        description: "La carpeta s'ha creat correctament",
      });
    } catch (error) {
      handleError(error instanceof Error ? error : new Error("No s'ha pogut crear la carpeta"));
    }
  }, [user, queryClient, toast, handleError]);

  // Folder update with optimistic updates
  const actualitzarCarpeta = useCallback(async (folderId: string, updates: ActualitzarCarpetaData) => {
    if (!user) throw new Error("User not authenticated");

    

    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE_DADES, user.id], (old: any) => {
      if (!old) return old;
      const updatedFolders = old.folders.map((folder: Carpeta) => 
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

      

      // Force invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: [CLAU_CACHE_DADES, user.id] });

      toast.success("Carpeta actualitzada", {
        description: "La carpeta s'ha actualitzat correctament",
      });
    } catch (error) {
      
      // Revert on error
      queryClient.invalidateQueries({ queryKey: [CLAU_CACHE_DADES, user.id] });
      handleError(error instanceof Error ? error : new Error("No s'ha pogut actualitzar la carpeta"));
    }
  }, [user?.id, queryClient, toast, handleError]);

  // Folder deletion with validation and optimistic updates
  const eliminarCarpeta = useCallback(async (folderId: string) => {
    if (!user) throw new Error("User not authenticated");

    // Check if folder has tasks
    const tasksInFolder = dadesOptimitzades?.tasques.filter(task => task.folder_id === folderId) || [];
    if (tasksInFolder.length > 0) {
      toast.error("No es pot eliminar", {
        description: `La carpeta conté ${tasksInFolder.length} tasques. Mou-les primer a una altra carpeta.`,
      });
      return false;
    }

    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE_DADES, user.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        folders: old.folders.filter((folder: Carpeta) => folder.id !== folderId)
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

      toast.success("Carpeta eliminada", {
        description: "La carpeta s'ha eliminat correctament",
      });
      return true;
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: [CLAU_CACHE_DADES, user.id] });
      handleError(error instanceof Error ? error : new Error("No s'ha pogut eliminar la carpeta"));
      return false;
    }
  }, [user, dadesOptimitzades?.tasques, queryClient, toast, handleError]);

  // Manual data refresh
  const actualitzarDades = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [CLAU_CACHE_DADES, user?.id] });
  }, [queryClient, user?.id]);

  return {
    // Raw data access
    data: dadesOptimitzades,
    loading,
    error,

    // Destructured for convenience
    tasks: dadesOptimitzades?.tasques || [],
    folders: dadesOptimitzades?.carpetes || [],
    taskStats: dadesOptimitzades?.estadistiquesTasques || { total: 0, completades: 0, enProces: 0, pendents: 0 },
    tasksByFolder: dadesOptimitzades?.tasquesPerCarpeta || {},
    todayTasks: dadesOptimitzades?.tasquesAvui || [],

    // Task operations (mantenim noms anglesos per compatibilitat)
    createTask: crearTasca,
    updateTask: actualitzarTasca,
    updateTaskStatus: actualitzarEstatTasca,
    deleteTask: eliminarTasca,

    // Folder operations (mantenim noms anglesos per compatibilitat)
    createFolder: crearCarpeta,
    updateFolder: actualitzarCarpeta,
    deleteFolder: eliminarCarpeta,

    // Utility
    refreshData: actualitzarDades,
  };
};