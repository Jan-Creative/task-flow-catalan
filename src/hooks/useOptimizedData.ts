import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProperties } from "./useProperties";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pendent" | "en_proces" | "completat";
  priority: "alta" | "mitjana" | "baixa";
  folder_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  is_system: boolean;
}

// Consolidated data fetching with shared cache
export const useOptimizedData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setTaskProperty, getPropertyByName } = useProperties();

  // Single optimized query for all data
  const { data, isLoading, error } = useQuery({
    queryKey: ['optimized-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Parallel fetch all data
      const [tasksResult, foldersResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("folders")
          .select("*")
          .eq("user_id", user.id)
          .order("is_system", { ascending: false })
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (foldersResult.error) throw foldersResult.error;

      return {
        tasks: (tasksResult.data || []) as Task[],
        folders: (foldersResult.data || []) as Folder[],
        user
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10, // 10 minutes in memory
  });

  // Memoized calculations
  const optimizedData = useMemo(() => {
    if (!data) return null;

    const { tasks, folders } = data;
    
    // Pre-calculate stats
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completat').length,
      inProgress: tasks.filter(t => t.status === 'en_proces').length,
      pending: tasks.filter(t => t.status === 'pendent').length,
    };

    // Group tasks by folder for faster access
    const tasksByFolder = tasks.reduce((acc, task) => {
      const folderId = task.folder_id || 'inbox';
      if (!acc[folderId]) acc[folderId] = [];
      acc[folderId].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    // Pre-calculate today's tasks
    const today = new Date().toDateString();
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.created_at).toDateString();
      return taskDate === today || task.due_date === new Date().toISOString().split('T')[0];
    });

    return {
      tasks,
      folders,
      taskStats,
      tasksByFolder,
      todayTasks,
    };
  }, [data]);

  // Optimized mutations with optimistic updates
  const createTask = useCallback(async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
    const user = data?.user;
    if (!user) throw new Error("User not authenticated");

    const optimisticTask = {
      ...taskData,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Task;

    // Optimistic update
    queryClient.setQueryData(['optimized-data'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: [optimisticTask, ...old.tasks]
      };
    });

    try {
      // Find inbox folder
      let finalFolderId = taskData.folder_id;
      if (!finalFolderId) {
        const inboxFolder = data?.folders.find(f => f.is_system && f.name === "Bustia");
        finalFolderId = inboxFolder?.id;
      }

      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert([{ ...taskData, user_id: user.id, folder_id: finalFolderId }])
        .select()
        .single();

      if (error) throw error;

      // Handle property setting
      if (taskData.status) {
        const statusProperty = getPropertyByName('Estat');
        const statusOption = statusProperty?.options.find(opt => opt.value === taskData.status);
        if (statusProperty && statusOption) {
          await setTaskProperty(newTask.id, statusProperty.id, statusOption.id);
        }
      }

      if (taskData.priority) {
        const priorityProperty = getPropertyByName('Prioritat');
        const priorityOption = priorityProperty?.options.find(opt => opt.value === taskData.priority);
        if (priorityProperty && priorityOption) {
          await setTaskProperty(newTask.id, priorityProperty.id, priorityOption.id);
        }
      }

      // Replace optimistic update with real data
      queryClient.setQueryData(['optimized-data'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: [newTask, ...old.tasks.filter((t: Task) => t.id !== optimisticTask.id)]
        };
      });

      toast({
        title: "Tasca creada",
        description: "La tasca s'ha creat correctament",
      });
    } catch (error) {
      // Revert optimistic update
      queryClient.setQueryData(['optimized-data'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t: Task) => t.id !== optimisticTask.id)
        };
      });
      
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut crear la tasca",
        variant: "destructive",
      });
    }
  }, [data, queryClient, toast, setTaskProperty, getPropertyByName]);

  const updateTask = useCallback(async (taskId: string, taskData: Partial<Omit<Task, "id" | "created_at" | "updated_at">>) => {
    // Optimistic update
    queryClient.setQueryData(['optimized-data'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.map((task: Task) =>
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

      toast({
        title: "Tasca actualitzada",
        description: "La tasca s'ha actualitzat correctament",
      });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['optimized-data'] });
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la tasca",
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    // Optimistic update
    queryClient.setQueryData(['optimized-data'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.map((task: Task) =>
          task.id === taskId ? { ...task, status } : task
        )
      };
    });

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ 
          status,
          completed_at: status === 'completat' ? new Date().toISOString() : null
        })
        .eq("id", taskId);

      if (error) throw error;

      // Update property in the new system
      const statusProperty = getPropertyByName('Estat');
      const statusOption = statusProperty?.options.find(opt => opt.value === status);
      if (statusProperty && statusOption) {
        await setTaskProperty(taskId, statusProperty.id, statusOption.id);
      }

      toast({
        title: "Tasca actualitzada",
        description: `Estat canviat a ${status}`,
      });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['optimized-data'] });
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la tasca",
        variant: "destructive",
      });
    }
  }, [queryClient, toast, setTaskProperty, getPropertyByName]);

  const deleteTask = useCallback(async (taskId: string) => {
    // Optimistic update
    queryClient.setQueryData(['optimized-data'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.filter((task: Task) => task.id !== taskId)
      };
    });

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Tasca eliminada",
        description: "La tasca s'ha eliminat correctament",
      });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['optimized-data'] });
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut eliminar la tasca",
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  const createFolder = useCallback(async (name: string, color: string = "#6366f1") => {
    const user = data?.user;
    if (!user) throw new Error("User not authenticated");

    try {
      const { data: newFolder, error } = await supabase
        .from("folders")
        .insert([{ name, color, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Update cache
      queryClient.setQueryData(['optimized-data'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          folders: [...old.folders, newFolder]
        };
      });

      toast({
        title: "Carpeta creada",
        description: "La carpeta s'ha creat correctament",
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut crear la carpeta",
        variant: "destructive",
      });
    }
  }, [data, queryClient, toast]);

  const updateFolder = useCallback(async (folderId: string, updates: { name?: string; color?: string }) => {
    const user = data?.user;
    if (!user) throw new Error("User not authenticated");

    // Optimistic update
    queryClient.setQueryData(['optimized-data'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        folders: old.folders.map((folder: Folder) => 
          folder.id === folderId ? { ...folder, ...updates } : folder
        )
      };
    });

    try {
      const { data: updatedFolder, error } = await supabase
        .from("folders")
        .update(updates)
        .eq("id", folderId)
        .eq("user_id", user.id)
        .eq("is_system", false)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Carpeta actualitzada",
        description: "La carpeta s'ha actualitzat correctament",
      });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['optimized-data'] });
      console.error("Error updating folder:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la carpeta",
        variant: "destructive",
      });
    }
  }, [data, queryClient, toast]);

  const deleteFolder = useCallback(async (folderId: string) => {
    const user = data?.user;
    if (!user) throw new Error("User not authenticated");

    // Check if folder has tasks
    const tasksInFolder = optimizedData?.tasks.filter(task => task.folder_id === folderId) || [];
    if (tasksInFolder.length > 0) {
      toast({
        title: "No es pot eliminar",
        description: `La carpeta conté ${tasksInFolder.length} tasques. Mou-les primer a una altra carpeta.`,
        variant: "destructive",
      });
      return false;
    }

    // Optimistic update
    queryClient.setQueryData(['optimized-data'], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        folders: old.folders.filter((folder: Folder) => folder.id !== folderId)
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

      toast({
        title: "Carpeta eliminada",
        description: "La carpeta s'ha eliminat correctament",
      });
      return true;
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['optimized-data'] });
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut eliminar la carpeta",
        variant: "destructive",
      });
      return false;
    }
  }, [data, optimizedData, queryClient, toast]);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['optimized-data'] });
  }, [queryClient]);

  return {
    data: optimizedData,
    loading: isLoading,
    error,
    tasks: optimizedData?.tasks || [],
    folders: optimizedData?.folders || [],
    taskStats: optimizedData?.taskStats,
    tasksByFolder: optimizedData?.tasksByFolder,
    todayTasks: optimizedData?.todayTasks || [],
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    createFolder,
    updateFolder,
    deleteFolder,
    refreshData,
  };
};