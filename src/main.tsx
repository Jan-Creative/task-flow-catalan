import React from "react";
import ReactDOM from "react-dom/client";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { CombinedAppProvider } from "@/components/ui/combined-app-provider";
import { KeyboardNavigationProvider } from "@/contexts/KeyboardNavigationContext";
import { initializePerformanceOptimizations } from "@/lib/performanceOptimizer";
import App from "./App.tsx";
import "./index.css";
import bootTracer from "@/lib/bootTracer";
import BootDiagnosticsOverlay from "@/components/debug/BootDiagnosticsOverlay";

// Global declarations for boot watchdog
declare global {
  interface Window {
    __APP_BOOTED?: boolean;
    __clearBootWatchdog?: () => void;
  }
}

// Initialize performance optimizations
initializePerformanceOptimizations();

// iOS Detection and Anti-Zoom Setup
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
      if (isGesturing) {
        e.preventDefault();
      }
    }, { passive: false });
    
    document.addEventListener('gestureend', (e) => {
      isGesturing = false;
      e.preventDefault();
    }, { passive: false });
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    
    // Monitor viewport scale (debug mode)
    if (window.location.search.includes('debug-zoom=1')) {
      if ('visualViewport' in window) {
        const showScale = () => {
          console.log('Viewport scale:', window.visualViewport?.scale);
        };
        window.visualViewport?.addEventListener('resize', showScale);
        showScale();
      }
    }
  }
}

// Initialize iOS protection
setupIOSProtection();

// Manual Service Worker registration with bypass option
if ('serviceWorker' in navigator && !window.location.search.includes('no-sw=1')) {
  window.addEventListener('load', async () => {
    try {
      // Cleanup legacy or incorrect Service Worker registrations
      const existingRegs = await navigator.serviceWorker.getRegistrations();
      for (const reg of existingRegs) {
        const url =
          reg.active?.scriptURL ||
          reg.waiting?.scriptURL ||
          reg.installing?.scriptURL ||
          '';
        if (url && !url.endsWith('/sw-advanced.js')) {
          try {
            console.log('🧹 Unregistering legacy Service Worker:', url);
            await reg.unregister();
          } catch (e) {
            console.warn('Failed to unregister legacy Service Worker', e);
          }
        }
      }

      // Reuse existing correct registration if present, otherwise register
      let registration = await navigator.serviceWorker.getRegistration();
      const hasCorrectSW =
        !!registration &&
        (registration.active?.scriptURL?.endsWith('/sw-advanced.js') ||
          registration.waiting?.scriptURL?.endsWith('/sw-advanced.js') ||
          registration.installing?.scriptURL?.endsWith('/sw-advanced.js'));

      if (!hasCorrectSW) {
        registration = await navigator.serviceWorker.register('/sw-advanced.js', {
          scope: '/',
        });
      }

      console.log('Service Worker registrat correctament:', registration!.scope);

      // Listen for updates and force immediate activation
      registration!.addEventListener('updatefound', () => {
        const newWorker = registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 Nova versió del SW disponible, activant immediatament...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });

      // Listen for SW messages (but don't auto-reload anymore)
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_ACTIVATED') {
          console.log('✅ SW updated successfully');
          // Don't force reload - let user refresh naturally
        }
      });
      
    } catch (error) {
      console.error('Error registrant el Service Worker:', error);
    }
  });
}

// Render app and signal successful boot
// StrictMode temporarily disabled to fix React 18 "Should have a queue" error
const params = new URLSearchParams(window.location.search);
const isMinimalMode = params.get('minimal') === '1';
const safeMode = params.get('safe') === '1';
const probeMode = params.get('probe') === '1';
const showBootDebug = params.get('bootdebug') === '1';
const disabledProviders = (params.get('disable') || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

bootTracer.mark('render:start', { isMinimalMode, safeMode, probeMode, disabledProviders });

const root = ReactDOM.createRoot(document.getElementById("root")!);

function ProbeApp() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="max-w-md space-y-2 text-center">
        <h1 className="text-xl font-semibold">Probe Mode</h1>
        <p className="text-sm opacity-80">React root renders fine. Use bootdebug=1 for trace.</p>
        <p className="text-xs opacity-60">UA: {navigator.userAgent}</p>
      </div>
    </div>
  );
}

if (probeMode) {
  bootTracer.mark('render:probe');
  root.render(
    <EnhancedErrorBoundary context="Probe" showDetails={true}>
      <ProbeApp />
      {showBootDebug && <BootDiagnosticsOverlay />}
    </EnhancedErrorBoundary>
  );
} else {
  bootTracer.mark('render:app');
  root.render(
    <EnhancedErrorBoundary context="Aplicació Principal" showDetails={true}>
      <CombinedAppProvider minimal={isMinimalMode || safeMode} disabledProviders={disabledProviders}>
        <KeyboardNavigationProvider>
          {showBootDebug && <BootDiagnosticsOverlay />}
          <App />
        </KeyboardNavigationProvider>
      </CombinedAppProvider>
    </EnhancedErrorBoundary>
  );
}


// Signal successful boot to disable watchdog
setTimeout(() => {
  window.__APP_BOOTED = true;
  if (window.__clearBootWatchdog) {
    window.__clearBootWatchdog();
  }
  console.log('✅ App booted successfully');
}, 100);
