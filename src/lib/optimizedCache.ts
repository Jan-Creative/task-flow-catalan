import { QueryClient } from "@tanstack/react-query";

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
        // Smart cache timing based on data type
        staleTime: 1000 * 60 * 5, // 5 minutes (default)
        gcTime: 1000 * 60 * 15, // 15 minutes 
        
        // Optimized retry strategy
        retry: (failureCount, error: any) => {
          // Don't retry auth errors
          if (error?.status === 401 || error?.status === 403) return false;
          // Retry network errors up to 3 times
          return failureCount < 3;
        },
        
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Smart refetching
        refetchOnWindowFocus: false,
        refetchOnMount: "always", // Always fresh data on mount
        refetchOnReconnect: true, // Refetch after network reconnection
        
        // Background updates for stale data
        refetchInterval: 1000 * 60 * 10, // 10 minutes for background refresh
        refetchIntervalInBackground: false,
      },
      mutations: {
        // Optimistic updates with rollback
        retry: 1,
        retryDelay: 1000,
      }
    },
    
    // Optimized memory management
    queryCache: {
      onError: (error) => {
        console.error('Query Cache Error:', error);
      },
      onSuccess: (data, query) => {
        // Log successful queries for debugging in dev mode
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Cache hit for: ${query.queryKey.join('-')}`);
        }
      }
    } as any,
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
  
  // Optimize cache size (remove old unused data)
  optimizeCacheSize: (queryClient: QueryClient) => {
    // Remove queries that haven't been accessed in 30 minutes
    const cutoffTime = Date.now() - (1000 * 60 * 30);
    
    queryClient.getQueryCache().getAll().forEach(query => {
      if (query.state.dataUpdatedAt < cutoffTime && !query.getObserversCount()) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
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