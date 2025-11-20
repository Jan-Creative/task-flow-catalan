// ============= SIMPLIFIED MAIN.TSX - FASE 2 =============
import React from "react";
import ReactDOM from "react-dom/client";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { CombinedAppProvider } from "@/components/ui/combined-app-provider";
import { initializePerformanceOptimizations } from "@/lib/performanceOptimizer";
import App from "./App.tsx";
import "./index.css";
import { logger } from "@/lib/logger";

// Global boot signal
declare global {
  interface Window {
    __APP_BOOTED?: boolean;
  }
}

// Initialize performance optimizations
initializePerformanceOptimizations();

// ============= iOS ANTI-ZOOM PROTECTION =============
function setupIOSProtection() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  if (isIOS) {
    document.documentElement.classList.add('ios');
    
    // Prevent pinch gestures
    let isGesturing = false;
    document.addEventListener('gesturestart', (e) => {
      isGesturing = true;
      e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('gesturechange', (e) => {
      if (isGesturing) e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('gestureend', (e) => {
      isGesturing = false;
      e.preventDefault();
    }, { passive: false });
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });
  }
}

setupIOSProtection();

// ============= ROOT ELEMENT VALIDATION =============
let rootElement = document.getElementById("root");

if (!rootElement) {
  logger.error('Main', 'Root element not found - creating it');
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

// Clear any existing content
if (rootElement.innerHTML.length > 0) {
  rootElement.innerHTML = '';
}

// ============= REACT ROOT CREATION =============
let root: ReactDOM.Root;

try {
  root = ReactDOM.createRoot(rootElement);
  logger.info('Main', 'React root created successfully');
} catch (error) {
  logger.error('Main', 'Failed to create React root', error);
  
  // Critical error fallback
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#fff;font-family:system-ui;padding:20px;">
      <div style="max-width:500px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">❌</div>
        <h1 style="font-size:24px;font-weight:bold;margin-bottom:12px;">Error Crític</h1>
        <p style="opacity:0.8;margin-bottom:24px;">No s'ha pogut inicialitzar React. Prova recarregar la pàgina.</p>
        <button onclick="window.location.reload()" style="background:#2563eb;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:bold;">
          🔄 Recarregar
        </button>
        <pre style="margin-top:16px;padding:12px;background:#1a1a1a;border-radius:6px;font-size:11px;text-align:left;overflow-x:auto;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    </div>
  `;
  
  throw error;
}

// ============= URL PARAMETERS =============
const params = new URLSearchParams(window.location.search);

// FASE 1: Providers desactivats per defecte (només essencials actius)
// Actius: Background, KeyboardShortcuts, UnifiedTask, Notification, Pomodoro
// Desactivats: Security, PropertyDialog, Offline, KeyboardNavigation, MacNavigation, IPadNavigation
const disabledProviders = [
  'Security', 
  'PropertyDialog', 
  'Offline', 
  'KeyboardNavigation', 
  'MacNavigation', 
  'IPadNavigation'
];

const maxPhase = Infinity; // All phases enabled by default

// ============= APP RENDERING =============
// Provisional boot signal to prevent watchdog issues
window.__APP_BOOTED = true;

// Import ProviderStatusContext dynamically
import('./contexts/ProviderStatusContext')
  .then(({ ProviderStatusProvider }) => {
    logger.info('Main', 'ProviderStatusContext loaded');
    
    try {
      root.render(
        <ProviderStatusProvider>
          <EnhancedErrorBoundary context="Aplicació Principal" showDetails={true}>
            <CombinedAppProvider 
              disabledProviders={disabledProviders} 
              maxPhase={maxPhase}
            >
              <App />
            </CombinedAppProvider>
          </EnhancedErrorBoundary>
        </ProviderStatusProvider>
      );
      
      logger.info('Main', 'App rendered successfully');
      window.__APP_BOOTED = true;
      
    } catch (renderError) {
      logger.error('Main', 'Render failed', renderError);
      throw renderError;
    }
  })
  .catch((error) => {
    logger.error('Main', 'Failed to import ProviderStatusContext', error);
    
    // Fallback render without ProviderStatusProvider
    try {
      root.render(
        <EnhancedErrorBoundary context="Aplicació Principal (Fallback)" showDetails={true}>
          <CombinedAppProvider 
            disabledProviders={disabledProviders}
            maxPhase={maxPhase}
          >
            <App />
          </CombinedAppProvider>
        </EnhancedErrorBoundary>
      );
      
      logger.info('Main', 'Fallback app rendered successfully');
      window.__APP_BOOTED = true;
      
    } catch (fallbackError) {
      logger.error('Main', 'Fallback render failed', fallbackError);
      throw fallbackError;
    }
  });
