import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { LazyTaskDetailPage, LazyFolderDetailPage } from "@/components/LazyComponents";
import NotFound from "./pages/NotFound";
import { PomodoroWidget } from "@/components/pomodoro/PomodoroWidget";
import { RouteCacheProvider } from "@/components/ui/route-cache";
import { BackgroundRefresher } from "@/components/ui/navigation-optimizers";

const App = () => (
  <div className="w-full min-h-screen overflow-x-hidden">
    <TooltipProvider>
      <Toaster />
      <SonnerToaster />
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
    </TooltipProvider>
  </div>
);

export default App;
