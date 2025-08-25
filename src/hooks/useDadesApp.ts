import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toastUtils";
import { useAuth } from "./useAuth";
import { useProperties } from "./useProperties";

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

      const [tasksResult, foldersResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, description, status, priority, folder_id, due_date, created_at, updated_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("folders")
          .select("id, name, color, is_system, icon")
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
    staleTime: 1000 * 60 * 15, // 15 minutes - Extended cache
    gcTime: 1000 * 60 * 30, // 30 minutes  
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent unnecessary refetches
    refetchOnReconnect: false,
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

    // Filter today's tasks efficiently
    const today = new Date().toISOString().split('T')[0];
    const tasquesAvui = tasks.filter(task => 
      task.due_date === today || 
      (task.status !== "completat" && !task.due_date)
    );

    return {
      tasques: tasks,
      carpetes: folders,
      estadistiquesTasques,
      tasquesPerCarpeta,
      tasquesAvui,
    };
  }, [data]);

  // Task creation with enhanced optimistic updates
  const crearTasca = useCallback(async (taskData: CrearTascaData) => {
    if (!user) throw new Error("User not authenticated");

    const optimisticTask = {
      ...taskData,
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
      let finalFolderId = taskData.folder_id;
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

      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert([{ ...taskData, user_id: user.id, folder_id: finalFolderId }])
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
        return {
          ...old,
          tasks: [newTask, ...old.tasks.filter((t: Tasca) => t.id !== optimisticTask.id)]
        };
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
  }, [user, dadesOptimitzades?.carpetes, queryClient, setTaskProperty, getPropertyByName, handleError]);

  // Task update with enhanced optimistic updates
  const actualitzarTasca = useCallback(async (taskId: string, taskData: ActualitzarTascaData) => {
    // Optimistic update
    queryClient.setQueryData([CLAU_CACHE_DADES, user?.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.map((task: Tasca) =>
          task.id === taskId ? { ...task, ...taskData } : task
        )
      };
    });

    try {
      const { error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", taskId);

      if (error) throw error;

      toast.success("Tasca actualitzada", {
        description: "La tasca s'ha actualitzat correctament",
      });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: [CLAU_CACHE_DADES, user?.id] });
      handleError(error instanceof Error ? error : new Error("No s'ha pogut actualitzar la tasca"));
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
      // Revert on error
      queryClient.invalidateQueries({ queryKey: [CLAU_CACHE_DADES, user?.id] });
      handleError(error instanceof Error ? error : new Error("No s'ha pogut actualitzar la tasca"));
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
      // Revert on error
      queryClient.invalidateQueries({ queryKey: [CLAU_CACHE_DADES, user?.id] });
      handleError(error instanceof Error ? error : new Error("No s'ha pogut eliminar la tasca"));
    }
  }, [user?.id, queryClient, toast, handleError]);

  // Folder creation with optimistic updates
  const crearCarpeta = useCallback(async (name: string, color: string = "#6366f1") => {
    if (!user) throw new Error("User not authenticated");

    try {
      const { data: newFolder, error } = await supabase
        .from("folders")
        .insert([{ name, color, user_id: user.id }])
        .select("id, name, color, is_system, icon")
        .single();

      if (error) throw error;

      // Update cache
      queryClient.setQueryData([CLAU_CACHE_DADES, user.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          folders: [...old.folders, newFolder]
        };
      });

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