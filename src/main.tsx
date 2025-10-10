import React from "react";
import ReactDOM from "react-dom/client";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { CombinedAppProvider } from "@/components/ui/combined-app-provider";
import { KeyboardNavigationProvider } from "@/contexts/KeyboardNavigationContext";
import { initializePerformanceOptimizations } from "@/lib/performanceOptimizer";
import { detectDevicePerformance, cleanupAfterBoot } from "@/lib/bootOptimizer";
import App from "./App.tsx";
import "./index.css";
import bootTracer from "@/lib/bootTracer";
// FASE 3: Lazy load BootDiagnosticsOverlay només quan sigui necessari
const BootDiagnosticsOverlay = React.lazy(() => import("@/components/debug/BootDiagnosticsOverlay"));
import { logger } from "@/lib/logger";

// Global declarations for boot watchdog
declare global {
  interface Window {
    __APP_BOOTED?: boolean;
    __clearBootWatchdog?: () => void;
  }
}

// ============= FASE 1: DETECCIÓ DE REACT STRICTMODE =============
// StrictMode causa doble mount en dev mode, explicant els re-renders múltiples

// ============= FASE 1: DETECCIÓ DE REACT STRICTMODE =============
// StrictMode causa doble mount en dev mode, explicant els re-renders múltiples
if (import.meta.env.DEV) {
  const strictModeCheck = () => {
    const reactRoot = document.querySelector('[data-reactroot]');
    if (reactRoot || (window as any).__REACT_STRICT_MODE_ACTIVE) {
      console.log('🔍 React StrictMode detectat (doble mount normal en dev)');
      bootTracer.mark('StrictMode', { active: true, note: 'Double mounting expected in dev' });
    }
  };
  // Check after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', strictModeCheck);
  } else {
    strictModeCheck();
  }
}

// ============= FASE 3 + 4: DEBUGGING VISUAL AMB CLEANUP AUTOMÀTIC =============
// Funció per afegir logs visuals temporals al DOM per debugging
let debugLogsEnabled = true;
let hasBootErrors = false;

function addDebugLog(message: string, type: 'info' | 'success' | 'error' = 'info') {
  if (!debugLogsEnabled) return;
  
  // FASE 1: Safety check - esperar a que document.body existeixi
  if (!document.body) {
    setTimeout(() => addDebugLog(message, type), 10);
    return;
  }
  
  const log = document.createElement('div');
  const timestamp = new Date().toISOString().split('T')[1].substring(0, 12);
  log.textContent = `[${timestamp}] ${message}`;
  
  const colors = {
    info: 'background:#1e40af;color:#93c5fd;',
    success: 'background:#065f46;color:#6ee7b7;',
    error: 'background:#991b1b;color:#fca5a5;'
  };
  
  // Marcar si hi ha errors
  if (type === 'error') {
    hasBootErrors = true;
  }
  
  log.style.cssText = `
    position:fixed;
    bottom:${document.querySelectorAll('[data-debug-log]').length * 22}px;
    left:0;
    ${colors[type]}
    padding:4px 8px;
    font-family:monospace;
    font-size:11px;
    z-index:999999;
    border-right:3px solid currentColor;
    max-width:400px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    transition:opacity 0.3s ease;
  `;
  log.setAttribute('data-debug-log', 'true');
  document.body.appendChild(log);
  
  // Auto-remove després de 5 segons (només si no hi ha errors)
  if (type !== 'error') {
    setTimeout(() => {
      log.style.opacity = '0';
      setTimeout(() => log.remove(), 300);
    }, 5000);
  }
}

