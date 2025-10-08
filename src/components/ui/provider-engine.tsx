import React, { Component, ReactNode, Suspense, useEffect, useState } from 'react';
import { bootTracer } from '@/lib/bootTracer';
import { logger } from '@/lib/logger';
import { EnhancedErrorBoundary } from './enhanced-error-boundary';
import { ProviderLoadingFallback } from './provider-loading-fallback';
import { useProviderStatus } from '@/contexts/ProviderStatusContext';

// ============= PROVIDER BOUNDARY =============
interface ProviderBoundaryProps {
  name: string;
  children: ReactNode;
  onError?: (name: string, error: Error) => void;
  fallback?: React.ComponentType<{ children: ReactNode }>;
}

interface ProviderBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ProviderBoundary extends Component<ProviderBoundaryProps, ProviderBoundaryState> {
  constructor(props: ProviderBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ProviderBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { name, onError } = this.props;
    
    // PHASE 5: Enhanced error logging with stack trace
    logger.error('ProviderBoundary', `Provider "${name}" caught error`, {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack
    });
    
    bootTracer.error(`Provider:${name}`, error, errorInfo);
    
    if (onError) {
      onError(name, error);
    }
  }

  render() {
    if (this.state.hasError) {
      // PHASE 2 IMPROVEMENT: Non-blocking error handling
      // Instead of blocking render, log error and continue with children
      // This prevents black screens when a provider fails
      const { name, fallback } = this.props;
      
      logger.error('ProviderBoundary', `Provider "${name}" failed, continuing with degraded functionality`, this.state.error);
      
      // If a fallback provider is available, use it
      if (fallback) {
        const FallbackComponent = fallback;
        return <FallbackComponent>{this.props.children}</FallbackComponent>;
      }
      
      // Otherwise, just render children (provider context will be unavailable)
      return this.props.children;
    }

    return this.props.children;
  }
}

// ============= CANARY PROVIDER =============
// Tests if React's dispatcher is working correctly
export const CanaryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  try {
    // This will throw if dispatcher is null/undefined
    const [canaryState] = useState('canary-ok');
    
    useEffect(() => {
      bootTracer.mark('Canary', { status: 'passed', state: canaryState });
    }, [canaryState]);

    return <>{children}</>;
  } catch (error) {
    bootTracer.error('Canary', error, { 
      message: 'CRITICAL: React dispatcher not available',
      hint: 'Multiple React instances or corrupted cache'
    });
    throw error;
  }
};

// ============= PROVIDER REGISTRY TYPES =============
export interface ProviderConfig {
  name: string;
  Component: React.ComponentType<{ children: ReactNode }>;
  phase: number;
  mountAfterPaint?: boolean;
  enabledByDefault: boolean;
  props?: Record<string, unknown>;
  fallback?: React.ComponentType<{ children: ReactNode }>;
}

// ============= PHASED MOUNTING =============
interface PhasedMountProps {
  phase: number;
  children: ReactNode;
  onMount?: () => void;
}

