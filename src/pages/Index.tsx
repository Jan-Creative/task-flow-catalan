import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "@/components/BottomNavigation";
import CreateTaskDrawer from "@/components/CreateTaskDrawer";
import TodayPage from "@/pages/TodayPage";
import FoldersPage from "@/pages/FoldersPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import { useDadesApp } from "@/hooks/useDadesApp";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useShortcut } from "@/hooks/useKeyboardShortcuts";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "avui";
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { createTask, updateTask, folders } = useDadesApp();
  const { toast } = useToast();

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

  const handleCreateTask = (taskData: any) => {
    if (editingTask) {
      // If editing, update the existing task
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } else {
      // If creating, create new task
      createTask(taskData);
    }
    setShowCreateDialog(false);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowCreateDialog(true);
  };

  const renderCurrentPage = () => {
    switch (activeTab) {
      case "avui":
        return <TodayPage 
          onEditTask={handleEditTask} 
          onNavigateToSettings={() => setActiveTab("configuracio")}
        />;
      case "carpetes":
        return <FoldersPage />;
      case "configuracio":
        return <SettingsPage />;
      default:
        return <TodayPage 
          onEditTask={handleEditTask} 
          onNavigateToSettings={() => setActiveTab("configuracio")}
        />;
    }
  };

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

      {renderCurrentPage()}
      
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreateTask={() => setShowCreateDialog(true)}
      />

      <CreateTaskDrawer
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateTask}
        folders={folders}
        editingTask={editingTask}
      />
    </div>
  );
};

export default Index;
