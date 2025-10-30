import React, { Suspense, lazy } from "react";
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

// FASE 7: Lazy load provider testing page
const ProviderTestingPageLazy = lazy(() => import('./pages/ProviderTestingPage'));
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
  console.log('🟢 App component iniciant...');
  console.log('🟢 React està executant el component App');
  
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
    console.log('🟢 App useEffect executant...');
    preloadOnIdle(() => import('@/pages/CalendarPage'));
    preloadOnIdle(() => import('@/pages/NotesPage'));
  }, []);

  console.log('🟢 App component retornant JSX...');
  
  try {
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
              
              {/* FASE 7: Provider Testing Page */}
              <Route path="/provider-testing" element={
                <LazyPage pageName="Provider Testing">
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                    <ProviderTestingPageLazy />
                  </Suspense>
                </LazyPage>
              } />
              
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
  } catch (error) {
    console.error('❌ ERROR CRÍTIC en App component return:', error);
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#991b1b',
        color: '#fca5a5',
        padding: '40px',
        fontFamily: 'monospace'
      }}>
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>❌ Error en App Component</h1>
          <p style={{ marginBottom: '20px' }}>Hi ha hagut un error renderitzant l'aplicació:</p>
          <pre style={{
            background: '#7f1d1d',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'left',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {error instanceof Error ? error.message : String(error)}
            {error instanceof Error && error.stack ? '\n\n' + error.stack : ''}
          </pre>
          <button
            onClick={() => window.location.href = '/?ultra=1'}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Provar Mode Ultra Mínim
          </button>
        </div>
      </div>
    );
  }
};

export default App;
