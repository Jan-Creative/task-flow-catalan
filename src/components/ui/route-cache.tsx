import React, { memo, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteCache {
  [path: string]: {
    content: React.ReactNode;
    timestamp: number;
    scrollPosition: number;
  };
}

interface RouteCacheProviderProps {
  children: React.ReactNode;
  maxAge?: number; // in milliseconds
  maxEntries?: number;
}

const routeCache: RouteCache = {};
const CACHE_KEY_PREFIX = 'route_cache_';

export const RouteCacheProvider = memo(({ 
  children, 
  maxAge = 15 * 60 * 1000, // 15 minutes - Extended cache
  maxEntries = 20 // More entries for better navigation
}: RouteCacheProviderProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Clean up old cache entries
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      const paths = Object.keys(routeCache);
      
      // Remove expired entries
      paths.forEach(path => {
        if (now - routeCache[path].timestamp > maxAge) {
          delete routeCache[path];
        }
      });
      
      // Remove oldest entries if we exceed maxEntries
      const remainingPaths = Object.keys(routeCache);
      if (remainingPaths.length > maxEntries) {
        const sortedPaths = remainingPaths.sort((a, b) => 
          routeCache[a].timestamp - routeCache[b].timestamp
        );
        
        const toRemove = sortedPaths.slice(0, remainingPaths.length - maxEntries);
        toRemove.forEach(path => delete routeCache[path]);
      }
    };
    
    cleanup();
    const interval = setInterval(cleanup, 60000); // Clean every minute
    
    return () => clearInterval(interval);
  }, [maxAge, maxEntries]);
  
  return <>{children}</>;
});

interface CachedRouteProps {
  path: string;
  children: React.ReactNode;
  enabled?: boolean;
}

export const CachedRoute = memo(({ path, children, enabled = true }: CachedRouteProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Save scroll position when component unmounts
  useEffect(() => {
    return () => {
      if (enabled && scrollRef.current) {
        const scrollPosition = scrollRef.current.scrollTop;
        if (routeCache[path]) {
          routeCache[path].scrollPosition = scrollPosition;
        }
      }
    };
  }, [path, enabled]);
  
  // Restore scroll position when component mounts
  useEffect(() => {
    if (enabled && routeCache[path] && scrollRef.current) {
      scrollRef.current.scrollTop = routeCache[path].scrollPosition;
    }
  }, [path, enabled]);
  
  // Cache the content
  useEffect(() => {
    if (enabled) {
      routeCache[path] = {
        content: children,
        timestamp: Date.now(),
        scrollPosition: routeCache[path]?.scrollPosition || 0
      };
    }
  }, [path, children, enabled]);
  
  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-auto"
      style={{ contain: 'layout style paint' }}
    >
      {children}
    </div>
  );
});

// Hook to check if a route is cached
export const useRouteCached = (path: string): boolean => {
  return useMemo(() => {
    return !!routeCache[path] && (Date.now() - routeCache[path].timestamp) < 15 * 60 * 1000;
  }, [path]);
};

// Hook to preload a route
export const usePreloadRoute = () => {
  return useCallback((path: string, content: React.ReactNode) => {
    routeCache[path] = {
      content,
      timestamp: Date.now(),
      scrollPosition: 0
    };
  }, []);
};