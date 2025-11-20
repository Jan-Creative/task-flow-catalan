import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { LazyTaskDetailPage, LazyFolderDetailPage } from "@/components/LazyComponents";
import NotFound from "./pages/NotFound";
import {
  CalendarPageLazy,
  PrepareTomorrowPageLazy,
  LazyPage,
  preloadOnIdle,
} from "@/lib/lazyLoading";

import { PomodoroWidget } from "@/components/pomodoro/PomodoroWidget";
import { RouteCacheProvider } from "@/components/ui/route-cache";
import { BackgroundRefresher } from "@/components/ui/navigation-optimizers";

import { NotificationDisplay } from "@/components/NotificationDisplay";
import { TimeBlockIndicator } from "@/components/timeblock/TimeBlockIndicator";
import { config, validateConfig } from "@/config/appConfig";
import { logger } from "@/lib/logger";
import { PomodoroWidgetCoordinator } from "@/components/PomodoroWidgetCoordinator";

const App = () => {
  console.log('🟢 App component iniciant...');
  console.log('🟢 React està executant el component App');
  
  // FASE 2: Mode ?norouter=1 - Test sense BrowserRouter
  const noRouterMode = new URLSearchParams(window.location.search).get('norouter') === '1';
  
  if (noRouterMode) {
    console.log('🔧 NO ROUTER MODE activat - bypassing BrowserRouter');
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        fontWeight: 'bold',
        padding: '40px',
        textAlign: 'center',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>✅ APP COMPONENT WORKS (NO ROUTER)</div>
        <div style={{ fontSize: '16px', fontWeight: 'normal', maxWidth: '600px' }}>
          Providers: OK, Router: Bypassed
          <br/><br/>
          Si veus això, el component App i els providers funcionen correctament.
          El problema podria estar al BrowserRouter o a les Routes.
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Provar Mode Normal (amb Router)
        </button>
      </div>
    );
  }
  
  // Validate configuration on app start - handle errors gracefully
  try {
    const validation = validateConfig(config);
    if (!validation.valid && config.environment.BUILD_MODE === 'production') {
      logger.error('App', 'Configuration validation failed', validation.errors);
    }
  } catch (error) {
    logger.warn('App', 'Configuration validation warning', error);
  }

  // FASE 2: Guard per executar només un cop (prevenir StrictMode re-executions)
  const preloadedRef = React.useRef(false);
  
  // Preload heavy pages on idle to improve perceived performance
  React.useEffect(() => {
    if (preloadedRef.current) {
      console.log('⚠️ App useEffect: Preload ja executat, skipping (StrictMode prevention)');
      return;
    }
    
    preloadedRef.current = true;
    console.log('🟢 App useEffect executant preload (primera vegada)...');
    // ✅ FASE 4: Calendar comentat, no precarregar
    // preloadOnIdle(() => import('@/pages/CalendarPage'));
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
              {/* ✅ FASE 4: Calendar desactivat (no eliminat) per possible reactivació */}
              {/* <Route path="/calendar" element={<LazyPage pageName="Calendari"><CalendarPageLazy /></LazyPage>} /> */}
              <Route path="/prepare-tomorrow" element={<LazyPage pageName="Preparar Demà"><PrepareTomorrowPageLazy /></LazyPage>} />
              <Route path="/task/:taskId" element={<LazyTaskDetailPage />} />
              <Route path="/folder/:folderId" element={<LazyFolderDetailPage />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* Widget coordinator dins del context del Router */}
            {/* 🚨 TEMPORAL: Comentat perquè necessita PomodoroProvider */}
            {/* <PomodoroWidgetCoordinator /> */}
          </RouteCacheProvider>
        </BrowserRouter>
      </div>
      {/* ✅ FASE 1: Reactivat NotificationDisplay */}
      <NotificationDisplay />
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
