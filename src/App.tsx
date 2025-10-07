import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { LazyTaskDetailPage, LazyFolderDetailPage } from "@/components/LazyComponents";
import NotFound from "./pages/NotFound";
import {
  CalendarPageLazy,
  NotesPageLazy,
  PrepareTomorrowPageLazy,
  ProjectPageLazy,
  OfflineDemoPageLazy,
  LazyPage,
  preloadOnIdle,
} from "@/lib/lazyLoading";
import { PomodoroWidget } from "@/components/pomodoro/PomodoroWidget";
import { RouteCacheProvider } from "@/components/ui/route-cache";
import { BackgroundRefresher } from "@/components/ui/navigation-optimizers";

import { NotificationDisplay } from "@/components/NotificationDisplay";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import { SecurityMonitor } from "@/components/security/SecurityMonitor";
import { TimeBlockIndicator } from "@/components/timeblock/TimeBlockIndicator";
import { config, validateConfig } from "@/config/appConfig";
import { logger } from "@/lib/logger";
import { PomodoroWidgetCoordinator } from "@/components/PomodoroWidgetCoordinator";

const App = () => {
  // Validate configuration on app start - handle errors gracefully
  try {
    const validation = validateConfig(config);
    if (!validation.valid && config.environment.BUILD_MODE === 'production') {
      logger.error('App', 'Configuration validation failed', validation.errors);
    }
  } catch (error) {
    logger.warn('App', 'Configuration validation warning', error);
  }

  // Preload heavy pages on idle to improve perceived performance
  React.useEffect(() => {
    preloadOnIdle(() => import('@/pages/CalendarPage'));
    preloadOnIdle(() => import('@/pages/NotesPage'));
  }, []);

  return (
    <div className="app-shell w-full min-h-screen overflow-x-hidden">
      <div className="page-scroll">
        <BrowserRouter>
          <RouteCacheProvider maxAge={15 * 60 * 1000} maxEntries={25}>
            <BackgroundRefresher />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/calendar" element={<LazyPage pageName="Calendari"><CalendarPageLazy /></LazyPage>} />
              <Route path="/notes" element={<LazyPage pageName="Notes"><NotesPageLazy /></LazyPage>} />
              <Route path="/prepare-tomorrow" element={<LazyPage pageName="Preparar Demà"><PrepareTomorrowPageLazy /></LazyPage>} />
              <Route path="/task/:taskId" element={<LazyTaskDetailPage />} />
              <Route path="/folder/:folderId" element={<LazyFolderDetailPage />} />
              <Route path="/project/:projectId" element={<LazyPage pageName="Projecte"><ProjectPageLazy /></LazyPage>} />
              <Route path="/offline-demo" element={<LazyPage pageName="Demo Offline"><OfflineDemoPageLazy /></LazyPage>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* Widget coordinator dins del context del Router */}
            <PomodoroWidgetCoordinator />
          </RouteCacheProvider>
        </BrowserRouter>
      </div>
      <NotificationDisplay />
      <PerformanceMonitor />
      <SecurityMonitor />
      <TimeBlockIndicator />
    </div>
  );
};

export default App;
