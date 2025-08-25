import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { LazyTaskDetailPage, LazyFolderDetailPage } from "@/components/LazyComponents";
import NotFound from "./pages/NotFound";
import { PomodoroWidget } from "@/components/pomodoro/PomodoroWidget";
import { RouteCacheProvider } from "@/components/ui/route-cache";
import { BackgroundRefresher } from "@/components/ui/navigation-optimizers";
import { BackgroundRenderer } from "@/components/backgrounds/BackgroundRenderer";
import { NotificationDisplay } from "@/components/NotificationDisplay";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import { SecurityMonitor } from "@/components/security/SecurityMonitor";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { config, validateConfig } from "@/config/appConfig";

const App = () => {
  // Validate configuration on app start - handle errors gracefully
  try {
    const validation = validateConfig(config);
    if (!validation.valid && config.environment.BUILD_MODE === 'production') {
      console.error('App configuration invalid:', validation.errors);
    }
  } catch (error) {
    console.warn('Configuration validation warning:', error);
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <BackgroundRenderer />
      <TooltipProvider>
        <SecurityProvider>
          <NotificationProvider>
            <Toaster />
            <BrowserRouter>
              <RouteCacheProvider maxAge={15 * 60 * 1000} maxEntries={25}>
                <BackgroundRefresher />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/task/:taskId" element={<LazyTaskDetailPage />} />
                  <Route path="/folder/:folderId" element={<LazyFolderDetailPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </RouteCacheProvider>
            </BrowserRouter>
            <PomodoroWidget />
            <NotificationDisplay />
            <PerformanceMonitor />
            <SecurityMonitor />
          </NotificationProvider>
        </SecurityProvider>
      </TooltipProvider>
    </div>
  );
};

export default App;
