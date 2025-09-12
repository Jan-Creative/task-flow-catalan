import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/lib/toastUtils";
import { useCallback } from "react";

export interface Project {
  id: string;
  name: string;
  description?: string;
  objective?: string;
  color: string;
  icon?: string;
  dashboard_config: any;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useProject = (projectId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId, user?.id],
    queryFn: async () => {
      if (!user || !projectId) throw new Error("User not authenticated or project ID missing");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!user && !!projectId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const updateProject = useCallback(async (updates: Partial<Project>) => {
    if (!user || !projectId) throw new Error("User not authenticated or project ID missing");

    // Optimistic update
    queryClient.setQueryData(['project', projectId, user.id], (old: Project | undefined) => {
      if (!old) return old;
      return { ...old, ...updates };
    });

    try {
      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Projecte actualitzat", {
        description: "El projecte s'ha actualitzat correctament",
      });
    } catch (error) {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['project', projectId, user.id] });
      toast.error("Error", {
        description: "No s'ha pogut actualitzar el projecte",
      });
      throw error;
    }
  }, [user, projectId, queryClient]);

  return {
    project,
    isLoading,
    error,
    updateProject
  };
};