// FASE 4: Cleanup automàtic de debug logs després de boot exitós
function cleanupDebugLogs() {
  addDebugLog('🧹 Cleaning up debug logs...', 'info');
  
  setTimeout(() => {
    if (!hasBootErrors) {
      debugLogsEnabled = false;
      
      // FASE 2: Millor stagger - 50ms en lloc de 100ms
      const allLogs = document.querySelectorAll('[data-debug-log]');
      allLogs.forEach((log, index) => {
        setTimeout(() => {
          (log as HTMLElement).style.opacity = '0';
          setTimeout(() => log.remove(), 300);
        }, index * 50);
      });
      
      // Mostrar indicador de boot exitós temporal
      setTimeout(() => {
        const successIndicator = document.createElement('div');
        successIndicator.textContent = '✅ Boot successful';
        successIndicator.style.cssText = `
          position:fixed;
          bottom:10px;
          left:10px;
          background:#065f46;
          color:#6ee7b7;
          padding:8px 16px;
          font-family:monospace;
          font-size:12px;
          z-index:999999;
          border-radius:6px;
          box-shadow:0 4px 6px rgba(0,0,0,0.3);
          animation:slideIn 0.3s ease;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(successIndicator);
        
        // Eliminar després de 3 segons
        setTimeout(() => {
          successIndicator.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => successIndicator.remove(), 300);
        }, 3000);
      }, allLogs.length * 100 + 500);
    } else {
      // Si hi ha errors, mantenir els logs per debugging
      addDebugLog('⚠️ Errors detected - keeping logs for debugging', 'error');
    }
  }, 2000); // Esperar 2 segons després del boot complet
}

// ============= FASE 3: DETECCIÓ DE RENDIMENT DEL DISPOSITIU =============
const devicePerformance = detectDevicePerformance();
addDebugLog(`📱 Device: ${devicePerformance} performance`, 'info');

// Initialize performance optimizations
addDebugLog('🚀 Performance optimizations started', 'info');
initializePerformanceOptimizations();
addDebugLog('✅ Performance optimizations complete', 'success');

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

// ============= SERVICE WORKER: DESACTIVAT TEMPORALMENT =============
// FASE 3: Codi del Service Worker mogut aquí per neteja
// Aquest codi està desactivat per diagnosticar problemes de pantalla negra
// Per reactivar-lo, canvia "if (false &&" per "if (" a la línia següent

const SW_ENABLED = false; // Toggle per activar/desactivar Service Worker

if (SW_ENABLED && 'serviceWorker' in navigator && !window.location.search.includes('no-sw=1')) {
  bootTracer.mark('sw:registration-start');
  
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

      // Cleanup legacy Service Worker registrations
      const existingRegs = await navigator.serviceWorker.getRegistrations();
      for (const reg of existingRegs) {
        const url = reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || '';
        if (url && !url.endsWith('/sw-advanced.js')) {
          try {
            logger.info('ServiceWorker', 'Unregistering legacy Service Worker', { url });
            await reg.unregister();
          } catch (e) {
            logger.warn('ServiceWorker', 'Failed to unregister legacy Service Worker', e);
          }
        }
      }

      // Update management with cooldown
      const LAST_UPDATE_KEY = 'lastSWUpdate';
      const UPDATE_COOLDOWN = 5 * 60 * 1000; // 5 minutes
      
      const shouldForceUpdate = (): boolean => {
        const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
        if (!lastUpdate) return true;
        const timeSinceUpdate = Date.now() - parseInt(lastUpdate, 10);
        return timeSinceUpdate > UPDATE_COOLDOWN;
      };

      // Register or reuse existing Service Worker
      let registration = await navigator.serviceWorker.getRegistration();
      const hasCorrectSW = !!registration && 
        (registration.active?.scriptURL?.endsWith('/sw-advanced.js') ||
         registration.waiting?.scriptURL?.endsWith('/sw-advanced.js') ||
         registration.installing?.scriptURL?.endsWith('/sw-advanced.js'));

      if (!hasCorrectSW || shouldForceUpdate()) {
        const SW_VERSION = '20251006';
        registration = await navigator.serviceWorker.register(`/sw-advanced.js?v=${SW_VERSION}`, {
          scope: '/',
          updateViaCache: 'none',
        });
        localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
        logger.info('ServiceWorker', 'Registered successfully', { scope: registration!.scope });
      }

      // Handle updates
      registration!.addEventListener('updatefound', () => {
        const newWorker = registration!.installing;
        if (newWorker) {
          logger.info('ServiceWorker', 'Update found');
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });

      // Auto-reload on controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logger.info('ServiceWorker', 'New version activated, reloading');
        window.location.reload();
      });

    } catch (error) {
      logger.error('ServiceWorker', 'Registration failed', error);
      bootTracer.error('sw:registration', error);
    }
  });
} else {
  // FASE 1: Unregister forçat si SW està desactivat
  bootTracer.mark('sw:force-unregister-start');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      bootTracer.trace('ServiceWorker', `Unregistering ${regs.length} Service Workers (SW disabled)`);
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
}

// ============= URL PARAMETER PARSING =============
// PHASE 1: Simplified - only ?disable and ?maxPhase, removed complex modes
const params = new URLSearchParams(window.location.search);

// Parse disabled providers from ?disable=Provider1,Provider2
const disableParam = params.get('disable');
let disabledProviders = disableParam ? disableParam.split(',').map(p => p.trim()).filter(Boolean) : [];

// Parse max phase from ?maxPhase=2
const maxPhaseParam = params.get('maxPhase');
let maxPhase = maxPhaseParam ? parseInt(maxPhaseParam, 10) : Infinity;

// Debug modes
const showBootDebug = params.get('bootdebug') === '1';
const probeMode = params.get('probe') === '1';

bootTracer.mark('render:start', { 
  disabledProviders,
  maxPhase,
  showBootDebug,
  probeMode
});

// ============= FASE 1: VALIDACIÓ ROBUSTA DEL ROOT ELEMENT =============
addDebugLog('🔍 Starting root element validation...', 'info');
bootTracer.mark('dom:root-validation-start');

// 1️⃣ Obtenir element root amb validació
let rootElement = document.getElementById("root");

if (!rootElement) {
  addDebugLog('❌ Root element missing! Creating...', 'error');
  bootTracer.error('DOM', 'Root element not found! Creating it...', {
    documentReadyState: document.readyState,
    bodyChildren: document.body?.children.length || 0,
    bodyHtml: document.body?.innerHTML.substring(0, 200)
  });
  
  // Crear element root si no existeix
  rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
  addDebugLog('✅ Root element created dynamically', 'success');
  bootTracer.mark('dom:root-created-dynamically');
} else {
  addDebugLog('✅ Root element found in DOM', 'success');
  bootTracer.trace('DOM', 'Root element found', {
    hasContent: rootElement.innerHTML.length > 0,
    contentPreview: rootElement.innerHTML.substring(0, 100),
    childrenCount: rootElement.children.length
  });
}

// 2️⃣ Netejar contingut del root (per si watchdog hi ha posat algo)
if (rootElement.innerHTML.length > 0) {
  addDebugLog('🧹 Clearing root content from watchdog...', 'info');
  bootTracer.trace('DOM', 'Clearing root content', {
    previousContent: rootElement.innerHTML.substring(0, 200)
  });
  rootElement.innerHTML = '';
}

// 3️⃣ Desactivar watchdog ABANS de createRoot
addDebugLog('🛑 Disabling boot watchdog...', 'info');
if (window.__clearBootWatchdog) {
  window.__clearBootWatchdog();
  bootTracer.trace('Watchdog', 'Cleared before createRoot');
}

// FASE 4: Safe mode - limit to phase 1 and disable heavy providers
const safeMode = new URLSearchParams(window.location.search).get('safe') === '1';
if (safeMode) {
  bootTracer.mark('SafeMode', 'Enabled - limiting to Phase 1 providers only');
  maxPhase = Math.min(maxPhase, 1);
  
  const safeDisabledProviders = [
    'UnifiedTask',
    'Notification', 
    'Offline',
    'Pomodoro',
    'KeyboardNavigation',
    'MacNavigation',
    'IPadNavigation'
  ];
  
  disabledProviders = [...new Set([...disabledProviders, ...safeDisabledProviders])];
  addDebugLog(`🔒 Safe mode enabled - maxPhase=${maxPhase}, disabled=${safeDisabledProviders.join(',')}`, 'info');
}

// Marcar provisionalment com booted per evitar watchdog
addDebugLog('📌 Setting provisional boot signal...', 'info');
window.__APP_BOOTED = true;
bootTracer.mark('boot:provisional-signal');

// 4️⃣ Try/Catch al voltant de createRoot
let root: ReactDOM.Root;

try {
  addDebugLog('⚛️ Creating React root...', 'info');
  bootTracer.mark('react:createRoot-start');
  root = ReactDOM.createRoot(rootElement);
  addDebugLog('✅ React root created successfully!', 'success');
  bootTracer.mark('react:createRoot-success');
} catch (error) {
  addDebugLog('❌ CRITICAL: createRoot failed!', 'error');
  bootTracer.error('React', 'createRoot failed', error);
  
  // Mostrar error visual crític
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#fff;font-family:system-ui,-apple-system,sans-serif;padding:20px;">
      <div style="max-width:500px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">❌</div>
        <h1 style="font-size:24px;font-weight:bold;margin-bottom:12px;">Error Crític de React</h1>
        <p style="opacity:0.8;margin-bottom:8px;">No s'ha pogut crear el root de React. Això indica un problema greu amb:</p>
        <ul style="text-align:left;opacity:0.6;font-size:14px;list-style:disc;padding-left:24px;margin-bottom:16px;">
          <li>L'element #root al DOM</li>
          <li>La versió de React/ReactDOM</li>
          <li>Conflictes amb extensions del navegador</li>
        </ul>
        <div style="margin-top:24px;">
          <button onclick="window.location.reload()" style="background:#2563eb;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;font-size:14px;margin-right:8px;">
            🔄 Recarregar
          </button>
          <button onclick="window.location.href='/?reset=1'" style="background:#dc2626;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;font-size:14px;">
            🔧 Reset Complet
          </button>
        </div>
        <pre style="margin-top:16px;padding:12px;background:#1a1a1a;border-radius:6px;font-size:11px;text-align:left;overflow-x:auto;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    </div>
  `;
  
  throw error; // Re-throw per debugging al console
}

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
      <React.Suspense fallback={<div>Loading diagnostics...</div>}>
        <ProbeApp />
        {showBootDebug && <BootDiagnosticsOverlay />}
      </React.Suspense>
    </EnhancedErrorBoundary>
  );
} else {
  // ============= FASE 2: OPTIMITZACIÓ DYNAMIC IMPORT =============
  // OBJECTIU: Accelerar import i evitar timeouts amb Promise.race
  
  addDebugLog('📦 Starting dynamic import...', 'info');
  bootTracer.mark('dynamic-import:start');
  
  // 1️⃣ Crear Promise amb timeout de 3000ms (reduït gràcies a modulepreload)
  const importPromise = import('./contexts/ProviderStatusContext');
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Import timeout after 3000ms')), 3000)
  );
  
  // 2️⃣ RenderGuard més curt (2500ms) per forçar fallback si tot va lent
  let renderGuardTriggered = false;
  const renderGuardTimeout = setTimeout(() => {
    if (!renderGuardTriggered) {
      renderGuardTriggered = true;
      bootTracer.error('RenderGuard', 'TIMEOUT: Forcing emergency render', {
        elapsed: '2500ms',
        reason: 'App failed to boot in time'
      });
      
      // Emergency fallback render
  addDebugLog('🔄 Rendering probe mode...', 'info');
  root.render(
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="max-w-md space-y-4 p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold">Boot Timeout</h1>
            <p className="text-sm opacity-80">
              L'aplicació no ha carregat en 2.5 segons. Això indica un problema amb:
            </p>
            <ul className="text-xs opacity-60 text-left list-disc list-inside space-y-1">
              <li>Dynamic import de ProviderStatusContext</li>
              <li>Connexió de xarxa lenta</li>
              <li>Càrrega de providers massa lenta</li>
            </ul>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              🔄 Recarregar
            </button>
            <button 
              onClick={() => window.location.href = '/?bootdebug=1'}
              className="mt-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
            >
              🔍 Mode Diagnòstic
            </button>
          </div>
        </div>
      );
    }
  }, 2500);
  
  // 3️⃣ Race entre import i timeout
  Promise.race([importPromise, timeoutPromise])
    .then(({ ProviderStatusProvider }) => {
      addDebugLog('✅ Dynamic import successful!', 'success');
      bootTracer.mark('dynamic-import:success');
      
      // Clear render guard si l'import té èxit
      clearTimeout(renderGuardTimeout);
      
      // 3️⃣ Render amb logging EXPLÍCIT
      addDebugLog('🎨 Rendering main app...', 'info');
      bootTracer.mark('render:app-start');
      bootTracer.trace('Render', 'About to call root.render() with providers', {
        disabledProviders,
        maxPhase,
        timestamp: new Date().toISOString()
      });
      
      root.render(
        <ProviderStatusProvider>
          <EnhancedErrorBoundary context="Aplicació Principal" showDetails={true}>
            <CombinedAppProvider 
              disabledProviders={disabledProviders}
              maxPhase={maxPhase}
            >
              {showBootDebug && (
                <React.Suspense fallback={<div className="text-xs opacity-50">Loading diagnostics...</div>}>
                  <BootDiagnosticsOverlay />
                </React.Suspense>
              )}
              <App />
            </CombinedAppProvider>
          </EnhancedErrorBoundary>
        </ProviderStatusProvider>
      );
      
      addDebugLog('✅ App rendered successfully!', 'success');
      bootTracer.mark('render:app-complete');
    })
    .catch((error) => {
      // 4️⃣ Fallback si el dynamic import falla
      addDebugLog('❌ Dynamic import failed!', 'error');
      bootTracer.error('dynamic-import', error, {
        message: 'Failed to import ProviderStatusContext',
        fallback: 'Rendering without ProviderStatusProvider'
      });
      
      // Clear render guard
      clearTimeout(renderGuardTimeout);
      
      // Render sense ProviderStatusProvider
      addDebugLog('🔄 Rendering fallback app...', 'info');
      bootTracer.mark('render:fallback-start');
      
      root.render(
        <EnhancedErrorBoundary context="Aplicació Principal (Fallback)" showDetails={true}>
          <CombinedAppProvider 
            disabledProviders={disabledProviders}
            maxPhase={maxPhase}
          >
            {showBootDebug && (
              <React.Suspense fallback={<div className="text-xs opacity-50">Loading diagnostics...</div>}>
                <BootDiagnosticsOverlay />
              </React.Suspense>
            )}
            <App />
          </CombinedAppProvider>
        </EnhancedErrorBoundary>
      );
      
      addDebugLog('✅ Fallback app rendered!', 'success');
      bootTracer.mark('render:fallback-complete');
    })
    .finally(() => {
      // 5️⃣ Només marcar com booted DESPRÉS del render
      setTimeout(() => {
        window.__APP_BOOTED = true;
        if (window.__clearBootWatchdog) {
          window.__clearBootWatchdog();
        }
        addDebugLog('🎉 Boot complete!', 'success');
        bootTracer.mark('boot:complete');
        logger.info('App', 'Boot successful');
        
        // FASE 4: Cleanup automàtic dels debug logs
        cleanupDebugLogs();
        
        // FASE 3: Cleanup de recursos post-boot
        setTimeout(() => {
          cleanupAfterBoot();
        }, 5000); // Després de 5s del boot complet
      }, 100);
    });
}
