import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
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
};