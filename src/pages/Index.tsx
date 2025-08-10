import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "@/components/BottomNavigation";
import CreateTaskDrawer from "@/components/CreateTaskDrawer";
import TodayPage from "@/pages/TodayPage";
import FoldersPage from "@/pages/FoldersPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("avui");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { createTask, folders } = useTasks();

  const handleCreateTask = (taskData: any) => {
    createTask(taskData);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    // Edit functionality can be enhanced later
  };

  const renderCurrentPage = () => {
    switch (activeTab) {
      case "avui":
        return <TodayPage onEditTask={handleEditTask} />;
      case "carpetes":
        return <FoldersPage />;
      case "configuracio":
        return <SettingsPage />;
      default:
        return <TodayPage onEditTask={handleEditTask} />;
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
        onTabChange={setActiveTab}
        onCreateTask={() => setShowCreateDialog(true)}
      />

      <CreateTaskDrawer
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateTask}
        folders={folders}
      />
    </div>
  );
};

export default Index;
