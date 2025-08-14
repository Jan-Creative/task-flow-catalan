import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { LazyTaskDetailPage, LazyFolderDetailPage } from "@/components/LazyComponents";
import NotFound from "./pages/NotFound";
import { PomodoroWidget } from "@/components/pomodoro/PomodoroWidget";
import { RouteCacheProvider } from "@/components/ui/route-cache";

const App = () => (
  <div className="w-full min-h-screen overflow-x-hidden">
    <TooltipProvider>
      <RouteCacheProvider maxAge={10 * 60 * 1000} maxEntries={15}>
        <Toaster />
        <SonnerToaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/task/:taskId" element={<LazyTaskDetailPage />} />
            <Route path="/folder/:folderId" element={<LazyFolderDetailPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <PomodoroWidget />
      </RouteCacheProvider>
    </TooltipProvider>
  </div>
);

export default App;
