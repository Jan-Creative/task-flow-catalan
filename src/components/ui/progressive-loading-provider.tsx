/**
 * Progressive Loading Provider - Loads contexts with timeouts and fallbacks
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { logger } from '@/lib/logger';

interface ProgressiveLoadingState {
  stage: 'booting' | 'critical-loaded' | 'full-loaded' | 'error';
  loadedContexts: string[];
  errors: Array<{ context: string; error: string }>;
  progress: number;
}

interface ProgressiveLoadingContextValue extends ProgressiveLoadingState {
  isContextLoaded: (contextName: string) => boolean;
  markContextLoaded: (contextName: string) => void;
  markContextError: (contextName: string, error: string) => void;
}

const ProgressiveLoadingContext = createContext<ProgressiveLoadingContextValue | null>(null);

export const useProgressiveLoading = () => {
  const context = useContext(ProgressiveLoadingContext);
  if (!context) {
    throw new Error('useProgressiveLoading must be used within ProgressiveLoadingProvider');
  }
  return context;
};

interface ProgressiveLoadingProviderProps {
  children: React.ReactNode;
}

export const ProgressiveLoadingProvider = ({ children }: ProgressiveLoadingProviderProps) => {
  const [state, setState] = useState<ProgressiveLoadingState>({
    stage: 'booting',
    loadedContexts: [],
    errors: [],
    progress: 0
  });

  const criticalContexts = ['theme', 'tooltip', 'offline'];
  const totalContexts = ['theme', 'tooltip', 'offline', 'security', 'background', 'notification', 'task', 'keyboard', 'pomodoro', 'property', 'navigation'];

  const contextValue = useMemo(() => ({
    ...state,
    isContextLoaded: (contextName: string) => state.loadedContexts.includes(contextName),
    markContextLoaded: (contextName: string) => {
      setState(prev => {
        const newLoaded = [...prev.loadedContexts, contextName];
        const progress = Math.round((newLoaded.length / totalContexts.length) * 100);
        
        let stage = prev.stage;
        if (criticalContexts.every(ctx => newLoaded.includes(ctx)) && stage === 'booting') {
          stage = 'critical-loaded';
          logger.info('ProgressiveLoading', 'Critical contexts loaded, app ready for basic use');
          // Signal main app that critical loading is done
          if (typeof window !== 'undefined') {
            window.__APP_BOOTED = true;
            window.__clearBootWatchdog?.();
          }
        }
        if (newLoaded.length === totalContexts.length) {
          stage = 'full-loaded';
          logger.info('ProgressiveLoading', 'All contexts loaded');
        }

        return {
          ...prev,
          loadedContexts: newLoaded,
          stage,
          progress
        };
      });
    },
    markContextError: (contextName: string, error: string) => {
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, { context: contextName, error }],
        stage: prev.errors.length > 2 ? 'error' : prev.stage
      }));
    }
  }), [state, criticalContexts, totalContexts]);

  return (
    <ProgressiveLoadingContext.Provider value={contextValue}>
      {children}
    </ProgressiveLoadingContext.Provider>
  );
};

interface ContextWrapperProps {
  name: string;
  children: React.ReactNode;
  timeout?: number;
  fallback?: React.ReactNode;
}

export const ContextWrapper = ({ 
  name, 
  children, 
  timeout = 2000,
  fallback = null 
}: ContextWrapperProps) => {
  const { markContextLoaded, markContextError } = useProgressiveLoading();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loaded) {
        const errorMsg = `Context ${name} failed to load within ${timeout}ms`;
        logger.warn('ContextWrapper', errorMsg);
        setError(errorMsg);
        markContextError(name, errorMsg);
      }
    }, timeout);

    // Simulate successful loading after a short delay
    const loadTimer = setTimeout(() => {
      setLoaded(true);
      markContextLoaded(name);
    }, 100);

    return () => {
      clearTimeout(timer);
      clearTimeout(loadTimer);
    };
  }, [name, timeout, loaded, markContextLoaded, markContextError]);

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};