const PhasedMount: React.FC<PhasedMountProps> = ({ phase, children, onMount }) => {
  const [mounted, setMounted] = useState(false); // PHASE 4: All phases start unmounted

  useEffect(() => {
    if (mounted) return;

    const mountProvider = () => {
      setMounted(true);
      onMount?.();
    };

    // PHASE 4: Secure phased mounting with requestIdleCallback + TIMEOUT FALLBACK
    if (phase === 1) {
      // Phase 1: Wait for React to be idle before mounting
      // This prevents race conditions with React's dispatcher
      let mounted = false;
      
      if (typeof requestIdleCallback !== 'undefined') {
        const idleId = requestIdleCallback(() => {
          if (!mounted) {
            mounted = true;
            mountProvider();
          }
        });
        
        // CRITICAL FIX: Fallback timeout if requestIdleCallback never fires
        const fallbackTimeout = setTimeout(() => {
          if (!mounted) {
            mounted = true;
            bootTracer.trace(`Provider:PhasedMount`, `Phase ${phase} fallback timeout triggered`, { phase });
            mountProvider();
          }
        }, 100); // 100ms max wait
        
        return () => {
          if (typeof cancelIdleCallback !== 'undefined') {
            cancelIdleCallback(idleId);
          }
          clearTimeout(fallbackTimeout);
        };
      } else {
        // Fallback for browsers without requestIdleCallback
        const timeoutId = setTimeout(mountProvider, 0);
        return () => clearTimeout(timeoutId);
      }
    } else if (phase === 2) {
      // Mount after first paint
      const rafId = requestAnimationFrame(mountProvider);
      return () => cancelAnimationFrame(rafId);
    } else if (phase === 3) {
      // Mount after next tick
      const timeoutId = setTimeout(mountProvider, 0);
      return () => clearTimeout(timeoutId);
    } else if (phase >= 4) {
      // Delayed mount for heavy providers
      const timeoutId = setTimeout(mountProvider, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [phase, mounted, onMount]);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
};

// ============= ORCHESTRATED PROVIDERS =============
interface OrchestratedProvidersProps {
  providers: ProviderConfig[];
  children: ReactNode;
  disabledProviders?: string[];
  maxPhase?: number;
}

export const OrchestratedProviders: React.FC<OrchestratedProvidersProps> = ({
  providers,
  children,
  disabledProviders = [],
  maxPhase = Infinity,
}) => {
  const [failedProviders, setFailedProviders] = useState<string[]>([]);
  
  // PHASE 6: Provider status monitoring
  const { updateProviderStatus } = useProviderStatus();

  const handleProviderError = (name: string, error: Error) => {
    // PHASE 5: Enhanced error tracking
    logger.error('OrchestratedProviders', `Provider "${name}" failed and will be disabled`, {
      error,
      message: error.message,
      stack: error.stack
    });
    
    bootTracer.error(`Provider:${name}`, error, { action: 'disabled' });
    
    // PHASE 6: Update provider status
    updateProviderStatus(name, { status: 'failed', error });
    
    // FASE 2: Visual toast per provider errors
    if (typeof window !== 'undefined' && 'toast' in window) {
      (window as any).toast?.({
        title: `⚠️ Provider "${name}" failed`,
        description: error.message || 'Unknown error',
        variant: 'destructive',
      });
    }
    
    setFailedProviders(prev => {
      if (prev.includes(name)) return prev;
      return [...prev, name];
    });
  };

  // Filter and sort providers
  const activeProviders = providers
    .filter(p => p.enabledByDefault || !disabledProviders.includes(p.name))
    .filter(p => !failedProviders.includes(p.name))
    .filter(p => !disabledProviders.includes(p.name))
    .filter(p => p.phase <= maxPhase)
    .sort((a, b) => a.phase - b.phase);

  bootTracer.trace('OrchestratedProviders', 'Mounting providers', {
    total: providers.length,
    active: activeProviders.length,
    disabled: disabledProviders,
    failed: failedProviders,
    maxPhase,
  });

  // Build nested structure from innermost to outermost
  let content = children;

  // Reverse order to build from innermost to outermost
  for (let i = activeProviders.length - 1; i >= 0; i--) {
    const provider = activeProviders[i];
    const { Component, name, phase, mountAfterPaint, props = {}, fallback } = provider;

    // PHASE 6: Initialize provider status
    updateProviderStatus(name, { phase, status: 'loading' });

    const startTime = performance.now();

    // PHASE 5: Enhanced async error protection
    // Wrap provider with ErrorBoundary to catch async errors (fetch, Supabase, etc.)
    const providerContent = (
      <ProviderBoundary name={name} onError={handleProviderError} fallback={fallback}>
        <EnhancedErrorBoundary
          onError={(error) => {
            logger.error('ProviderAsyncError', `Async error in provider "${name}"`, error);
            handleProviderError(name, error);
          }}
          fallback={fallback ? React.createElement(fallback, { children: content }) : content}
        >
          <Component {...props}>
            {content}
          </Component>
        </EnhancedErrorBoundary>
      </ProviderBoundary>
    );

    // PHASE 5: Enhanced Suspense with better fallback
    // Track mount time with proper cleanup
    const wrappedContent = (
      <Suspense fallback={<ProviderLoadingFallback providerName={name} />}>
        {mountAfterPaint ? (
          <PhasedMount 
            phase={phase}
            onMount={() => {
              const duration = performance.now() - startTime;
              const durationMs = `${duration.toFixed(2)}ms`;
              
              // FASE 3: Millor traçabilitat amb temps de mount
              bootTracer.trace(`Provider:${name}`, `✓ Mounted in phase ${phase}`, { 
                duration: durationMs,
                phase,
                timestamp: new Date().toISOString()
              });
              logger.debug('ProviderEngine', `Provider "${name}" mounted`, { 
                phase, 
                duration: durationMs,
                status: 'success'
              });
              
              // PHASE 6: Update provider status to mounted
              updateProviderStatus(name, { status: 'mounted', mountTime: duration });
            }}
          >
            {providerContent}
          </PhasedMount>
        ) : (
          providerContent
        )}
      </Suspense>
    );

    content = wrappedContent;
  }

  return <>{content}</>;
};

// ============= REACT DEDUPE CHECK =============
export const checkReactDuplication = () => {
  if (typeof window === 'undefined') return;

  try {
    // Check for multiple React DevTools instances
    const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    
    if (hook && hook.renderers) {
      const rendererCount = hook.renderers.size;
      
      if (rendererCount > 1) {
        bootTracer.error('ReactDedupe', 'Multiple React renderers detected', {
          count: rendererCount,
          hint: 'Check for duplicate React packages in node_modules'
        });
      } else {
        bootTracer.trace('ReactDedupe', 'Single React renderer detected ✓');
      }
    }
  } catch (error) {
    bootTracer.trace('ReactDedupe', 'Could not check for duplicates', { error });
  }
};
