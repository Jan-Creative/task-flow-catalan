import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';

export interface DailyPreparation {
  id: string;
  user_id: string;
  preparation_date: string;
  planned_tasks: any[];
  priorities: any[];
  time_blocks: any[];
  notes: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const usePrepareTomorrow = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  // Fetch tomorrow's preparation
  const { 
    data: preparation, 
    isLoading: fetchLoading,
    error 
  } = useQuery({
    queryKey: ['daily-preparation', tomorrow],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_preparations')
        .select('*')
        .eq('preparation_date', tomorrow)
        .maybeSingle();

      if (error) throw error;
      return data as DailyPreparation | null;
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Create or update preparation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<DailyPreparation>) => {
      const { data: result, error } = await supabase
        .from('daily_preparations')
        .upsert({
          preparation_date: tomorrow,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-preparation', tomorrow] });
      toast.success('Preparació guardada correctament');
    },
    onError: (error) => {
      console.error('Error saving preparation:', error);
      toast.error('Error al guardar la preparació');
    }
  });

  const savePreparation = useCallback(async (data: Partial<DailyPreparation>) => {
    setLoading(true);
    try {
      await saveMutation.mutateAsync(data);
    } finally {
      setLoading(false);
    }
  }, [saveMutation]);

  const updatePlannedTasks = useCallback(async (tasks: any[]) => {
    await savePreparation({ planned_tasks: tasks });
  }, [savePreparation]);

  const updatePriorities = useCallback(async (priorities: any[]) => {
    await savePreparation({ priorities });
  }, [savePreparation]);

  const updateTimeBlocks = useCallback(async (timeBlocks: any[]) => {
    await savePreparation({ time_blocks: timeBlocks });
  }, [savePreparation]);

  const updateNotes = useCallback(async (notes: string) => {
    await savePreparation({ notes });
  }, [savePreparation]);

  const markCompleted = useCallback(async () => {
    await savePreparation({ is_completed: true });
  }, [savePreparation]);

  // Time blocks management
  const addTimeBlock = useCallback(async (block: any) => {
    const currentBlocks = preparation?.time_blocks || [];
    const newBlock = {
      id: crypto.randomUUID(),
      ...block
    };
    await savePreparation({ time_blocks: [...currentBlocks, newBlock] });
  }, [preparation, savePreparation]);

  const updateTimeBlock = useCallback(async (blockId: string, updates: any) => {
    const currentBlocks = preparation?.time_blocks || [];
    const updatedBlocks = currentBlocks.map((block: any) => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    await savePreparation({ time_blocks: updatedBlocks });
  }, [preparation, savePreparation]);

  const removeTimeBlock = useCallback(async (blockId: string) => {
    const currentBlocks = preparation?.time_blocks || [];
    const filteredBlocks = currentBlocks.filter((block: any) => block.id !== blockId);
    await savePreparation({ time_blocks: filteredBlocks });
  }, [preparation, savePreparation]);

  return {
    preparation,
    loading: loading || fetchLoading,
    error,
    savePreparation,
    updatePlannedTasks,
    updatePriorities,
    updateTimeBlocks,
    updateNotes,
    markCompleted,
    addTimeBlock,
    updateTimeBlock,
    removeTimeBlock,
    tomorrow
  };
};