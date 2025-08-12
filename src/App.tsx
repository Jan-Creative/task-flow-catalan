import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TaskDetailPage from "./pages/TaskDetailPage";
import FolderDetailPage from "./pages/FolderDetailPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <div className="w-full min-h-screen overflow-x-hidden">
    <TooltipProvider>
      <Toaster />
      <SonnerToaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/task/:taskId" element={<TaskDetailPage />} />
          <Route path="/folder/:folderId" element={<FolderDetailPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </div>
);

export default App;
