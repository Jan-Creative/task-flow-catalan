import { lazy, Suspense, ReactNode } from 'react';
import React from 'react';

// ============= LAZY LOADED COMPONENTS =============

// Main pages
export const TodayPageLazy = lazy(() => import('@/pages/TodayPage'));
export const FoldersPageLazy = lazy(() => import('@/pages/FoldersPage'));
export const SettingsPageLazy = lazy(() => import('@/pages/SettingsPage'));
export const NotificationsPageLazy = lazy(() => import('@/pages/NotificationsPage'));
export const TaskDetailPageLazy = lazy(() => import('@/pages/TaskDetailPage'));
export const FolderDetailPageLazy = lazy(() => import('@/pages/FolderDetailPage'));

// Modals and dialogs
export const CreateTaskModalLazy = lazy(() => import('@/components/CreateTaskModal'));

// ============= OPTIMIZED LOADING COMPONENTS =============

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  minHeight?: string;
  description?: string;
}

export const LazyWrapper = ({ 
  children, 
  fallback, 
  minHeight = "200px", 
  description = "Carregant component..." 
}: LazyWrapperProps) => {
  const defaultFallback = React.createElement('div', {
    style: { minHeight },
    className: "flex items-center justify-center"
  }, React.createElement('div', {
    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
  }));

  return React.createElement(Suspense, {
    fallback: fallback || defaultFallback
  }, children);
};

// ============= SPECIALIZED LAZY WRAPPERS =============

export const LazyPage = ({ children, pageName }: { children: ReactNode; pageName: string }) => {
  const fallback = React.createElement('div', {
    className: "min-h-screen bg-background flex items-center justify-center"
  }, React.createElement('div', {
    className: "text-center space-y-4"
  }, [
    React.createElement('div', {
      key: 'spinner',
      className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
    }),
    React.createElement('p', {
      key: 'text',
      className: "text-muted-foreground text-sm"
    }, `Carregant ${pageName}...`)
  ]));

  return React.createElement(LazyWrapper, {
    minHeight: "100vh",
    description: `Carregant ${pageName}...`,
    fallback,
    children
  });
};

export const LazyModal = ({ children }: { children: ReactNode }) => {
  const fallback = React.createElement('div', {
    className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  }, React.createElement('div', {
    className: "bg-background rounded-lg p-6 w-full max-w-md mx-4"
  }, React.createElement('div', {
    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
  })));

  return React.createElement(LazyWrapper, {
    minHeight: "300px",
    description: "Carregant modal...",
    fallback,
    children
  });
};

export const LazyBackground = ({ children }: { children: ReactNode }) => {
  const fallback = React.createElement('div', {
    className: "fixed inset-0 bg-gradient-gentle"
  });

  return React.createElement(LazyWrapper, {
    minHeight: "100vh",
    description: "Carregant efectes de fons...",
    fallback,
    children
  });
};

// ============= PRELOADING UTILITIES =============
export const preloadComponent = (importFunction: () => Promise<any>) => {
  // Preload on mouse hover or focus (user intent)
  return {
    onMouseEnter: () => importFunction(),
    onFocus: () => importFunction(),
  };
};

export const preloadOnIdle = (importFunction: () => Promise<any>) => {
  // Preload when browser is idle
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => importFunction());
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => importFunction(), 100);
  }
};

// ============= COMPONENT SPLITTING STRATEGIES =============
export const componentStrategies = {
  // Immediate load (critical path)
  CRITICAL: 'immediate',
  
  // Load on route change
  ROUTE: 'route',
  
  // Load on user interaction
  INTERACTION: 'interaction',
  
  // Load when visible (intersection observer)
  VIEWPORT: 'viewport',
  
  // Load when idle
  IDLE: 'idle'
} as const;