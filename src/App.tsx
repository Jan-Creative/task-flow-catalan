import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CalendarPage from "./pages/CalendarPage";
import PrepareTomorrowPage from "./pages/PrepareTomorrowPage";
import NotesPage from "./pages/NotesPage";
import { LazyTaskDetailPage, LazyFolderDetailPage } from "@/components/LazyComponents";
import OfflineDemoPage from "./pages/OfflineDemoPage";
import ProjectPage from "./pages/ProjectPage";
import NotFound from "./pages/NotFound";
import { PomodoroWidget } from "@/components/pomodoro/PomodoroWidget";
import { RouteCacheProvider } from "@/components/ui/route-cache";
import { BackgroundRefresher } from "@/components/ui/navigation-optimizers";

import { NotificationDisplay } from "@/components/NotificationDisplay";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import { SecurityMonitor } from "@/components/security/SecurityMonitor";
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
      <BrowserRouter>
        <RouteCacheProvider maxAge={15 * 60 * 1000} maxEntries={25}>
          <BackgroundRefresher />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/prepare-tomorrow" element={<PrepareTomorrowPage />} />
            <Route path="/task/:taskId" element={<LazyTaskDetailPage />} />
            <Route path="/folder/:folderId" element={<LazyFolderDetailPage />} />
            <Route path="/project/:projectId" element={<ProjectPage />} />
            <Route path="/offline-demo" element={<OfflineDemoPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RouteCacheProvider>
      </BrowserRouter>
      <PomodoroWidget />
      <NotificationDisplay />
      <PerformanceMonitor />
      <SecurityMonitor />
    </div>
  );
};

export default App;
