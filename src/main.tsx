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
import { logger } from "@/lib/logger";

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
          logger.debug('iOS', 'Viewport scale', { scale: window.visualViewport?.scale });
        };
        window.visualViewport?.addEventListener('resize', showScale);
        showScale();
      }
    }
  }
}

// Initialize iOS protection
setupIOSProtection();

// ============= FASE 1: DESACTIVACIÓ TEMPORAL SERVICE WORKER =============
// OBJECTIU: Validar si el SW és la causa de la pantalla negra
// Unregister forçat de tots els Service Workers
bootTracer.mark('sw:force-unregister-start');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    bootTracer.trace('ServiceWorker', `Unregistering ${regs.length} Service Workers`);
    regs.forEach(reg => {
      reg.unregister().then(() => {
        bootTracer.trace('ServiceWorker', 'Unregistered successfully', { scope: reg.scope });
      });
    });
  }).catch(err => {
    bootTracer.error('ServiceWorker', err, { phase: 'force-unregister' });
  });
}
bootTracer.mark('sw:force-unregister-end');

// Log React environment early (no hooks)
bootTracer.trace('React', `Version: ${React.version}`, {
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
});

// DESACTIVAT TEMPORALMENT: Service Worker registration
// Això està desactivat per validar si el SW causa la pantalla negra
const isSafariUltraSafe = window.location.search.includes('safari-ultra-safe=1');
if (false && 'serviceWorker' in navigator && !window.location.search.includes('no-sw=1') && !isSafariUltraSafe) {
  window.addEventListener('load', async () => {
    try {
      // Handle ?reset=1 parameter for complete reset
      if (window.location.search.includes('reset=1')) {
        logger.warn('ServiceWorker', 'Complete reset via ?reset=1');
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.unregister()));
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/?minimal=1&bootdebug=1&no-sw=1';
        return;
      }

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
            logger.info('ServiceWorker', 'Unregistering legacy Service Worker', { url });
            await reg.unregister();
          } catch (e) {
            logger.warn('ServiceWorker', 'Failed to unregister legacy Service Worker', e);
          }
        }
      }

      // Constants for update management
      const LAST_UPDATE_KEY = 'lastSWUpdate';
      const UPDATE_COOLDOWN = 5 * 60 * 1000; // 5 minutes
      
      // Check if we should force an update based on cooldown
      const shouldForceUpdate = (): boolean => {
        const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
        if (!lastUpdate) return true;
        const timeSinceUpdate = Date.now() - parseInt(lastUpdate, 10);
        const shouldUpdate = timeSinceUpdate > UPDATE_COOLDOWN;
        
        logger.debug('ServiceWorker', 'Update cooldown check', {
          timeSinceUpdate: Math.round(timeSinceUpdate / 1000) + 's',
          cooldown: Math.round(UPDATE_COOLDOWN / 1000) + 's',
          shouldUpdate
        });
        
        return shouldUpdate;
      };

      // Reuse existing correct registration if present, otherwise register
      let registration = await navigator.serviceWorker.getRegistration();
      const hasCorrectSW =
        !!registration &&
        (registration.active?.scriptURL?.endsWith('/sw-advanced.js') ||
          registration.waiting?.scriptURL?.endsWith('/sw-advanced.js') ||
          registration.installing?.scriptURL?.endsWith('/sw-advanced.js'));

      // Only register new SW if we don't have the correct one OR cooldown has passed
      if (!hasCorrectSW || shouldForceUpdate()) {
        // Register with version parameter to force update
        const SW_VERSION = '20251006';
        registration = await navigator.serviceWorker.register(`/sw-advanced.js?v=${SW_VERSION}`, {
          scope: '/',
          updateViaCache: 'none', // Always fetch fresh SW script
        });
        
        // Update timestamp
        localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
        
        logger.info('ServiceWorker', 'Registered/updated successfully', { 
          scope: registration!.scope,
          reason: !hasCorrectSW ? 'missing' : 'cooldown-expired'
        });
      } else {
        logger.debug('ServiceWorker', 'Using existing registration (cooldown active)');
      }

      // Listen for updates and force immediate activation
      registration!.addEventListener('updatefound', () => {
        const newWorker = registration!.installing;
        if (newWorker) {
          logger.info('ServiceWorker', 'Update found, new worker installing');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.info('ServiceWorker', 'New version installed, activating immediately');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              
              // Update timestamp on successful activation
              localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
            }
          });
        }
      });

      // Listen for SW messages (but don't auto-reload anymore)
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_ACTIVATED') {
          logger.info('ServiceWorker', 'SW activated', {
            cacheVersion: event.data.cacheVersion,
            buildHash: event.data.buildHash,
            previousVersion: event.data.previousVersion
          });
          // Don't force reload - let user refresh naturally
        }
      });
      
    } catch (error) {
      logger.error('ServiceWorker', 'Registration failed', error);
    }
  });
}

