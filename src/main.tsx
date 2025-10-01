import React from "react";
import ReactDOM from "react-dom/client";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { OptimizedAppProvider } from "@/components/ui/optimized-context-provider";
import MinimalProvider from "@/components/ui/minimal-provider";
import { KeyboardNavigationProvider } from "@/contexts/KeyboardNavigationContext";
import { initializePerformanceOptimizations } from "@/lib/performanceOptimizer";
import App from "./App.tsx";
import "./index.css";

// Add initialization logging
console.log('🚀 Lovable App: Initialization started');
console.log('📱 User Agent:', navigator.userAgent);
console.log('🌐 Location:', window.location.href);
console.log('📊 Viewport:', window.innerWidth, 'x', window.innerHeight);

// URL flags
const params = new URLSearchParams(window.location.search);
const SAFE_MODE = params.has('safe');
const DISABLE_SW = params.has('no-sw') || localStorage.getItem('disableSW') === '1';

// Initialize performance optimizations
try {
  initializePerformanceOptimizations();
  console.log('✅ Performance optimizations initialized');
} catch (error) {
  console.error('❌ Performance optimization error:', error);
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

// Render app function with PWA detection
function renderApp() {
  // Detect PWA/Standalone mode
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true ||
                document.referrer.includes('android-app://');
  
  console.log('🎨 Rendering React app... (safe mode:', SAFE_MODE, ", disable SW:", DISABLE_SW, "PWA:", isPWA, ")");
  
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    // Choose provider based on mode
    let ProviderComponent: React.ComponentType<{ children: React.ReactNode; isPWA?: boolean }>;
    
    if (SAFE_MODE) {
      ProviderComponent = MinimalProvider;
    } else if (isPWA) {
      // Dynamically import PWA optimized provider for standalone mode
      import('./components/ui/pwa-optimized-provider').then(module => {
        ProviderComponent = module.PWAOptimizedProvider;
        renderWithProvider();
      });
      return; // Exit early, will render after import
    } else {
      ProviderComponent = OptimizedAppProvider;
    }

    renderWithProvider();

    function renderWithProvider() {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <EnhancedErrorBoundary context="Aplicació Principal" showDetails={true}>
            <ProviderComponent isPWA={isPWA}>
              <KeyboardNavigationProvider>
                <App />
              </KeyboardNavigationProvider>
            </ProviderComponent>
          </EnhancedErrorBoundary>
        </React.StrictMode>
      );
      console.log('✅ App rendered successfully', isPWA ? '(PWA Mode)' : '(Browser Mode)');
    }
  } catch (error) {
    console.error('❌ Critical error rendering app:', error);
    // Enhanced fallback with emergency reset
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; padding: 1rem; font-family: system-ui, -apple-system, sans-serif;">
          <div style="max-width: 500px; width: 100%; background: rgba(255,255,255,0.95); color: #1a1a1a; padding: 2rem; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="color: #ef4444; font-size: 3rem; margin-bottom: 1rem; text-align: center;">⚠️</div>
            <h1 style="color: #ef4444; margin-bottom: 1rem; font-size: 1.5rem; text-align: center; font-weight: 600;">Error Crític</h1>
            <p style="margin-bottom: 1.5rem; color: #6b7280; text-align: center;">No s'ha pogut carregar l'aplicació.</p>
            <button onclick="(async()=>{if('caches'in window){const n=await caches.keys();await Promise.all(n.map(c=>caches.delete(c)))}if('serviceWorker'in navigator){const r=await navigator.serviceWorker.getRegistrations();for(const reg of r)await reg.unregister()}localStorage.clear();sessionStorage.clear();location.href=location.origin+'?nocache='+Date.now()})()" 
                    style="width: 100%; background: #ef4444; color: white; padding: 1rem; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 0.75rem; font-size: 1rem; font-weight: 600; box-shadow: 0 4px 12px rgba(239,68,68,0.3);">
              🔄 Reset d'Emergència
            </button>
            <button onclick="window.open(location.origin,'_blank')" 
                    style="width: 100%; background: #3b82f6; color: white; padding: 1rem; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 0.75rem; font-size: 1rem; font-weight: 600; box-shadow: 0 4px 12px rgba(59,130,246,0.3);">
              🌐 Obrir en Navegador
            </button>
            <button onclick="location.reload()" 
                    style="width: 100%; background: #6b7280; color: white; padding: 0.875rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.95rem;">
              Recarregar Simple
            </button>
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; text-align: center; font-size: 0.75rem; color: #9ca3af;">
              Si el problema persisteix, utilitza "Reset d'Emergència"
            </div>
          </div>
        </div>
      `;
    }
  }
}

// Service Worker registration with debug/safe flags
if ('serviceWorker' in navigator) {
  console.log('🔧 Service Worker support detected');

  if (DISABLE_SW) {
    console.warn('🧪 SW disabled via flag (?no-sw=1 or localStorage.disableSW=1)');
    window.addEventListener('load', async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister().catch(() => {})));
      renderApp();
    });
  } else {
    // Set timeout to render app even if SW takes too long
    const swTimeout = setTimeout(() => {
      console.warn('⚠️ Service Worker timeout - rendering app anyway');
      renderApp();
    }, 2000);

    window.addEventListener('load', async () => {
      try {
        console.log('🧹 Checking for legacy Service Workers...');
        const existingRegs = await navigator.serviceWorker.getRegistrations();
        for (const reg of existingRegs) {
          const url = reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || '';
          if (url && !url.endsWith('/sw-advanced.js')) {
            console.log('🗑️ Removing legacy Service Worker:', url);
            await reg.unregister().catch(e => console.warn('Failed to unregister:', e));
          }
        }

        // Register or reuse Service Worker
        let registration = await navigator.serviceWorker.getRegistration();
        const hasCorrectSW = !!registration && (
          registration.active?.scriptURL?.endsWith('/sw-advanced.js') ||
          registration.waiting?.scriptURL?.endsWith('/sw-advanced.js') ||
          registration.installing?.scriptURL?.endsWith('/sw-advanced.js')
        );

        if (!hasCorrectSW) {
          console.log('📦 Registering Service Worker...');
          registration = await navigator.serviceWorker.register('/sw-advanced.js', { scope: '/' });
        }

        console.log('✅ Service Worker registered:', registration!.scope);
        clearTimeout(swTimeout);

        // Listen for updates
        registration!.addEventListener('updatefound', () => {
          const newWorker = registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New SW version installed');
                // Do NOT auto-reload to avoid loops
              }
            });
          }
        });

        renderApp();
      } catch (error) {
        console.error('❌ Service Worker error:', error);
        renderApp(); // Render app even if SW fails
        clearTimeout(swTimeout);
      }
    });
  }
} else {
  console.log('⚠️ Service Worker not supported');
  renderApp();
}

