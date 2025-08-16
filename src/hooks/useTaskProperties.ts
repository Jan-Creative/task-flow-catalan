import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TaskPropertyWithDetails {
  id: string;
  task_id: string;
  property_id: string;
  option_id: string;
  property_definitions: {
    id: string;
    name: string;
    type: string;
    icon?: string;
  };
  property_options: {
    id: string;
    value: string;
    label: string;
    color: string;
    icon?: string;
  };
}

export const useTaskProperties = (taskId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['task-properties', taskId],
    queryFn: async (): Promise<TaskPropertyWithDetails[]> => {
      if (!taskId) return [];

      const { data, error } = await supabase
        .from('task_properties')
        .select(`
          *,
          property_options (*),
          property_definitions (*)
        `)
        .eq('task_id', taskId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!taskId,
  });

  // Realtime: refresh when task properties/options/definitions change
  useEffect(() => {
    if (!taskId) return;

    const channel = supabase
      .channel(`task-properties-${taskId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_properties', filter: `task_id=eq.${taskId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['task-properties', taskId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'property_options' }, () => {
        queryClient.invalidateQueries({ queryKey: ['task-properties', taskId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'property_definitions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['task-properties', taskId] });
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [taskId, queryClient]);

  return query;
};