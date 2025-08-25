import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "@/components/BottomNavigation";
import { LazyPage, TodayPageLazy, FoldersPageLazy, SettingsPageLazy, NotificationsPageLazy, CreateTaskModalLazy } from "@/lib/lazyLoading";
import CalendarPage from "@/pages/CalendarPage";
import AuthPage from "@/pages/AuthPage";
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
    return searchParams.get("tab") || "avui";
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
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
    const tab = searchParams.get("tab") || "avui";
    setActiveTab(tab);
  }, [searchParams]);

  // Actualitzar URL quan canvia activeTab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "avui") {
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
    }
  };

  const handleEditTaskClick = (task: any) => {
    setEditingTask(task);
    setShowCreateDialog(true);
  };

  // Keep-alive rendering with lazy loading - All pages stay mounted
  const renderKeepAlivePages = useCallback(() => (
    <div className="relative w-full">
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
      {/* User info header */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <div className="bg-card/80 backdrop-blur-glass border border-border/50 rounded-xl px-3 py-2 shadow-glass">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {user.user_metadata?.full_name || user.email}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="bg-card/80 backdrop-blur-glass border-border/50 hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <KeepAlivePages activeTab={activeTab}>
        {renderKeepAlivePages()}
      </KeepAlivePages>
      
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreateTask={() => setShowCreateDialog(true)}
      />

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
