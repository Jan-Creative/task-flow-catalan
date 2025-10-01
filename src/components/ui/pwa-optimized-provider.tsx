import React, { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { createOptimizedQueryClient } from '@/lib/optimizedCache';
import { PWAErrorBoundary } from './pwa-error-boundary';

// Essential contexts only for PWA
import { UnifiedTaskProvider } from '@/contexts/UnifiedTaskContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

const queryClient = createOptimizedQueryClient();

interface PWAOptimizedProviderProps {
  children: React.ReactNode;
  isPWA?: boolean;
}

// Individual error boundaries for each critical context
const SafeTaskProvider = ({ children }: { children: React.ReactNode }) => (
  <PWAErrorBoundary fallback={<div>Task system unavailable</div>}>
    <Suspense fallback={<div>Loading tasks...</div>}>
      <UnifiedTaskProvider>{children}</UnifiedTaskProvider>
    </Suspense>
  </PWAErrorBoundary>
);

const SafeOfflineProvider = ({ children }: { children: React.ReactNode }) => (
  <PWAErrorBoundary fallback={children}>
    <Suspense fallback={children}>
      <OfflineProvider>{children}</OfflineProvider>
    </Suspense>
  </PWAErrorBoundary>
);

const SafeNotificationProvider = ({ children }: { children: React.ReactNode }) => (
  <PWAErrorBoundary fallback={children}>
    <Suspense fallback={children}>
      <NotificationProvider>{children}</NotificationProvider>
    </Suspense>
  </PWAErrorBoundary>
);

export const PWAOptimizedProvider = ({ children, isPWA = false }: PWAOptimizedProviderProps) => {
  return (
    <PWAErrorBoundary isPWA={isPWA}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem 
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SafeOfflineProvider>
              <SafeNotificationProvider>
                <SafeTaskProvider>
                  <Toaster />
                  {children}
                </SafeTaskProvider>
              </SafeNotificationProvider>
            </SafeOfflineProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </PWAErrorBoundary>
  );
};
