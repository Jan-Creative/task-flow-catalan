/**
 * Performance Optimization Hooks - Hooks optimitzats per millor rendiment
 */

import { 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect,
  startTransition,
  useDeferredValue
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

// ============= MEMOIZATION UTILITIES =============

/**
 * Stable callback hook - evita re-renders innecessaris de components fills
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
};

/**
 * Deep memo hook - memoitza objectes complexos amb comparació profunda
 */
export const useDeepMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();

  const depsChanged = useMemo(() => {
    if (!ref.current) return true;
    
    if (ref.current.deps.length !== deps.length) return true;
    
    return deps.some((dep, index) => {
      const prevDep = ref.current!.deps[index];
      return !Object.is(dep, prevDep);
    });
  }, deps);

  if (depsChanged) {
    ref.current = {
      deps: [...deps],
      value: factory()
    };
  }

  return ref.current.value;
};

// ============= PERFORMANCE MONITORING =============

/**
 * Component render tracker - detecta components que es re-renderiyen massa
 */
export const useRenderTracker = (componentName: string, threshold = 5) => {
  const renderCount = useRef(0);
  const lastLogTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    
    const now = Date.now();
    const timeSinceLastLog = now - lastLogTime.current;
    
    // Log if renders exceed threshold in less than 1 second
    if (renderCount.current >= threshold && timeSinceLastLog < 1000) {
      console.warn(
        `🚨 ${componentName} re-rendered ${renderCount.current} times in ${timeSinceLastLog}ms`
      );
      renderCount.current = 0;
      lastLogTime.current = now;
    }
    
    // Reset counter every 2 seconds
    if (timeSinceLastLog > 2000) {
      renderCount.current = 1;
      lastLogTime.current = now;
    }
  });

  return renderCount.current;
};

// ============= OPTIMIZED STATE MANAGEMENT =============

/**
 * Debounced value hook - redueix re-renders per inputs ràpids
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Transition state hook - optimitza actualitzacions no urgents
 */
export const useTransitionState = <T>(initialValue: T) => {
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const setValueWithTransition = useCallback((newValue: T | ((prev: T) => T)) => {
    startTransition(() => {
      setValue(newValue);
    });
  }, []);

  return [value, setValueWithTransition, isPending] as const;
};

// ============= CACHE OPTIMIZATION =============

/**
 * Smart cache hook - gestiona cache amb invalidació intel·ligent
 */
export const useSmartCache = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: {
    staleTime?: number;
    optimisticUpdates?: boolean;
    backgroundRefetch?: boolean;
  } = {}
) => {
  const queryClient = useQueryClient();
  const { staleTime = 5 * 60 * 1000, optimisticUpdates = false, backgroundRefetch = true } = options;

  // Optimistic update function
  const optimisticUpdate = useCallback((updater: (old: T | undefined) => T) => {
    if (!optimisticUpdates) return;

    queryClient.setQueryData(queryKey, updater);
  }, [queryClient, queryKey, optimisticUpdates]);

  // Invalidate related queries
  const invalidateRelated = useCallback((relatedKeys: string[][]) => {
    relatedKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient]);

  // Prefetch function
  const prefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime
    });
  }, [queryClient, queryKey, queryFn, staleTime]);

  return {
    optimisticUpdate,
    invalidateRelated,
    prefetch
  };
};

// ============= LIST OPTIMIZATION =============

/**
 * Virtual list hook - optimitza llistes llargues
 */
export const useVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, items.length);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
};

// ============= INTERSECTION OBSERVER =============

/**
 * Intersection observer hook - per lazy loading i infinite scroll
 */
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLElement>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          callbackRef.current();
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [options]);

  return targetRef;
};

// Re-export useState for consistency
import { useState, useTransition } from 'react';