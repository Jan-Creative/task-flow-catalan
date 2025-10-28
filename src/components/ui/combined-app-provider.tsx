/**
 * Combined App Provider - Simplified unified provider system
 * PHASE 1: Eliminated safariUltraSafe, minimal, and useLegacyProviders modes
 * Now uses single orchestrated flow with granular provider control via URL params
 * 
 * Usage:
 * - Normal: All providers active
 * - Debugging: ?disable=UnifiedTask,Notification (disable specific providers)
 * - Testing: ?maxPhase=2 (only load providers up to phase 2)
 */

import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createOptimizedQueryClient } from '@/lib/optimizedCache';
import { bootTracer } from '@/lib/bootTracer';

// Provider Engine
import { 
  CanaryProvider, 
  OrchestratedProviders, 
  checkReactDuplication 
} from '@/components/ui/provider-engine';
import { PROVIDER_REGISTRY } from '@/contexts/providers/registry';

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
  disabledProviders?: string[]; // Names of providers to disable via ?disable=Provider1,Provider2
  maxPhase?: number; // Maximum phase to load (for debugging/testing)
  disablePortals?: boolean; // FASE 6: Disable Toaster/Tooltip portals for diagnostic modes
}

export const CombinedAppProvider = ({ 
  children, 
  disabledProviders = [],
  maxPhase = Infinity,
  disablePortals = false
}: CombinedAppProviderProps) => {
  
  // PHASE 1: Simplified - check for React duplication on mount
  useEffect(() => {
    checkReactDuplication();
  }, []);

  // PHASE 1: Single unified mode with granular provider control
  // Use ?disable=Provider1,Provider2 or ?maxPhase=2 for degraded modes
  bootTracer.trace('CombinedAppProvider', '✅ Unified provider system', { 
    disabledProviders,
    maxPhase,
    disablePortals,
    totalProviders: PROVIDER_REGISTRY.length 
  });

  // FASE 6: Conditional rendering based on disablePortals
  if (disablePortals) {
    bootTracer.mark('CombinedAppProvider', 'Portals disabled (no Toaster/Tooltip)');
    return (
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CanaryProvider>
            <OrchestratedProviders
              providers={PROVIDER_REGISTRY}
              disabledProviders={disabledProviders}
              maxPhase={maxPhase}
            >
              {children}
            </OrchestratedProviders>
          </CanaryProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    );
  }

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
              maxPhase={maxPhase}
            >
              {children}
            </OrchestratedProviders>
          </CanaryProvider>
        </SafeTooltipProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
};
