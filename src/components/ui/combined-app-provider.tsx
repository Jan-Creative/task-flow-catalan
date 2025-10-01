/**
 * Combined App Provider - Flat context architecture for optimal React 18 performance
 * All contexts loaded synchronously without nesting to prevent queue issues
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

// All providers imported directly - no progressive loading
import { OfflineProvider } from '@/contexts/OfflineContext';
import { UnifiedTaskProvider } from '@/contexts/UnifiedTaskContext';
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

interface CombinedAppProviderProps {
  children: React.ReactNode;
  minimal?: boolean; // Emergency minimal mode
}

export const CombinedAppProvider = ({ children, minimal = false }: CombinedAppProviderProps) => {
  // Minimal mode: only essential providers
  if (minimal) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <OfflineProvider>
              <Toaster />
              {children}
            </OfflineProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  // Full mode: all providers in flat composition
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <OfflineProvider>
            <SecurityProvider>
              <BackgroundProvider>
                <NotificationProvider>
                  <UnifiedTaskProvider>
                    <KeyboardShortcutsProvider>
                      <PomodoroProvider>
                        <PropertyDialogProvider>
                          <IPadNavigationProvider>
                            <MacNavigationProvider>
                              <Toaster />
                              {children}
                            </MacNavigationProvider>
                          </IPadNavigationProvider>
                        </PropertyDialogProvider>
                      </PomodoroProvider>
                    </KeyboardShortcutsProvider>
                  </UnifiedTaskProvider>
                </NotificationProvider>
              </BackgroundProvider>
            </SecurityProvider>
          </OfflineProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
