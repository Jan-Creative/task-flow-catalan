// ============= FASE 1: IMMEDIATE CONSOLE LOG =============
console.log('🚀 MAIN.TSX LOADED - JavaScript bundle executing');
console.log('🔍 Timestamp:', new Date().toISOString());
console.log('🔍 Location:', window.location.href);
console.log('🔍 User Agent:', navigator.userAgent);

// ============= FASE DIAGNOSIS: LOG CHUNKS CARREGATS =============
if (typeof performance !== 'undefined' && performance.getEntriesByType) {
  setTimeout(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsChunks = resources.filter(r => r.name.includes('.js'));
    console.log('📦 JavaScript chunks carregats:', jsChunks.length);
    jsChunks.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name.split('/').pop()} - ${Math.round(r.duration)}ms - ${Math.round(r.transferSize / 1024)}KB`);
    });
  }, 1000);
}

// ============= FASE 4: Check for existing Service Workers =============
console.log('🔍 Checking for Service Workers...');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      console.warn('⚠️ Found', registrations.length, 'Service Worker(s) registered:', registrations);
      registrations.forEach((reg, index) => {
        console.log(`  SW ${index + 1}:`, {
          scope: reg.scope,
          active: reg.active?.state,
          waiting: reg.waiting?.state,
          installing: reg.installing?.state
        });
      });
    } else {
      console.log('✅ No Service Workers registered');
    }
  }).catch(err => {
    console.error('❌ Error checking Service Workers:', err);
  });
}

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
    __removeBootWatermark?: () => void;
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

// FASE 5: Query Cache Auto-Cleanup - Executar cada 5 minuts per eliminar queries stale
if (typeof window !== 'undefined') {
  import('@tanstack/react-query').then((ReactQuery) => {
    const setupQueryCacheCleanup = () => {
      // Get the global query client
      const queryClient = (window as any).__REACT_QUERY_CLIENT__;
      
      if (!queryClient || typeof queryClient.getQueryCache !== 'function') {
        console.warn('🧹 [Query Cache] QueryClient not found on window, skipping auto-cleanup setup');
        return;
      }
      
      const cleanupQueryCache = () => {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        
        console.log(`🧹 [Query Cache] Auto-cleanup: Checking ${queries.length} queries`);
        
        let removedCount = 0;
        
        // Remove stale queries older than 15 min
        queries.forEach((query: any) => {
          const lastUpdated = query.state.dataUpdatedAt;
          const age = Date.now() - lastUpdated;
          
          // 15 min = 900000 ms
          if (age > 15 * 60 * 1000) {
            cache.remove(query);
            removedCount++;
          }
        });
        
        if (removedCount > 0) {
          console.log(`🧹 [Query Cache] Removed ${removedCount} stale queries (>15min)`);
        }
        
        // Log memory after cleanup
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          console.log(`📊 [Query Cache] Memory after cleanup: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
        }
      };
      
      // Run cleanup every 5 minutes
      const cleanupInterval = setInterval(cleanupQueryCache, 5 * 60 * 1000);
      
      // Also run cleanup on visibility change (when user returns to tab)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('🧹 [Query Cache] Tab visible - running cleanup');
          cleanupQueryCache();
        }
      });
      
      // Initial cleanup after 1 minute
      setTimeout(cleanupQueryCache, 60 * 1000);
      
      console.log('✅ [Query Cache] Auto-cleanup initialized (5min interval, 15min stale threshold)');
      
      return cleanupInterval;
    };
    
    setupQueryCacheCleanup();
  }).catch(err => {
    console.warn('⚠️ [Query Cache] Failed to setup auto-cleanup:', err);
  });
}

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

// OPCIÓ B: Mode ?disableall=1 - Desactiva TOTS els providers
const disableAllMode = params.get('disableall') === '1';

// Parse disabled providers from ?disable=Provider1,Provider2
const disableParam = params.get('disable');
let disabledProviders = disableAllMode 
  ? ['Security', 'Background', 'PropertyDialog', 'KeyboardShortcuts', 'UnifiedTask', 'Notification', 'Offline', 'Pomodoro', 'KeyboardNavigation', 'MacNavigation', 'IPadNavigation']
  : (disableParam ? disableParam.split(',').map(p => p.trim()).filter(Boolean) : []);

