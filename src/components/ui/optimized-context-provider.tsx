/**
 * Optimized Context Provider - Progressive loading with timeouts and fallbacks
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

// Progressive loading system
import { ProgressiveLoadingProvider, ContextWrapper } from '@/components/ui/progressive-loading-provider';

// Critical providers (loaded first)
import { OfflineProvider } from '@/contexts/OfflineContext';

// Non-critical providers (loaded after boot)
import { DeferredTaskProvider } from '@/contexts/DeferredTaskContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { BackgroundProvider } from '@/contexts/BackgroundContext';
import { KeyboardShortcutsProvider } from '@/contexts/KeyboardShortcutsContext';
import { PomodoroProvider } from '@/contexts/PomodoroContext';
import { PropertyDialogProvider } from '@/contexts/PropertyDialogContext';
import { IPadNavigationProvider } from '@/contexts/IPadNavigationContext';
import { MacNavigationProvider } from '@/contexts/MacNavigationContext';

import { createOptimizedQueryClient } from '@/lib/optimizedCache';

const queryClient = createOptimizedQueryClient();

interface OptimizedAppProviderProps {
  children: React.ReactNode;
}

export const OptimizedAppProvider = ({ children }: OptimizedAppProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProgressiveLoadingProvider>
        {/* Critical contexts - load immediately */}
        <ContextWrapper name="theme" timeout={1000}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ContextWrapper name="tooltip" timeout={1000}>
              <TooltipProvider>
                <ContextWrapper name="offline" timeout={1000}>
                  <OfflineProvider>
                    {/* Basic app ready - render immediately */}
                    <Toaster />
                    
                    {/* Non-critical contexts - load in background */}
                    <ContextWrapper name="security" timeout={3000}>
                      <SecurityProvider>
                        <ContextWrapper name="background" timeout={3000}>
                          <BackgroundProvider>
                            <ContextWrapper name="notification" timeout={3000}>
                              <NotificationProvider>
                                <ContextWrapper name="task" timeout={5000}>
                                  <DeferredTaskProvider>
                                    <ContextWrapper name="keyboard" timeout={2000}>
                                      <KeyboardShortcutsProvider>
                                        <ContextWrapper name="pomodoro" timeout={2000}>
                                          <PomodoroProvider>
                                            <ContextWrapper name="property" timeout={2000}>
                                              <PropertyDialogProvider>
                                                <ContextWrapper name="navigation" timeout={2000}>
                                                  <IPadNavigationProvider>
                                                    <MacNavigationProvider>
                                                      {children}
                                                    </MacNavigationProvider>
                                                  </IPadNavigationProvider>
                                                </ContextWrapper>
                                              </PropertyDialogProvider>
                                            </ContextWrapper>
                                          </PomodoroProvider>
                                        </ContextWrapper>
                                      </KeyboardShortcutsProvider>
                                    </ContextWrapper>
                                  </DeferredTaskProvider>
                                </ContextWrapper>
                              </NotificationProvider>
                            </ContextWrapper>
                          </BackgroundProvider>
                        </ContextWrapper>
                      </SecurityProvider>
                    </ContextWrapper>
                    
                  </OfflineProvider>
                </ContextWrapper>
              </TooltipProvider>
            </ContextWrapper>
          </ThemeProvider>
        </ContextWrapper>
      </ProgressiveLoadingProvider>
    </QueryClientProvider>
  );
};