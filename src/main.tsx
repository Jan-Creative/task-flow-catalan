import React from "react";
import ReactDOM from "react-dom/client";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { OptimizedAppProvider } from "@/components/ui/optimized-context-provider";
import { KeyboardNavigationProvider } from "@/contexts/KeyboardNavigationContext";
import { initializePerformanceOptimizations } from "@/lib/performanceOptimizer";
import App from "./App.tsx";
import "./index.css";

// Add initialization logging
console.log('🚀 Lovable App: Initialization started');
console.log('📱 User Agent:', navigator.userAgent);
console.log('🌐 Location:', window.location.href);
console.log('📊 Viewport:', window.innerWidth, 'x', window.innerHeight);

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

// Render app function
function renderApp() {
  console.log('🎨 Rendering React app...');
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <EnhancedErrorBoundary context="Aplicació Principal" showDetails={true}>
          <OptimizedAppProvider>
            <KeyboardNavigationProvider>
              <App />
            </KeyboardNavigationProvider>
          </OptimizedAppProvider>
        </EnhancedErrorBoundary>
      </React.StrictMode>
    );
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Critical error rendering app:', error);
    // Fallback: show error directly in DOM
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="min-height: 100vh; background: #0a0a0a; color: white; display: flex; align-items: center; justify-content: center; padding: 1rem; font-family: system-ui, -apple-system, sans-serif;">
          <div style="max-width: 500px; width: 100%; background: #1a1a1a; padding: 2rem; border-radius: 12px; border: 1px solid #2a2a2a;">
            <div style="color: #ef4444; font-size: 2rem; margin-bottom: 1rem; text-align: center;">⚠️</div>
            <h1 style="color: #ef4444; margin-bottom: 1rem; font-size: 1.5rem; text-align: center;">Error Crític</h1>
            <p style="margin-bottom: 1rem; color: #9ca3af; text-align: center;">No s'ha pogut carregar l'aplicació.</p>
            <pre style="background: #0a0a0a; padding: 1rem; border-radius: 6px; overflow: auto; font-size: 0.75rem; color: #d1d5db; border: 1px solid #2a2a2a;">${error}</pre>
            <button onclick="window.location.reload()" style="width: 100%; background: #3b82f6; color: white; padding: 0.875rem; border: none; border-radius: 6px; cursor: pointer; margin-top: 1rem; font-size: 1rem; font-weight: 500;">
              Recarregar Aplicació
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Service Worker registration with timeout fallback
if ('serviceWorker' in navigator) {
  console.log('🔧 Service Worker support detected');
  
  // Set timeout to render app even if SW takes too long
  const swTimeout = setTimeout(() => {
    console.warn('⚠️ Service Worker timeout - rendering app anyway');
    renderApp();
  }, 2000); // 2 second timeout

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
      const hasCorrectSW = !!registration && 
        (registration.active?.scriptURL?.endsWith('/sw-advanced.js') ||
         registration.waiting?.scriptURL?.endsWith('/sw-advanced.js') ||
         registration.installing?.scriptURL?.endsWith('/sw-advanced.js'));

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
              console.log('🔄 New SW version available');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });

      // Listen for SW activation messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_ACTIVATED' && event.data?.shouldReload) {
          console.log('🔄 SW activated, reloading...');
          setTimeout(() => window.location.reload(), 100);
        }
      });

      renderApp();
      
    } catch (error) {
      console.error('❌ Service Worker error:', error);
      clearTimeout(swTimeout);
      renderApp(); // Render app even if SW fails
    }
  });
} else {
  console.log('⚠️ Service Worker not supported');
  renderApp();
}

