import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

// ============= OPTIMIZED CACHE CONFIGURATION =============

// Cache keys organized by domain
export const CACHE_KEYS = {
  // Core data
  TASKS: (userId: string) => ['tasks', userId],
  FOLDERS: (userId: string) => ['folders', userId],
  
  // Properties 
  UNIFIED_PROPERTIES: (userId: string) => ['unified-properties', userId],
  TASK_PROPERTIES: (taskId: string) => ['task-properties', taskId],
  
  // Task features
  TASK_SUBTASKS: (taskId: string) => ['task-subtasks', taskId],
  TASK_NOTES: (taskId: string) => ['task-notes', taskId],
  
  // Legacy keys (for backward compatibility)
  LEGACY: {
    DADES: (userId: string) => ['dades-app', userId],
    PROPERTIES: ['properties']
  }
} as const;

// ============= CACHE OPTIMIZATION CONFIGURATION =============
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Enhanced cache timing based on data type and usage patterns
        staleTime: 1000 * 60 * 3, // 3 minutes (reduced for better real-time experience)
        gcTime: 1000 * 60 * 20, // 20 minutes (increased for better memory management)
        
        // Advanced retry strategy with exponential backoff
        retry: (failureCount, error: any) => {
          // Don't retry client errors (4xx)
          if (error?.status >= 400 && error?.status < 500) return false;
          // Don't retry fatal errors
          if (error?.code === 'PGRST301' || error?.code === 'PGRST204') return false;
          // Retry network and server errors up to 3 times
          return failureCount < 3;
        },
        
        retryDelay: (attemptIndex, error: any) => {
          // Shorter delays for likely temporary issues
          const baseDelay = (error && typeof error === 'object' && error.status >= 500) ? 500 : 1000;
          return Math.min(baseDelay * 2 ** attemptIndex, 20000);
        },
        
        // Intelligent refetching based on user activity
        refetchOnWindowFocus: (query) => {
          // Only refetch recent queries that might be stale
          const lastUpdated = query.state.dataUpdatedAt;
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          return lastUpdated < fiveMinutesAgo;
        },
        
        refetchOnMount: (query) => {
          // Smarter mount refetching
          const lastUpdated = query.state.dataUpdatedAt;
          const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
          return lastUpdated < twoMinutesAgo || query.state.data === undefined;
        },
        
        refetchOnReconnect: 'always', // Always refetch after network reconnection
        
        // Reduced background refresh for better performance
        refetchInterval: 1000 * 60 * 15, // 15 minutes for background refresh
        refetchIntervalInBackground: false,
        
        // Network mode optimization
        networkMode: 'online', // Only fetch when online
      },
      mutations: {
        // Enhanced mutation strategy
        retry: (failureCount, error: any) => {
          // Retry network errors only
          if (error?.status >= 500 || !error?.status) return failureCount < 2;
          return false;
        },
        retryDelay: 2000, // Fixed 2 second delay for mutations
        
        // Network mode for mutations
        networkMode: 'online',
      }
    },
    
    // Global query client configuration
    queryCache: new QueryCache({
      onError: (error, query) => {
        console.warn(`Query failed [${query.queryKey.join(', ')}]:`, error);
      },
      onSuccess: (data, query) => {
        // Optional: Log successful queries in development
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Query success [${query.queryKey.join(', ')}]`);
        }
      }
    }),
    
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        console.error('Mutation failed:', error, mutation);
      }
    })
  });
};

// ============= CACHE UTILITY FUNCTIONS =============
export const cacheUtils = {
  // Selective cache invalidation
  invalidateTaskData: (queryClient: QueryClient, userId: string, taskId?: string) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.TASKS(userId) });
    
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.TASK_PROPERTIES(taskId) });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.TASK_SUBTASKS(taskId) });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.TASK_NOTES(taskId) });
    }
  },
  
  // Preload related data
  preloadTaskData: async (queryClient: QueryClient, taskId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: CACHE_KEYS.TASK_PROPERTIES(taskId),
        staleTime: 1000 * 60 * 2 // 2 minutes for related data
      }),
      queryClient.prefetchQuery({
        queryKey: CACHE_KEYS.TASK_SUBTASKS(taskId),
        staleTime: 1000 * 60 * 2
      }),
      queryClient.prefetchQuery({
        queryKey: CACHE_KEYS.TASK_NOTES(taskId),
        staleTime: 1000 * 60 * 5 // Notes change less frequently
      })
    ]);
  },
  
  // Clear all user data (useful for logout)
  clearUserCache: (queryClient: QueryClient, userId: string) => {
    queryClient.removeQueries({ queryKey: CACHE_KEYS.TASKS(userId) });
    queryClient.removeQueries({ queryKey: CACHE_KEYS.FOLDERS(userId) });
    queryClient.removeQueries({ queryKey: CACHE_KEYS.UNIFIED_PROPERTIES(userId) });
    queryClient.removeQueries({ queryKey: CACHE_KEYS.LEGACY.DADES(userId) });
  },
  
  // Enhanced cache optimization with memory monitoring
  optimizeCacheSize: (queryClient: QueryClient) => {
    const queries = queryClient.getQueryCache().getAll();
    const cutoffTime = Date.now() - (1000 * 60 * 30); // 30 minutes
    
    let removedCount = 0;
    let totalMemoryFreed = 0;
    
    queries.forEach(query => {
      const shouldRemove = (
        query.state.dataUpdatedAt < cutoffTime && 
        !query.getObserversCount() &&
        query.state.status !== 'pending'
      );
      
      if (shouldRemove) {
        // Estimate memory usage before removal
        const estimatedSize = JSON.stringify(query.state.data || {}).length;
        totalMemoryFreed += estimatedSize;
        
        queryClient.removeQueries({ queryKey: query.queryKey });
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      console.log(`🧹 Cache optimized: ${removedCount} queries removed, ~${(totalMemoryFreed / 1024).toFixed(1)}KB freed`);
    }
    
    return { removedCount, memoryFreed: totalMemoryFreed };
  },
  
  // Monitor cache health
  getCacheStats: (queryClient: QueryClient) => {
    const queries = queryClient.getQueryCache().getAll();
    const mutations = queryClient.getMutationCache().getAll();
    
    const stats = {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      pendingQueries: queries.filter(q => q.state.status === 'pending').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      totalMutations: mutations.length,
      pendingMutations: mutations.filter(m => m.state.status === 'pending').length,
      estimatedMemoryUsage: queries.reduce((acc, query) => {
        return acc + JSON.stringify(query.state.data || {}).length;
      }, 0)
    };
    
    return stats;
  }
};

// ============= SPECIALIZED CACHE CONFIGURATIONS =============
export const CACHE_CONFIGS = {
  // High-frequency data (tasks, quick updates)
  REALTIME: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // 2 minutes
  },
  
  // Medium-frequency data (properties, folders)
  STANDARD: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  },
  
  // Low-frequency data (settings, static content)
  PERSISTENT: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: false, // No background refetch
  }
};