// Parse max phase from ?maxPhase=2
const maxPhaseParam = params.get('maxPhase');
let maxPhase = maxPhaseParam ? parseInt(maxPhaseParam, 10) : Infinity;

// Debug modes
const showBootDebug = params.get('bootdebug') === '1';
const probeMode = params.get('probe') === '1';
const diagnosisMode = params.get('diagnosis') === '1';

// ============= EMERGENCY DIAGNOSTIC MODES =============
// Mode ?ultra=1: Minimal render (only div + text, no providers, no router)
const ultraMode = params.get('ultra') === '1';
// FASE 1: Mode ?ultramin=1 - Test ultra-mínim sense App/Providers
const ultraMinMode = params.get('ultramin') === '1';
// Mode ?norouter=1: Render without BrowserRouter (keeps providers)
const noRouterMode = params.get('norouter') === '1';
// Mode ?noportals=1: Deactivate Toaster/Tooltip portals
const noPortalsMode = params.get('noportals') === '1';
// Mode ?single=1: Single render without render guard / dynamic import
const singleMode = params.get('single') === '1';
// Mode ?preonly=1: Direct JS check (bypasses React completely)
const preonlyMode = params.get('preonly') === '1';

bootTracer.mark('render:start', { 
  disabledProviders,
  maxPhase,
  showBootDebug,
  probeMode,
  diagnosisMode,
  ultraMode,
  ultraMinMode,
  noRouterMode,
  noPortalsMode,
  singleMode
});

// ============= FASE DIAGNOSIS ULTRA: IMPORTS ADICIONALS =============
import MinimalTest from "./MinimalTest.tsx";
import { ProviderStatusProvider } from "@/contexts/ProviderStatusContext";
const DiagnosisOverlay = React.lazy(() => import("@/components/debug/DiagnosisOverlay").then(m => ({ default: m.DiagnosisOverlay })));

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

// ============= EMERGENCY DIAGNOSTIC MODES =============

function UltraMinimalApp() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: '#ffffff',
      color: '#111111',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '500px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          ⚡ Ultra Minimal Mode
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '24px' }}>
          React root funciona. Cap provider, cap router, cap portal, cap Tailwind dependency.
        </p>
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'left',
          fontSize: '12px',
          border: '1px solid #ddd'
        }}>
          <div>✅ React: {React.version}</div>
          <div>✅ DOM root: #root</div>
          <div>✅ User Agent: {navigator.userAgent.substring(0, 50)}...</div>
          <div>✅ Timestamp: {new Date().toISOString()}</div>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Tornar a Mode Normal
        </button>
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.href = '/?norouter=1&bootdebug=1'}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              background: '#6b7280',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Provar No Router
          </button>
          <button 
            onClick={() => window.location.href = '/?single=1&bootdebug=1'}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              background: '#6b7280',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Provar Single Mode
          </button>
        </div>
      </div>
    </div>
  );
}

function NoRouterApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: '#111111',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
          🔧 No Router Mode
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '24px' }}>
          Providers actius, però sense BrowserRouter. Si això funciona, el problema és al Router.
        </p>
        <div style={{
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #ddd'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Test de Providers:</div>
          <div style={{ fontSize: '14px' }}>✅ Si veus això, els providers funcionen correctament</div>
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px' }}>
            Els següents sistemes estan actius: CombinedAppProvider, EnhancedErrorBoundary
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Tornar a Mode Normal
          </button>
          <button 
            onClick={() => window.location.href = '/?ultra=1'}
            style={{
              padding: '10px 20px',
              background: '#6b7280',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Provar Ultra Mode
          </button>
        </div>
      </div>
    </div>
  );
}

// ============= RENDERING LOGIC WITH DIAGNOSTIC MODES =============

// FASE 6: Mode ?preonly=1 - Comprovació directa de JS (bypasses React)
if (preonlyMode) {
  addDebugLog('🔍 PREONLY mode - direct JS check', 'info');
  bootTracer.mark('preonly:start');
  
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#ffffff;color:#111111;font-family:system-ui,-apple-system,sans-serif;padding:24px;">
      <div style="max-width:500px;text-align:center;">
        <h1 style="font-size:32px;font-weight:bold;margin-bottom:16px;">✅ PREONLY OK</h1>
        <p style="font-size:14px;opacity:0.8;margin-bottom:24px;">
          JavaScript funciona i pot escriure al DOM directament sense React.
        </p>
        <div style="padding:16px;background:#f5f5f5;border-radius:8px;text-align:left;font-size:12px;margin-bottom:16px;border:1px solid #ddd;">
          <div><strong>✅ DOM:</strong> #root accessible</div>
          <div><strong>✅ JS:</strong> Executant-se correctament</div>
          <div><strong>✅ Timestamp:</strong> ${new Date().toISOString()}</div>
        </div>
        <button 
          onclick="window.location.href='/?ultra=1'"
          style="padding:10px 20px;background:#2563eb;color:#ffffff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;margin-right:8px;"
        >
          Provar Ultra Mode (amb React)
        </button>
        <button 
          onclick="window.location.href='/'"
          style="padding:10px 20px;background:#6b7280;color:#ffffff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;"
        >
          Mode Normal
        </button>
      </div>
    </div>
  `;
  
  window.__APP_BOOTED = true;
  window.__removeBootWatermark?.();
  bootTracer.mark('preonly:complete');
  cleanupAfterBoot();
  
} else if (ultraMinMode) {
  // FASE 1: Mode ?ultramin=1 - Ultra mínim sense App/Providers
  console.log('⚡ ULTRAMIN MODE: Renderitzant només div sense App/Providers...');
  addDebugLog('⚡ Ultra Min Mode activated - no App, no Providers', 'info');
  bootTracer.mark('render:ultramin');
  
  try {
    root.render(
      <div style={{
        background: 'lime',
        color: 'black',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>✅ REACT WORKS</div>
        <div style={{ fontSize: '16px', opacity: 0.8 }}>
          {new Date().toISOString()}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.6, maxWidth: '500px', textAlign: 'center' }}>
          React renderitza correctament. Si veus això, el problema NO és React/ReactDOM.
        </div>
        <button 
          onClick={() => window.location.href = '/?norouter=1'}
          style={{
            padding: '12px 24px',
            background: 'black',
            color: 'lime',
            border: '2px solid black',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Provar No Router Mode
        </button>
      </div>
    );
    
    console.log('✅ ULTRAMIN MODE: Renderitzat amb èxit!');
    window.__APP_BOOTED = true;
    window.__removeBootWatermark?.();
    bootTracer.mark('boot:complete-ultramin');
    setTimeout(cleanupDebugLogs, 1000);
  } catch (ultraMinError) {
    console.error('❌ ERROR en Ultra Min Mode:', ultraMinError);
    addDebugLog('❌ Ultra min mode failed!', 'error');
  }
  
} else if (ultraMode) {
  // Ultra Minimal Mode: Només React + HTML, sense cap provider ni router
  console.log('⚡ ULTRA MODE: Renderitzant component mínim...');
  addDebugLog('⚡ Ultra Minimal Mode activated', 'info');
  bootTracer.mark('render:ultra-minimal');
  
  try {
    root.render(
      <EnhancedErrorBoundary context="Ultra Minimal" showDetails={true}>
        <MinimalTest />
        {showBootDebug && (
          <React.Suspense fallback={null}>
            <BootDiagnosticsOverlay />
          </React.Suspense>
        )}
      </EnhancedErrorBoundary>
    );
    
    console.log('✅ ULTRA MODE: Renderitzat amb èxit!');
    // Mark boot complete
    window.__APP_BOOTED = true;
    window.__removeBootWatermark?.();
    bootTracer.mark('boot:complete-ultra');
    setTimeout(cleanupDebugLogs, 1000);
  } catch (ultraError) {
    console.error('❌ ERROR en Ultra Mode:', ultraError);
    addDebugLog('❌ Ultra mode failed!', 'error');
  }
  
} else if (noRouterMode) {
  // No Router Mode: Tots els providers actius però sense BrowserRouter
  addDebugLog('🔧 No Router Mode activated', 'info');
  bootTracer.mark('render:no-router');
  
  // Import dynamic per evitar problemes
  import('./contexts/ProviderStatusContext').then(({ ProviderStatusProvider }) => {
    addDebugLog('✅ Providers loaded for No Router Mode', 'success');
    
  root.render(
    <ProviderStatusProvider>
      <EnhancedErrorBoundary context="No Router Mode" showDetails={true}>
        <CombinedAppProvider 
          disabledProviders={disabledProviders} 
          maxPhase={maxPhase}
          disablePortals={noPortalsMode}
        >
          <NoRouterApp />
          {showBootDebug && (
            <React.Suspense fallback={null}>
              <BootDiagnosticsOverlay />
            </React.Suspense>
          )}
        </CombinedAppProvider>
      </EnhancedErrorBoundary>
    </ProviderStatusProvider>
  );
  
  // Mark boot complete
  window.__APP_BOOTED = true;
  window.__removeBootWatermark?.();
  bootTracer.mark('boot:complete-norouter');
  addDebugLog('✅ No Router Mode render complete', 'success');
  setTimeout(cleanupDebugLogs, 1000);
    
  }).catch((error) => {
    bootTracer.error('NoRouterMode', error);
    addDebugLog('❌ No Router Mode failed!', 'error');
  });
  
} else if (probeMode) {
  // Probe Mode: Test bàsic del React root
  bootTracer.mark('render:probe');
  root.render(
    <EnhancedErrorBoundary context="Probe" showDetails={true}>
      <React.Suspense fallback={<div>Loading diagnostics...</div>}>
        <ProbeApp />
        {showBootDebug && <BootDiagnosticsOverlay />}
      </React.Suspense>
    </EnhancedErrorBoundary>
  );
  
  window.__APP_BOOTED = true;
  bootTracer.mark('boot:complete-probe');
  
} else {
  // ============= SINGLE RENDER MODE (?single=1) =============
  // Skip render guard and dynamic import race - just do a single render
  if (singleMode) {
    addDebugLog('1️⃣ Single render mode - direct import...', 'info');
    bootTracer.mark('SingleMode:start');
    
    import('./contexts/ProviderStatusContext').then(({ ProviderStatusProvider }) => {
      addDebugLog('✅ Provider imported - rendering...', 'success');
      
      // FASE 6: Passar disablePortals a CombinedAppProvider
      root.render(
        <ProviderStatusProvider>
          <EnhancedErrorBoundary context="Single Render Mode" showDetails={true}>
            <CombinedAppProvider 
              disabledProviders={disabledProviders} 
              maxPhase={maxPhase}
              disablePortals={noPortalsMode}
            >
              <App />
              {showBootDebug && (
                <React.Suspense fallback={null}>
                  <BootDiagnosticsOverlay />
                </React.Suspense>
              )}
            </CombinedAppProvider>
          </EnhancedErrorBoundary>
        </ProviderStatusProvider>
      );
      
      bootTracer.mark('SingleMode:complete');
      window.__APP_BOOTED = true;
      window.__removeBootWatermark?.();
      addDebugLog('✅ Single render complete!', 'success');
      setTimeout(cleanupDebugLogs, 1000);
    }).catch((error) => {
      bootTracer.error('SingleMode', error);
      addDebugLog('❌ Single render failed!', 'error');
    });
    
  } else {
    // ============= NORMAL DYNAMIC IMPORT WITH RENDER GUARD =============
    addDebugLog('📦 Starting dynamic import...', 'info');
    bootTracer.mark('dynamic-import:start');
    
    // 1️⃣ FASE 6: Timeout relaxat a 8000ms per entorns lents
    addDebugLog('📦 Import started...', 'info');
    const importPromise = import('./contexts/ProviderStatusContext');
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => {
        addDebugLog('⏱️ Import timeout!', 'error');
        reject(new Error('Import timeout after 8000ms'));
      }, 8000)
    );
    
    // 2️⃣ FASE 6: RenderGuard relaxat a 6000ms per evitar falsos timeouts
    let renderGuardTriggered = false;
    const renderGuardTimeout = setTimeout(() => {
      if (!renderGuardTriggered) {
        renderGuardTriggered = true;
        bootTracer.error('RenderGuard', 'TIMEOUT: Forcing emergency render', {
          elapsed: '6000ms',
          reason: 'App failed to boot in time'
        });
        
        // Emergency fallback render amb inline styles (independent de Tailwind)
        addDebugLog('⚠️ Render guard triggered!', 'error');
        root.render(
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            color: '#111111',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <div style={{
              maxWidth: '500px',
              textAlign: 'center',
              padding: '24px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Boot Timeout</h1>
              <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '24px' }}>
                L'aplicació no ha carregat en 6 segons. Prova aquests modes de diagnòstic:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => window.location.href = '/?ultra=1'}
                  style={{
                    padding: '10px 20px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Ultra Mode
                </button>
                <button 
                  onClick={() => window.location.href = '/?single=1&bootdebug=1'}
                  style={{
                    padding: '10px 20px',
                    background: '#6b7280',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  1️⃣ Single Render
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '10px 20px',
                    background: '#9ca3af',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Recarregar
                </button>
              </div>
            </div>
          </div>
        );
      }
    }, 6000);
    
    // 3️⃣ Race entre import i timeout
    Promise.race([importPromise, timeoutPromise])
      .then(({ ProviderStatusProvider }) => {
        addDebugLog('✅ Import finished successfully!', 'success');
        bootTracer.mark('dynamic-import:success');
        
        // Clear render guard si l'import té èxit
        clearTimeout(renderGuardTimeout);
        
        // 3️⃣ Render amb logging ULTRA-EXPLÍCIT
        console.log('🔵 FASE: Renderitzant aplicació principal...');
        console.log('🔵 Disabled providers:', disabledProviders);
        console.log('🔵 Max phase:', maxPhase);
        console.log('🔵 No portals mode:', noPortalsMode);
        
        addDebugLog('🎨 Rendering main app...', 'info');
        bootTracer.mark('render:app-start');
        bootTracer.trace('Render', 'About to call root.render() with providers', {
          disabledProviders,
          maxPhase,
          noPortalsMode,
          timestamp: new Date().toISOString()
        });
        
        try {
          console.log('🔵 FASE: Cridant root.render()...');
          
          // FASE 7: MODE ULTRA-MINIMAL - Bypass TOTS els providers
          if (ultraMode) {
            console.log('🚨 ULTRA MINIMAL MODE - Bypassing ALL providers, Router, and ErrorBoundary');
            root.render(
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                fontFamily: 'system-ui',
                flexDirection: 'column',
                gap: '20px',
                padding: '40px',
                textAlign: 'center'
              }}>
                <div>✅ REACT WORKS!</div>
                <div style={{ fontSize: '16px', fontWeight: 'normal', maxWidth: '600px' }}>
                  Providers: BYPASSED, Router: BYPASSED, ErrorBoundary: BYPASSED
                  <br/><br/>
                  Si veus això, React i Vite funcionen perfectament.
                  El problema està als providers (CombinedAppProvider).
                </div>
                <button 
                  onClick={() => window.location.href = '/'}
                  style={{
                    padding: '12px 24px',
                    background: 'white',
                    color: '#059669',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Provar Mode Normal
                </button>
              </div>
            );
            
            bootTracer.mark('ULTRA_MINIMAL_MODE', 'Render completat - bypassing tots els providers');
            console.log('✅ ULTRA MINIMAL MODE: Render completat');
            return; // ⚠️ Important: sortir abans de renderitzar providers
          }
          
          // FASE 6: DIAGNÒSTIC - StrictMode DESACTIVAT temporalment
          // StrictMode en DEV mode causa unmount/remount que pot triggerar el loop infinit
          // Si això soluciona el problema → confirmat que StrictMode + cleanup causen el loop
          
          console.log('⚠️ FASE 6: StrictMode DESACTIVAT per diagnòstic');
          
          root.render(
            <ProviderStatusProvider>
              <EnhancedErrorBoundary context="Aplicació Principal" showDetails={true}>
                <CombinedAppProvider 
                  disabledProviders={disabledProviders} 
                  maxPhase={maxPhase}
                  disablePortals={noPortalsMode}
                >
                  <App />
                  {showBootDebug && (
                    <React.Suspense fallback={null}>
                      <BootDiagnosticsOverlay />
                    </React.Suspense>
                  )}
                  {diagnosisMode && (
                    <React.Suspense fallback={null}>
                      <DiagnosisOverlay />
                    </React.Suspense>
                  )}
                </CombinedAppProvider>
              </EnhancedErrorBoundary>
            </ProviderStatusProvider>
          );
          
          console.log('✅ root.render() completat amb èxit!');
          addDebugLog('✅ App rendered successfully!', 'success');
          bootTracer.mark('render:app-complete');
        } catch (renderError) {
          console.error('❌ ERROR CRÍTIC en root.render():', renderError);
          addDebugLog('❌ Render error!', 'error');
          bootTracer.error('Render', 'root.render() failed', renderError);
          throw renderError;
        }
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
          // FASE 6: Remove watermark after successful boot
          window.__removeBootWatermark?.();
          
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
}
