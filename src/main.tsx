import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import { KeyboardShortcutsProvider } from "@/contexts/KeyboardShortcutsContext";
import { PropertyDialogProvider } from "@/contexts/PropertyDialogContext";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import { createOptimizedQueryClient } from "@/lib/optimizedCache";
import { initializePerformanceOptimizations } from "@/lib/performanceOptimizer";
import App from "./App.tsx";
import "./index.css";

// Create optimized query client
const queryClient = createOptimizedQueryClient();

// Initialize performance optimizations
initializePerformanceOptimizations();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EnhancedErrorBoundary context="Aplicació Principal" showDetails={true}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <BackgroundProvider>
            <KeyboardShortcutsProvider>
              <PomodoroProvider>
                <PropertyDialogProvider>
                  <App />
                </PropertyDialogProvider>
              </PomodoroProvider>
            </KeyboardShortcutsProvider>
          </BackgroundProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  </React.StrictMode>
);