// ============= URL PARAMETER PARSING =============
// PHASE 1: Simplified - only ?disable and ?maxPhase, removed complex modes
const params = new URLSearchParams(window.location.search);

// Parse disabled providers from ?disable=Provider1,Provider2
const disableParam = params.get('disable');
const disabledProviders = disableParam ? disableParam.split(',').map(p => p.trim()).filter(Boolean) : [];

// Parse max phase from ?maxPhase=2
const maxPhaseParam = params.get('maxPhase');
const maxPhase = maxPhaseParam ? parseInt(maxPhaseParam, 10) : Infinity;

// Debug modes
const showBootDebug = params.get('bootdebug') === '1';
const probeMode = params.get('probe') === '1';

bootTracer.mark('render:start', { 
  disabledProviders,
  maxPhase,
  showBootDebug,
  probeMode
});

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
  // ============= FASE 2: INVESTIGACIÓ MAIN.TSX =============
  // OBJECTIU: Detectar si el dynamic import o el render bloqueja l'app
  
  // 1️⃣ RenderGuard Timeout: Si no hi ha render en 3000ms, forçar fallback
  let renderGuardTriggered = false;
  const renderGuardTimeout = setTimeout(() => {
    if (!window.__APP_BOOTED && !renderGuardTriggered) {
      renderGuardTriggered = true;
      bootTracer.error('RenderGuard', 'TIMEOUT: Forcing emergency render', {
        elapsed: '3000ms',
        reason: 'App failed to boot in time'
      });
      
      // Emergency fallback render
      root.render(
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="max-w-md space-y-4 p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold">Boot Timeout</h1>
            <p className="text-sm opacity-80">
              L'aplicació no ha carregat en 3 segons. Això indica un problema amb:
            </p>
            <ul className="text-xs opacity-60 text-left list-disc list-inside space-y-1">
              <li>Dynamic import de ProviderStatusContext</li>
              <li>Render de CombinedAppProvider</li>
              <li>Inicialització de providers</li>
            </ul>
            <button 
              onClick={() => window.location.href = '/?bootdebug=1'}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Activar Mode Diagnòstic
            </button>
          </div>
        </div>
      );
    }
  }, 3000);
  
  // 2️⃣ Dynamic Import amb try/catch i logging exhaustiu
  bootTracer.mark('dynamic-import:start');
  
  import('./contexts/ProviderStatusContext')
    .then(({ ProviderStatusProvider }) => {
      bootTracer.mark('dynamic-import:success');
      
      // Clear render guard si l'import té èxit
      clearTimeout(renderGuardTimeout);
      
      // 3️⃣ Render amb logging
      bootTracer.mark('render:app-start');
      
      root.render(
        <ProviderStatusProvider>
          <EnhancedErrorBoundary context="Aplicació Principal" showDetails={true}>
            <CombinedAppProvider 
              disabledProviders={disabledProviders}
              maxPhase={maxPhase}
            >
              {showBootDebug && <BootDiagnosticsOverlay />}
              <App />
            </CombinedAppProvider>
          </EnhancedErrorBoundary>
        </ProviderStatusProvider>
      );
      
      bootTracer.mark('render:app-complete');
    })
    .catch((error) => {
      // 4️⃣ Fallback si el dynamic import falla
      bootTracer.error('dynamic-import', error, {
        message: 'Failed to import ProviderStatusContext',
        fallback: 'Rendering without ProviderStatusProvider'
      });
      
      // Clear render guard
      clearTimeout(renderGuardTimeout);
      
      // Render sense ProviderStatusProvider
      bootTracer.mark('render:fallback-start');
      
      root.render(
        <EnhancedErrorBoundary context="Aplicació Principal (Fallback)" showDetails={true}>
          <CombinedAppProvider 
            disabledProviders={disabledProviders}
            maxPhase={maxPhase}
          >
            {showBootDebug && <BootDiagnosticsOverlay />}
            <App />
          </CombinedAppProvider>
        </EnhancedErrorBoundary>
      );
      
      bootTracer.mark('render:fallback-complete');
    })
    .finally(() => {
      // 5️⃣ Només marcar com booted DESPRÉS del render
      setTimeout(() => {
        window.__APP_BOOTED = true;
        if (window.__clearBootWatchdog) {
          window.__clearBootWatchdog();
        }
        bootTracer.mark('boot:complete');
        logger.info('App', 'Boot successful');
      }, 100);
    });
}
