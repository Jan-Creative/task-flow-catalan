/**
 * Combined App Provider - Flat context architecture for optimal React 18 performance
 * All contexts loaded synchronously without nesting to prevent queue issues
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import bootTracer from '@/lib/bootTracer';

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
import { KeyboardNavigationProvider } from '@/contexts/KeyboardNavigationContext';

import { createOptimizedQueryClient } from '@/lib/optimizedCache';

const queryClient = createOptimizedQueryClient();

interface CombinedAppProviderProps {
  children: React.ReactNode;
  minimal?: boolean; // Emergency minimal mode
  disabledProviders?: string[]; // Names of providers to disable via ?disable=
}

export const CombinedAppProvider = ({ children, minimal = false, disabledProviders = [] }: CombinedAppProviderProps) => {
  const isDisabled = React.useCallback((name: string) => disabledProviders.includes(name), [disabledProviders]);

  const ProviderGuard: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => (
    <EnhancedErrorBoundary context={`Provider:${name}`} fallback={null} onError={(error) => bootTracer.error(`Provider:${name}`, error)}>
      {children}
    </EnhancedErrorBoundary>
  );

  // Minimal mode: only essential providers
  if (minimal) {
    let minimalContent = (
      <>
        <Toaster />
        {children}
      </>
    );

    if (!isDisabled('Offline')) {
      minimalContent = (
        <ProviderGuard name="Offline">
          <OfflineProvider>{minimalContent}</OfflineProvider>
        </ProviderGuard>
      );
    }

    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {minimalContent}
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  // Full mode: compose providers dynamically in reverse nesting order
  let content: React.ReactNode = (
    <>
      <Toaster />
      {children}
    </>
  );

  const wrapProvider = (name: string, Provider: React.ComponentType<any>, props: Record<string, any> = {}) => {
    if (isDisabled(name)) return;
    content = (
      <ProviderGuard name={name}>
        <Provider {...props}>{content}</Provider>
      </ProviderGuard>
    );
  };

  // Innermost to outermost (reverse of visual nesting)
  wrapProvider('KeyboardNavigation', KeyboardNavigationProvider);
  wrapProvider('MacNavigation', MacNavigationProvider);
  wrapProvider('IPadNavigation', IPadNavigationProvider);
  wrapProvider('PropertyDialog', PropertyDialogProvider);
  wrapProvider('Pomodoro', PomodoroProvider);
  wrapProvider('KeyboardShortcuts', KeyboardShortcutsProvider);
  wrapProvider('UnifiedTask', UnifiedTaskProvider);
  wrapProvider('Notification', NotificationProvider);
  wrapProvider('Background', BackgroundProvider);
  wrapProvider('Security', SecurityProvider);
  wrapProvider('Offline', OfflineProvider);

  // Full mode output with global providers
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          {content}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
