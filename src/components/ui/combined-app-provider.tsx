/**
 * Combined App Provider - Orchestrated provider system with phased loading
 * Uses provider-engine for isolated error handling and progressive mounting
 */

import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createOptimizedQueryClient } from '@/lib/optimizedCache';
import { bootTracer } from '@/lib/bootTracer';

// New Provider Engine
import { 
  CanaryProvider, 
  OrchestratedProviders, 
  checkReactDuplication 
} from '@/components/ui/provider-engine';
import { PROVIDER_REGISTRY, getProvidersUpToPhase } from '@/contexts/providers/registry';

// Legacy imports for backward compatibility
import { OfflineProvider } from '@/contexts/OfflineContext';

const queryClient = createOptimizedQueryClient();

// Safe TooltipProvider wrapper - only initializes after mount
const SafeTooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    bootTracer.trace('TooltipProvider', 'Mounted safely after React init');
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <TooltipProvider>{children}</TooltipProvider>;
};

interface CombinedAppProviderProps {
  children: React.ReactNode;
  minimal?: boolean; // Emergency minimal mode
  safariUltraSafe?: boolean; // Ultra-safe mode for Safari debugging
  disabledProviders?: string[]; // Names of providers to disable via ?disable=
  useLegacyProviders?: boolean; // Fallback to old provider composition
}

export const CombinedAppProvider = ({ 
  children, 
  minimal = false, 
  safariUltraSafe = false, 
  disabledProviders = [],
  useLegacyProviders = false
}: CombinedAppProviderProps) => {
  
  // Check for React duplication on mount
  useEffect(() => {
    checkReactDuplication();
  }, []);

  // Safari Ultra-Safe mode: ONLY QueryClient + ThemeProvider + Toaster
  // No TooltipProvider, no custom contexts, no Service Worker
  if (safariUltraSafe) {
    bootTracer.trace('CombinedAppProvider', '🔴 SAFARI ULTRA-SAFE MODE - Only essential providers');
    return (
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          {children}
        </NextThemesProvider>
      </QueryClientProvider>
    );
  }

  // Minimal mode: Phase 1 providers only + optional Offline
  if (minimal) {
    bootTracer.trace('CombinedAppProvider', '⚠️ Minimal mode - Phase 1 providers only');
    
    const phase1Providers = getProvidersUpToPhase(1);
    
    return (
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SafeTooltipProvider>
            <Toaster />
            <CanaryProvider>
              <OrchestratedProviders
                providers={phase1Providers}
                disabledProviders={disabledProviders}
                maxPhase={1}
              >
                {!disabledProviders.includes('Offline') ? (
                  <OfflineProvider>{children}</OfflineProvider>
                ) : (
                  children
                )}
              </OrchestratedProviders>
            </CanaryProvider>
          </SafeTooltipProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    );
  }

  // Full mode: orchestrated provider mounting with phased loading
  bootTracer.trace('CombinedAppProvider', '✅ Full mode - orchestrated providers', { 
    disabledProviders,
    useLegacyProviders,
    totalProviders: PROVIDER_REGISTRY.length 
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <SafeTooltipProvider>
          <Toaster />
          <CanaryProvider>
            <OrchestratedProviders
              providers={PROVIDER_REGISTRY}
              disabledProviders={disabledProviders}
            >
              {children}
            </OrchestratedProviders>
          </CanaryProvider>
        </SafeTooltipProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
};
