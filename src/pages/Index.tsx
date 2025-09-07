import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdaptiveNavigation from "@/components/navigation/AdaptiveNavigation";
import AdaptiveLayout from "@/components/layout/AdaptiveLayout";
import DeviceIndicator from "@/components/DeviceIndicator";
import { LazyPage, TodayPageLazy, FoldersPageLazy, SettingsPageLazy, NotificationsPageLazy, CreateTaskModalLazy } from "@/lib/lazyLoading";
import CalendarPage from "@/pages/CalendarPage";
import DashboardPage from "@/pages/DashboardPage";
import AuthPage from "@/pages/AuthPage";
import PrepareTomorrowPage from "@/pages/PrepareTomorrowPage";
import { useDadesApp } from "@/hooks/useDadesApp";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { usePerformanceMonitor, useCacheOptimization, useMemoryCleanup } from "@/hooks/usePerformanceOptimization";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useShortcut } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";
import { KeepAlivePages, TabPage } from "@/components/ui/keep-alive-pages";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "inici";
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { folders } = useDadesApp();
  const { handleCreateTask, handleEditTask: handleEditTaskOp } = useTaskOperations();
  
  
  // Performance optimizations - simplified to avoid conflicts
  const performanceMetrics = usePerformanceMonitor();
  const { preloadCriticalData } = useCacheOptimization();
  useMemoryCleanup();

  // Funció de toggle amb useCallback per assegurar estat actualitzat
  const toggleCreateDialog = useCallback(() => {
    if (showCreateDialog) {
      setShowCreateDialog(false);
      setEditingTask(null);
    } else {
      setShowCreateDialog(true);
    }
  }, [showCreateDialog]);

  // Registrar drecera per crear tasca (Cmd/Ctrl + N) - Toggle behavior
  useShortcut(
    'createTask',
    'Crear Tasca',
    ['meta', 'n'],
    toggleCreateDialog,
    {
      description: 'Obrir/tancar el formulari per crear una nova tasca',
      category: 'actions',
      enabled: !!user // Només si l'usuari està autenticat
    }
  );

  // Sincronitzar activeTab amb paràmetres URL
  useEffect(() => {
    const tab = searchParams.get("tab") || "inici";
    setActiveTab(tab);
  }, [searchParams]);

  // Actualitzar URL quan canvia activeTab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "inici") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const handleTaskSubmit = async (taskData: any, customProperties?: Array<{propertyId: string; optionId: string}>) => {
    try {
      if (editingTask) {
        await handleEditTaskOp(editingTask.id, taskData, customProperties);
        setEditingTask(null);
      } else {
        await handleCreateTask(taskData, customProperties);
      }
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating/updating task with properties:", error);
      // Error is already handled by the hook with toast notification
      // Just ensure dialog stays open for retry
    }
  };

  const handleEditTaskClick = (task: any) => {
    setEditingTask(task);
    setShowCreateDialog(true);
  };

  // Keep-alive rendering with lazy loading - All pages stay mounted
  const renderKeepAlivePages = useCallback(() => (
    <div className="relative w-full">
      <TabPage tabId="inici" activeTab={activeTab}>
        <LazyPage pageName="Inici">
          <DashboardPage 
            onEditTask={handleEditTaskClick} 
            onNavigateToTasks={() => setActiveTab("avui")}
            onNavigateToCalendar={() => setActiveTab("calendar")}
          />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="avui" activeTab={activeTab}>
        <LazyPage pageName="Avui">
          <TodayPageLazy 
            onEditTask={handleEditTaskClick} 
            onNavigateToSettings={() => setActiveTab("configuracio")} 
          />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="carpetes" activeTab={activeTab}>
        <LazyPage pageName="Carpetes">
          <FoldersPageLazy />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="calendar" activeTab={activeTab}>
        <LazyPage pageName="Calendari">
          <CalendarPage />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="notificacions" activeTab={activeTab}>
        <LazyPage pageName="Notificacions">
          <NotificationsPageLazy />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="preparar-dema" activeTab={activeTab}>
        <LazyPage pageName="Preparar demà">
          <PrepareTomorrowPage />
        </LazyPage>
      </TabPage>
      
      <TabPage tabId="configuracio" activeTab={activeTab}>
        <LazyPage pageName="Configuració">
          <SettingsPageLazy />
        </LazyPage>
      </TabPage>
    </div>
  ), [activeTab, handleEditTaskClick]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Carregant...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show main app if authenticated
  return (
    <div className="w-full min-h-screen bg-background overflow-x-hidden relative">
      {/* Adaptive Navigation */}
      <AdaptiveNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreateTask={() => setShowCreateDialog(true)}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content with Adaptive Layout */}
      <AdaptiveLayout sidebarCollapsed={sidebarCollapsed}>
        <KeepAlivePages activeTab={activeTab}>
          {renderKeepAlivePages()}
        </KeepAlivePages>
      </AdaptiveLayout>

      {/* Device Indicator for testing */}
      <DeviceIndicator />

      <CreateTaskModalLazy
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        folders={folders}
        editingTask={editingTask}
      />
    </div>
  );
};

export default Index;
