/**
 * Optimized Context Provider - Reduces provider nesting and improves performance
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

// Optimized providers
import { UnifiedTaskProvider } from '@/contexts/UnifiedTaskContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { BackgroundProvider } from '@/contexts/BackgroundContext';
import { KeyboardShortcutsProvider } from '@/contexts/KeyboardShortcutsContext';
import { PomodoroProvider } from '@/contexts/PomodoroContext';
import { PropertyDialogProvider } from '@/contexts/PropertyDialogContext';
import { OfflineProvider } from '@/contexts/OfflineContext';

import { createOptimizedQueryClient } from '@/lib/optimizedCache';

const queryClient = createOptimizedQueryClient();

interface OptimizedAppProviderProps {
  children: React.ReactNode;
}

export const OptimizedAppProvider = ({ children }: OptimizedAppProviderProps) => {
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
                          <Toaster />
                          {children}
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