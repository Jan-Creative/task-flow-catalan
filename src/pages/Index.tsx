import { useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import TodayPage from "@/pages/TodayPage";
import FoldersPage from "@/pages/FoldersPage";
import SettingsPage from "@/pages/SettingsPage";
import { useTasks } from "@/hooks/useTasks";

const Index = () => {
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

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentPage()}
      
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateTask={() => setShowCreateDialog(true)}
      />

      <CreateTaskDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateTask}
        folders={folders}
      />
    </div>
  );
};

export default Index;
