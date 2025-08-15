import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDadesApp } from './useDadesApp';

// Enhanced hook for optimistic task navigation
export const useOptimisticTasks = () => {
  const queryClient = useQueryClient();
  const { todayTasks, loading } = useDadesApp();

  // Get cached task data to prevent empty states
  const getCachedTasks = () => {
    const cachedData = queryClient.getQueryData(['dades-app']) as any;
    return cachedData?.todayTasks || [];
  };

  // Optimistic task list that never shows empty during navigation
  const optimisticTasks = useMemo(() => {
    // If we have fresh data, use it
    if (todayTasks && todayTasks.length > 0) {
      return todayTasks;
    }

    // If loading and no fresh data, try cache
    if (loading) {
      const cached = getCachedTasks();
      if (cached.length > 0) {
        return cached;
      }
    }

    // Return empty array only if we're not loading and have no cache
    return todayTasks || [];
  }, [todayTasks, loading]);

  // Intelligent loading state that doesn't show loading if we have cached data
  const shouldShowLoading = loading && optimisticTasks.length === 0;

  return {
    tasks: optimisticTasks,
    loading: shouldShowLoading,
    hasData: optimisticTasks.length > 0,
  };
};