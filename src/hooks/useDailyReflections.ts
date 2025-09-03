import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { DailyReflection, CreateReflectionData, UpdateReflectionData } from '@/types/reflection';

export const useDailyReflections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reflection for a specific date
  const useReflectionByDate = (date: string) => {
    return useQuery({
      queryKey: ['daily-reflection', date],
      queryFn: async () => {
        if (!user?.id) return null;
        
        const { data, error } = await supabase
          .from('daily_reflections')
          .select('*')
          .eq('user_id', user.id)
          .eq('reflection_date', date)
          .maybeSingle();

        if (error) throw error;
        return data as DailyReflection | null;
      },
      enabled: !!user?.id && !!date
    });
  };

  // Fetch all reflections for the current user
  const useAllReflections = () => {
    return useQuery({
      queryKey: ['daily-reflections'],
      queryFn: async () => {
        if (!user?.id) return [];
        
        const { data, error } = await supabase
          .from('daily_reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('reflection_date', { ascending: false });

        if (error) throw error;
        return data as DailyReflection[];
      },
      enabled: !!user?.id
    });
  };

  // Create or update reflection
  const saveReflectionMutation = useMutation({
    mutationFn: async ({ date, data }: { date: string; data: CreateReflectionData | UpdateReflectionData }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const reflectionData = {
        user_id: user.id,
        reflection_date: date,
        day_rating: data.day_rating ?? 5,
        work_satisfaction: data.work_satisfaction ?? 5,
        energy_level: data.energy_level ?? 5,
        stress_level: data.stress_level ?? 5,
        tasks_completed_percentage: data.tasks_completed_percentage ?? 0,
        notes: data.notes,
        accomplishments: data.accomplishments,
        obstacles: data.obstacles,
        mood_tags: data.mood_tags,
        gratitude_notes: data.gratitude_notes,
        tomorrow_focus: data.tomorrow_focus
      };

      const { data: result, error } = await supabase
        .from('daily_reflections')
        .upsert(reflectionData, { 
          onConflict: 'user_id,reflection_date',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;
      return result as DailyReflection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daily-reflection', data.reflection_date] });
      queryClient.invalidateQueries({ queryKey: ['daily-reflections'] });
      toast.success("Reflexió guardada", {
        description: "La teva reflexió diària s'ha desat correctament",
      });
    },
    onError: (error) => {
      console.error('Error saving reflection:', error);
      toast.error("Error", {
        description: "No s'ha pogut guardar la reflexió",
      });
    }
  });

  // Delete reflection
  const deleteReflectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('daily_reflections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reflections'] });
      toast.success("Reflexió eliminada", {
        description: "La reflexió s'ha eliminat correctament",
      });
    },
    onError: (error) => {
      console.error('Error deleting reflection:', error);
      toast.error("Error", {
        description: "No s'ha pogut eliminar la reflexió",
      });
    }
  });

  return {
    useReflectionByDate,
    useAllReflections,
    saveReflection: saveReflectionMutation.mutateAsync,
    deleteReflection: deleteReflectionMutation.mutateAsync,
    isSaving: saveReflectionMutation.isPending,
    isDeleting: deleteReflectionMutation.isPending
  };
};