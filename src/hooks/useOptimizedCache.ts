/**
 * Optimized Cache Management Hook
 * Provides intelligent cache invalidation and optimization
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/debugUtils';

interface CacheStrategy {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

const DEFAULT_STRATEGIES: Record<string, CacheStrategy> = {
  // Static data - cache for longer
  static: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false
  },
  
  // Dynamic data - moderate caching
  dynamic: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  },
  
  // Real-time data - minimal caching
  realtime: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  }
};

export const useOptimizedCache = () => {
  const queryClient = useQueryClient();

  // Smart invalidation based on data relationships
  const invalidateRelatedQueries = useCallback(async (
    primaryKey: string,
    affectedKeys: string[] = []
  ) => {
    logger.debug('Cache', 'Invalidating related queries', { primaryKey, affectedKeys });

    // Always invalidate the primary key
    await queryClient.invalidateQueries({ queryKey: [primaryKey] });

    // Invalidate related keys
    for (const key of affectedKeys) {
      await queryClient.invalidateQueries({ queryKey: [key] });
    }

    // Smart invalidation based on common patterns
    if (primaryKey === 'dades-app') {
      // If main data changes, invalidate task-related caches
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0] as string;
          return key?.includes('task') || key?.includes('folder');
        }
      });
    }
  }, [queryClient]);

  // Optimistic updates with rollback capability
  const optimisticUpdate = useCallback(async <T>(
    queryKey: string[],
    updater: (old: T) => T,
    operation: () => Promise<void>
  ): Promise<void> => {
    // Store the previous value for rollback
    const previousData = queryClient.getQueryData<T>(queryKey);
    
    try {
      // Apply optimistic update
      queryClient.setQueryData<T>(queryKey, updater);
      
      // Perform the actual operation
      await operation();
      
      logger.debug('Cache', 'Optimistic update succeeded', { queryKey });
    } catch (error) {
      logger.error('Optimistic update failed, rolling back', error);
      
      // Rollback on error
      if (previousData !== undefined) {
        queryClient.setQueryData<T>(queryKey, previousData);
      } else {
        queryClient.removeQueries({ queryKey });
      }
      
      throw error;
    }
  }, [queryClient]);

  // Prefetch with smart strategy selection
  const prefetchWithStrategy = useCallback(async (
    queryKey: string[],
    queryFn: () => Promise<any>,
    strategy: 'static' | 'dynamic' | 'realtime' = 'dynamic'
  ) => {
    const cacheStrategy = DEFAULT_STRATEGIES[strategy];
    
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...cacheStrategy
    });
    
    logger.debug('Cache', 'Prefetch completed', { queryKey, strategy });
  }, [queryClient]);

  // Background refresh without showing loading states
  const backgroundRefresh = useCallback(async (queryKeys: string[][]) => {
    for (const queryKey of queryKeys) {
      queryClient.invalidateQueries({ 
        queryKey,
        refetchType: 'none' // Don't refetch immediately
      });
    }
    
    // Trigger background refetch after a short delay
    setTimeout(() => {
      for (const queryKey of queryKeys) {
        queryClient.refetchQueries({ queryKey });
      }
    }, 1000);
    
    logger.debug('Cache', 'Background refresh initiated', { queryKeys });
  }, [queryClient]);

  // Cache size management
  const optimizeCacheSize = useCallback(() => {
    const queries = queryClient.getQueryCache().getAll();
    const staleQueries = queries.filter(query => query.isStale());
    
    logger.debug('Cache', 'Cache optimization', { 
      totalQueries: queries.length, 
      staleQueries: staleQueries.length 
    });

    // Remove stale queries that haven't been used recently
    staleQueries.forEach(query => {
      const lastUsed = query.state.dataUpdatedAt;
      const oneHourAgo = Date.now() - (1000 * 60 * 60);
      
      if (lastUsed < oneHourAgo) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }, [queryClient]);

  // Get cache strategy for a given query type
  const getCacheStrategy = useCallback((
    queryType: 'static' | 'dynamic' | 'realtime' = 'dynamic'
  ): CacheStrategy => {
    return DEFAULT_STRATEGIES[queryType];
  }, []);

  return {
    invalidateRelatedQueries,
    optimisticUpdate,
    prefetchWithStrategy,
    backgroundRefresh,
    optimizeCacheSize,
    getCacheStrategy
  };
};