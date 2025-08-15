import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTaskCache } from '@/hooks/useTaskCache';

// Navigation preloader component
export const NavigationPreloader = ({ taskId }: { taskId?: string }) => {
  const { preloadAdjacentTasks } = useTaskCache();
  
  useEffect(() => {
    if (taskId) {
      preloadAdjacentTasks(taskId);
    }
  }, [taskId, preloadAdjacentTasks]);

  return null;
};

// Background data refresher that doesn't interfere with UI
export const BackgroundRefresher = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Refresh data in background every 5 minutes without showing loading states
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['dades-app'],
        refetchType: 'none' // Don't refetch immediately
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return null;
};