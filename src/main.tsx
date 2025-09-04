import React from "react";
import ReactDOM from "react-dom/client";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { OptimizedAppProvider } from "@/components/ui/optimized-context-provider";
import { initializePerformanceOptimizations } from "@/lib/performanceOptimizer";
import App from "./App.tsx";
import "./index.css";

// Initialize performance optimizations
initializePerformanceOptimizations();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EnhancedErrorBoundary context="Aplicació Principal" showDetails={true}>
      <OptimizedAppProvider>
        <App />
      </OptimizedAppProvider>
    </EnhancedErrorBoundary>
  </React.StrictMode>
);
