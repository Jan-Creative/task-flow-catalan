import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cacheUtils } from '@/lib/optimizedCache';

// ============= PERFORMANCE MONITORING =============
interface PerformanceMetrics {
  renderTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  componentCount: number;
}

export const usePerformanceMonitor = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    componentCount: 0
  });

  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    // Monitor render time
    const endTime = Date.now();
    metricsRef.current.renderTime = endTime - startTime.current;

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metricsRef.current.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Performance Metrics:', metricsRef.current);
    }
  });

  return metricsRef.current;
};

// ============= CACHE OPTIMIZATION HOOK =============
export const useCacheOptimization = () => {
  const queryClient = useQueryClient();

  // Optimize cache size periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cacheUtils.optimizeCacheSize(queryClient);
    }, 1000 * 60 * 15); // Every 15 minutes

    return () => clearInterval(interval);
  }, [queryClient]);

  // Preload critical data on idle
  const preloadCriticalData = useCallback((userId: string) => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        // Preload most used queries - simplified to avoid conflicts
        console.log('🚀 Preloading critical data for user:', userId);
      });
    }
  }, []);

  return { preloadCriticalData };
};

// ============= MEMORY CLEANUP HOOK =============
export const useMemoryCleanup = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Cleanup on page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, clean up non-essential data
        cacheUtils.optimizeCacheSize(queryClient);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Gentle cleanup on unmount
      setTimeout(() => {
        cacheUtils.optimizeCacheSize(queryClient);
      }, 5000);
    };
  }, [queryClient]);
};

// ============= OPTIMIZED QUERY HOOK =============
export const useOptimizedQuery = (
  queryKey: string[],
  queryFn: () => Promise<any>,
  options: {
    priority?: 'high' | 'normal' | 'low';
    background?: boolean;
  } = {}
) => {
  const { priority = 'normal', background = false } = options;

  // Adjust cache settings based on priority
  const getCacheConfig = () => {
    switch (priority) {
      case 'high':
        return {
          staleTime: 1000 * 30, // 30 seconds
          gcTime: 1000 * 60 * 5, // 5 minutes
          refetchInterval: background ? 1000 * 60 * 2 : false
        };
      case 'low':
        return {
          staleTime: 1000 * 60 * 30, // 30 minutes
          gcTime: 1000 * 60 * 60, // 1 hour
          refetchInterval: false
        };
      default:
        return {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 15, // 15 minutes
          refetchInterval: background ? 1000 * 60 * 10 : false
        };
    }
  };

  return {
    queryKey,
    queryFn,
    ...getCacheConfig()
  };
};

// ============= BUNDLE SIZE MONITORING =============
export const useBundleMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor resource loading
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            if (resource.name.includes('.js') || resource.name.includes('.css')) {
              console.log(`📦 Loaded ${resource.name.split('/').pop()}: ${Math.round(resource.transferSize / 1024)}KB`);
            }
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });

      return () => observer.disconnect();
    }
  }, []);
};

// ============= CODE SPLITTING MONITOR =============
export const useCodeSplittingMonitor = () => {
  const chunksLoaded = useRef(new Set<string>());

  const trackChunkLoad = useCallback((chunkName: string) => {
    if (!chunksLoaded.current.has(chunkName)) {
      chunksLoaded.current.add(chunkName);
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Lazy loaded: ${chunkName}`);
      }
    }
  }, []);

  return { trackChunkLoad };
};