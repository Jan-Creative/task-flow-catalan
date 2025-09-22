import React from "react";
import ReactDOM from "react-dom/client";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { OptimizedAppProvider } from "@/components/ui/optimized-context-provider";
import { initializePerformanceOptimizations } from "@/lib/performanceOptimizer";
import App from "./App.tsx";
import "./index.css";

// Initialize performance optimizations
initializePerformanceOptimizations();

// Manual Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw-advanced.js', {
        scope: '/'
      });
      
      console.log('Service Worker registrat correctament:', registration.scope);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nova versió del Service Worker disponible');
            }
          });
        }
      });
      
    } catch (error) {
      console.error('Error registrant el Service Worker:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EnhancedErrorBoundary context="Aplicació Principal" showDetails={true}>
      <OptimizedAppProvider>
        <App />
      </OptimizedAppProvider>
    </EnhancedErrorBoundary>
  </React.StrictMode>
);
