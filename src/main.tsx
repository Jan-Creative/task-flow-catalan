import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import { KeyboardShortcutsProvider } from "@/contexts/KeyboardShortcutsContext";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
import { NotificationDisplay } from "./components/NotificationDisplay";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <KeyboardShortcutsProvider>
            <PomodoroProvider>
              <App />
              <Toaster />
              <NotificationDisplay />
            </PomodoroProvider>
          </KeyboardShortcutsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
