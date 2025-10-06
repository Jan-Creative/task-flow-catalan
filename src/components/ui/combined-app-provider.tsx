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

// Safe TooltipProvider wrapper - only initializes after mount
const SafeTooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
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
  disabledProviders?: string[]; // Names of providers to disable via ?disable=
}

export const CombinedAppProvider = ({ children, minimal = false, disabledProviders = [] }: CombinedAppProviderProps) => {
  const isDisabled = React.useCallback((name: string) => disabledProviders.includes(name), [disabledProviders]);

  // Log React version for diagnostics
  React.useEffect(() => {
    bootTracer.trace('React', `Version: ${React.version}`, {
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
    });
  }, []);

  // Minimal mode: only essential providers
  if (minimal) {
    let minimalContent = (
      <>
        <Toaster />
        {children}
      </>
    );

    if (!isDisabled('Offline')) {
      minimalContent = <OfflineProvider>{minimalContent}</OfflineProvider>;
    }

    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {isDisabled('Tooltip') ? minimalContent : (
            <SafeTooltipProvider>
              {minimalContent}
            </SafeTooltipProvider>
          )}
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
    content = <Provider {...props}>{content}</Provider>;
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
        {isDisabled('Tooltip') ? content : (
          <SafeTooltipProvider>
            {content}
          </SafeTooltipProvider>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
};
