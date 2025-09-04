import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { TimeBlock } from '@/types/timeblock';

export interface TodayPreparation {
  id: string;
  user_id: string;
  preparation_date: string;
  time_blocks: any; // JSON type from Supabase
  created_at: string;
  updated_at: string;
}

export const useTodayTimeBlocks = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch today's preparation and time blocks
  const { 
    data: preparation, 
    isLoading: fetchLoading,
    error 
  } = useQuery({
    queryKey: ['daily-preparation', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_preparations')
        .select('*')
        .eq('preparation_date', today)
        .maybeSingle();

      if (error) throw error;
      
      // Convert JSON time_blocks to TimeBlock[]
      if (data && data.time_blocks) {
        data.time_blocks = Array.isArray(data.time_blocks) ? data.time_blocks : [];
      }
      
      return data as TodayPreparation | null;
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Create or update preparation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<TodayPreparation>) => {
      const user = (await supabase.auth.getUser()).data.user;
      const { data: result, error } = await supabase
        .from('daily_preparations')
        .upsert({
          preparation_date: today,
          user_id: user?.id,
          time_blocks: data.time_blocks || [],
          ...data
        }, { onConflict: 'user_id,preparation_date' })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-preparation', today] });
    },
    onError: (error) => {
      console.error('Error saving today preparation:', error);
      toast.error('Error al guardar els blocs de temps');
    }
  });

  const saveTimeBlocks = useCallback(async (timeBlocks: TimeBlock[]) => {
    setLoading(true);
    try {
      await saveMutation.mutateAsync({ time_blocks: timeBlocks });
    } finally {
      setLoading(false);
    }
  }, [saveMutation]);

  // Time blocks management
  const addTimeBlock = useCallback(async (block: Omit<TimeBlock, 'id'>) => {
    const currentBlocks = preparation?.time_blocks || [];
    const newBlock: TimeBlock = {
      id: crypto.randomUUID(),
      ...block
    };
    await saveTimeBlocks([...currentBlocks, newBlock]);
    toast.success('Bloc de temps afegit');
  }, [preparation, saveTimeBlocks]);

  const updateTimeBlock = useCallback(async (blockId: string, updates: Partial<TimeBlock>) => {
    const currentBlocks = preparation?.time_blocks || [];
    const updatedBlocks = currentBlocks.map((block: TimeBlock) => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    await saveTimeBlocks(updatedBlocks);
    toast.success('Bloc de temps actualitzat');
  }, [preparation, saveTimeBlocks]);

  const removeTimeBlock = useCallback(async (blockId: string) => {
    const currentBlocks = preparation?.time_blocks || [];
    const filteredBlocks = currentBlocks.filter((block: TimeBlock) => block.id !== blockId);
    await saveTimeBlocks(filteredBlocks);
    toast.success('Bloc de temps eliminat');
  }, [preparation, saveTimeBlocks]);

  const timeBlocks = preparation?.time_blocks 
    ? (Array.isArray(preparation.time_blocks) ? preparation.time_blocks : [])
    : [];

  return {
    timeBlocks,
    loading: loading || fetchLoading,
    error,
    addTimeBlock,
    updateTimeBlock,
    removeTimeBlock,
    today
  };
};