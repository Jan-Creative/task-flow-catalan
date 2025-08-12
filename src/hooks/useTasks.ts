import { useState, useEffect } from "react";
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

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { setTaskProperty, getPropertyByName } = useProperties();

  // Fetch tasks and folders
  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [tasksResult, foldersResult] = await Promise.all([
        supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("folders").select("*").eq("user_id", user.id).order("is_system", { ascending: false })
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (foldersResult.error) throw foldersResult.error;

      setTasks((tasksResult.data || []) as Task[]);
      setFolders((foldersResult.data || []) as Folder[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No s'han pogut carregar les dades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // If no folder specified, find and use inbox folder from database
      let finalFolderId = taskData.folder_id;
      if (!finalFolderId) {
        // Search for the user's inbox folder directly in the database
        const { data: inboxFolder, error: folderError } = await supabase
          .from("folders")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_system", true)
          .eq("name", "Bustia")
          .single();

        if (!folderError && inboxFolder) {
          finalFolderId = inboxFolder.id;
        }
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...taskData, user_id: user.id, folder_id: finalFolderId }])
        .select()
        .single();

      if (error) throw error;

      // Set task properties in the new system
      if (taskData.status) {
        const statusProperty = getPropertyByName('Estat');
        const statusOption = statusProperty?.options.find(opt => opt.value === taskData.status);
        if (statusProperty && statusOption) {
          await setTaskProperty(data.id, statusProperty.id, statusOption.id);
        }
      }

      if (taskData.priority) {
        const priorityProperty = getPropertyByName('Prioritat');
        const priorityOption = priorityProperty?.options.find(opt => opt.value === taskData.priority);
        if (priorityProperty && priorityOption) {
          await setTaskProperty(data.id, priorityProperty.id, priorityOption.id);
        }
      }

      setTasks(prev => [data as Task, ...prev]);
      toast({
        title: "Tasca creada",
        description: "La tasca s'ha creat correctament",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut crear la tasca",
        variant: "destructive",
      });
    }
  };

  // Update task
  const updateTask = async (taskId: string, taskData: Partial<Omit<Task, "id" | "created_at" | "updated_at">>) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", taskId);

      if (error) throw error;

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, ...taskData } : task
        )
      );

      toast({
        title: "Tasca actualitzada",
        description: "La tasca s'ha actualitzat correctament",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la tasca",
        variant: "destructive",
      });
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
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

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status } : task
        )
      );

      toast({
        title: "Tasca actualitzada",
        description: `Estat canviat a ${status}`,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la tasca",
        variant: "destructive",
      });
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: "Tasca eliminada",
        description: "La tasca s'ha eliminat correctament",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut eliminar la tasca",
        variant: "destructive",
      });
    }
  };

  // Create folder
  const createFolder = async (name: string, color: string = "#6366f1") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("folders")
        .insert([{ name, color, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [...prev, data]);
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
  };

  // Update folder
  const updateFolder = async (folderId: string, updates: { name?: string; color?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("folders")
        .update(updates)
        .eq("id", folderId)
        .eq("user_id", user.id)
        .eq("is_system", false)
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => prev.map(folder => 
        folder.id === folderId ? { ...folder, ...data } : folder
      ));
      
      toast({
        title: "Carpeta actualitzada",
        description: "La carpeta s'ha actualitzat correctament",
      });
    } catch (error) {
      console.error("Error updating folder:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar la carpeta",
        variant: "destructive",
      });
    }
  };

  // Delete folder
  const deleteFolder = async (folderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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

      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId)
        .eq("user_id", user.id)
        .eq("is_system", false);

      if (error) throw error;

      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      toast({
        title: "Carpeta eliminada",
        description: "La carpeta s'ha eliminat correctament",
      });
      return true;
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut eliminar la carpeta",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    refreshData: fetchData,
  };
};