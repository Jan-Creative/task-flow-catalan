import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { debounce } from '@/lib/performanceOptimizer';
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
  const [optimisticBlocks, setOptimisticBlocks] = useState<TimeBlock[]>([]);
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
        .select('id, user_id, preparation_date, time_blocks, created_at, updated_at')
        .eq('preparation_date', today)
        .maybeSingle();

      if (error) throw error;
      
      // Convert JSON time_blocks to TimeBlock[]
      if (data && data.time_blocks) {
        data.time_blocks = Array.isArray(data.time_blocks) ? data.time_blocks : [];
      }
      
      return data as TodayPreparation | null;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for more frequent updates
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false // Reduce unnecessary refetches
  });

  // Create or update preparation with optimistic updates
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
        .select('id, user_id, preparation_date, time_blocks, created_at, updated_at')
        .single();

      if (error) throw error;
      return result;
    },
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['daily-preparation', today] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['daily-preparation', today]);
      
      // Optimistically update cache
      if (newData.time_blocks) {
        queryClient.setQueryData(['daily-preparation', today], (old: TodayPreparation | null) => ({
          ...old,
          time_blocks: newData.time_blocks,
          updated_at: new Date().toISOString()
        } as TodayPreparation));
      }
      
      return { previousData };
    },
    onError: (error, newData, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['daily-preparation', today], context.previousData);
      }
      console.error('Error saving today preparation:', error);
      toast.error('Error al guardar els blocs de temps');
    },
    onSettled: () => {
      // Clear optimistic state
      setOptimisticBlocks([]);
      // Refetch only the specific query
      queryClient.invalidateQueries({ 
        queryKey: ['daily-preparation', today],
        exact: true
      });
    }
  });

  // Debounced save function for better performance
  const debouncedSave = useMemo(
    () => debounce(async (timeBlocks: TimeBlock[]) => {
      await saveMutation.mutateAsync({ time_blocks: timeBlocks });
    }, 300),
    [saveMutation]
  );

  const saveTimeBlocks = useCallback(async (timeBlocks: TimeBlock[]) => {
    setLoading(true);
    try {
      await debouncedSave(timeBlocks);
    } finally {
      setLoading(false);
    }
  }, [debouncedSave]);

  // Time blocks management with optimistic updates
  const addTimeBlock = useCallback(async (block: Omit<TimeBlock, 'id'>) => {
    const currentBlocks = preparation?.time_blocks || [];
    const newBlock: TimeBlock = {
      id: crypto.randomUUID(),
      ...block
    };
    
    // Optimistic update
    setOptimisticBlocks([...currentBlocks, newBlock]);
    toast.success('Bloc de temps afegit');
    
    try {
      await saveTimeBlocks([...currentBlocks, newBlock]);
    } catch (error) {
      // Rollback optimistic update on error
      setOptimisticBlocks([]);
      toast.error('Error afegint el bloc de temps');
    }
  }, [preparation, saveTimeBlocks]);

  const updateTimeBlock = useCallback(async (blockId: string, updates: Partial<TimeBlock>) => {
    const currentBlocks = preparation?.time_blocks || [];
    const updatedBlocks = currentBlocks.map((block: TimeBlock) => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    
    // Optimistic update
    setOptimisticBlocks(updatedBlocks);
    toast.success('Bloc de temps actualitzat');
    
    try {
      await saveTimeBlocks(updatedBlocks);
    } catch (error) {
      // Rollback optimistic update on error
      setOptimisticBlocks([]);
      toast.error('Error actualitzant el bloc de temps');
    }
  }, [preparation, saveTimeBlocks]);

  const removeTimeBlock = useCallback(async (blockId: string) => {
    const currentBlocks = preparation?.time_blocks || [];
    const filteredBlocks = currentBlocks.filter((block: TimeBlock) => block.id !== blockId);
    
    // Optimistic update
    setOptimisticBlocks(filteredBlocks);
    toast.success('Bloc de temps eliminat');
    
    try {
      await saveTimeBlocks(filteredBlocks);
    } catch (error) {
      // Rollback optimistic update on error
      setOptimisticBlocks([]);
      toast.error('Error eliminant el bloc de temps');
    }
  }, [preparation, saveTimeBlocks]);

  // Use optimistic blocks if available, otherwise use server data
  const timeBlocks = useMemo(() => {
    if (optimisticBlocks.length > 0) {
      return optimisticBlocks;
    }
    return preparation?.time_blocks 
      ? (Array.isArray(preparation.time_blocks) ? preparation.time_blocks : [])
      : [];
  }, [optimisticBlocks, preparation?.time_blocks]);

  // Quick creation function for dashboard
  const createQuickTimeBlock = useCallback(async (title: string, duration: number = 60) => {
    const now = new Date();
    const startHour = now.getHours();
    const startMinutes = Math.ceil(now.getMinutes() / 15) * 15; // Round to next 15 min
    
    let adjustedHour = startHour;
    let adjustedMinutes = startMinutes;
    
    if (adjustedMinutes >= 60) {
      adjustedHour += 1;
      adjustedMinutes = 0;
    }
    
    const startTime = `${adjustedHour.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`;
    
    const endHour = Math.floor((adjustedHour * 60 + adjustedMinutes + duration) / 60);
    const endMinutes = (adjustedMinutes + duration) % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    return addTimeBlock({
      title,
      startTime,
      endTime,
      color: '#3b82f6',
      description: '',
      notifications: { start: false, end: false },
      reminderMinutes: { start: 5, end: 5 }
    });
  }, [addTimeBlock]);

  return {
    timeBlocks,
    loading: loading || fetchLoading,
    error,
    addTimeBlock,
    updateTimeBlock,
    removeTimeBlock,
    createQuickTimeBlock,
    today
  };
};