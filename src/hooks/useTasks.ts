import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProperties } from "./useProperties";
import { useAuth } from "./useAuth";

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

export const useTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setTaskProperty, getPropertyByName } = useProperties();

  // Optimized React Query implementation
  const { data, isLoading: loading } = useQuery({
    queryKey: ['tasks-folders', user?.id],
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
          .select("id, name, color, is_system")
          .eq("user_id", user.id)
          .order("is_system", { ascending: false })
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (foldersResult.error) throw foldersResult.error;

      return {
        tasks: (tasksResult.data || []) as Task[],
        folders: (foldersResult.data || []) as Folder[],
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const tasks = data?.tasks || [];
  const folders = data?.folders || [];

  // Optimized create task with optimistic updates
  const createTask = useCallback(async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("User not authenticated");

    const optimisticTask = {
      ...taskData,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Task;

    // Optimistic update
    queryClient.setQueryData(['tasks-folders', user.id], (old: any) => {
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
        const inboxFolder = folders.find(f => f.is_system && f.name === "Bustia");
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
      queryClient.setQueryData(['tasks-folders', user.id], (old: any) => {
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
      queryClient.setQueryData(['tasks-folders', user.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t: Task) => t.id !== optimisticTask.id)
        };
      });
      
      toast({
        title: "Error",
        description: "No s'ha pogut crear la tasca",
        variant: "destructive",
      });
    }
  }, [user, folders, queryClient, toast, setTaskProperty, getPropertyByName]);

  // Optimized update task
  const updateTask = useCallback(async (taskId: string, taskData: Partial<Omit<Task, "id" | "created_at" | "updated_at">>) => {
    // Optimistic update
    queryClient.setQueryData(['tasks-folders', user?.id], (old: any) => {
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
      queryClient.invalidateQueries({ queryKey: ['tasks-folders', user?.id] });
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la tasca",
        variant: "destructive",
      });
    }
  }, [user?.id, queryClient, toast]);

  // Optimized update task status
  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    // Optimistic update
    queryClient.setQueryData(['tasks-folders', user?.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.map((task: Task) =>
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

      toast({
        title: "Tasca actualitzada",
        description: `Estat canviat a ${status}`,
      });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['tasks-folders', user?.id] });
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la tasca",
        variant: "destructive",
      });
    }
  }, [user?.id, queryClient, toast, setTaskProperty, getPropertyByName]);

  // Optimized delete task
  const deleteTask = useCallback(async (taskId: string) => {
    // Optimistic update
    queryClient.setQueryData(['tasks-folders', user?.id], (old: any) => {
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
      queryClient.invalidateQueries({ queryKey: ['tasks-folders', user?.id] });
      toast({
        title: "Error",
        description: "No s'ha pogut eliminar la tasca",
        variant: "destructive",
      });
    }
  }, [user?.id, queryClient, toast]);

  // Optimized create folder
  const createFolder = useCallback(async (name: string, color: string = "#6366f1") => {
    if (!user) throw new Error("User not authenticated");

    try {
      const { data: newFolder, error } = await supabase
        .from("folders")
        .insert([{ name, color, user_id: user.id }])
        .select("id, name, color, is_system")
        .single();

      if (error) throw error;

      // Update cache
      queryClient.setQueryData(['tasks-folders', user.id], (old: any) => {
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
      toast({
        title: "Error",
        description: "No s'ha pogut crear la carpeta",
        variant: "destructive",
      });
    }
  }, [user, queryClient, toast]);

  // Optimized update folder
  const updateFolder = useCallback(async (folderId: string, updates: { name?: string; color?: string }) => {
    if (!user) throw new Error("User not authenticated");

    // Optimistic update
    queryClient.setQueryData(['tasks-folders', user.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        folders: old.folders.map((folder: Folder) => 
          folder.id === folderId ? { ...folder, ...updates } : folder
        )
      };
    });

    try {
      const { error } = await supabase
        .from("folders")
        .update(updates)
        .eq("id", folderId)
        .eq("user_id", user.id)
        .eq("is_system", false);

      if (error) throw error;

      toast({
        title: "Carpeta actualitzada",
        description: "La carpeta s'ha actualitzat correctament",
      });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['tasks-folders', user.id] });
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la carpeta",
        variant: "destructive",
      });
    }
  }, [user, queryClient, toast]);

  // Optimized delete folder
  const deleteFolder = useCallback(async (folderId: string) => {
    if (!user) throw new Error("User not authenticated");

    // Check if folder has tasks
    const tasksInFolder = tasks.filter(task => task.folder_id === folderId);
    if (tasksInFolder.length > 0) {
      toast({
        title: "No es pot eliminar",
        description: `La carpeta conté ${tasksInFolder.length} tasques. Mou-les primer a una altra carpeta.`,
        variant: "destructive",
      });
      return false;
    }

    // Optimistic update
    queryClient.setQueryData(['tasks-folders', user.id], (old: any) => {
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
      queryClient.invalidateQueries({ queryKey: ['tasks-folders', user.id] });
      toast({
        title: "Error",
        description: "No s'ha pogut eliminar la carpeta",
        variant: "destructive",
      });
      return false;
    }
  }, [user, tasks, queryClient, toast]);

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks-folders', user?.id] });
  }, [queryClient, user?.id]);

  return {
    tasks,
    folders,
    loading,
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