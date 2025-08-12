import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import TaskChecklistItem from "@/components/TaskChecklistItem";
import CreateTaskDrawer from "@/components/CreateTaskDrawer";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pendent" | "en_proces" | "completat";
  priority: "alta" | "mitjana" | "baixa";
  folder_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

const FolderDetailPage = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { tasks, folders, loading, updateTaskStatus, updateTask, deleteTask, createTask } = useTasks();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Find current folder
  const currentFolder = folderId === 'inbox' 
    ? { id: 'inbox', name: 'Bustia', color: '#6366f1', is_system: true }
    : folders.find(f => f.id === folderId);

  // Filter tasks for this folder
  const folderTasks = folderId === 'inbox'
    ? tasks.filter(task => !task.folder_id) // Only tasks without folder
    : tasks.filter(task => task.folder_id === folderId);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowCreateTask(true);
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        setEditingTask(null);
      } else {
        const newTaskData = {
          ...taskData,
          folder_id: folderId === 'inbox' ? null : folderId
        };
        await createTask(newTaskData);
      }
      setShowCreateTask(false);
    } catch (error) {
      console.error("Error creating/updating task:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-gentle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Carregant...</p>
        </div>
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="min-h-screen bg-gradient-gentle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Carpeta no trobada</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            Tornar a l'inici
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-gentle">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with breadcrumb and folder info */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tornar a Carpetes
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div 
              className="flex-shrink-0 p-3 rounded-xl backdrop-blur-sm"
              style={{ 
                backgroundColor: `${currentFolder.color}20`,
                border: `1px solid ${currentFolder.color}40`
              }}
            >
              <FolderOpen 
                className="h-6 w-6" 
                style={{ color: currentFolder.color }}
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {currentFolder.name}
              </h1>
              <p className="text-muted-foreground">
                {folderTasks.length} {folderTasks.length === 1 ? 'tasca' : 'tasques'}
              </p>
            </div>

            <Button
              onClick={() => setShowCreateTask(true)}
              className="bg-gradient-primary hover:scale-105 transition-bounce"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Tasca
            </Button>
          </div>
        </div>

        {/* Tasks list */}
        <div className="space-y-1">
          {folderTasks.length === 0 ? (
            <div className="text-center py-12">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ 
                  backgroundColor: `${currentFolder.color}20`,
                  border: `1px solid ${currentFolder.color}40`
                }}
              >
                <FolderOpen 
                  className="h-8 w-8" 
                  style={{ color: currentFolder.color }}
                />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Carpeta buida
              </h3>
              <p className="text-muted-foreground mb-4">
                Afegeix la teva primera tasca a aquesta carpeta
              </p>
              <Button
                onClick={() => setShowCreateTask(true)}
                variant="outline"
                className="bg-secondary/50 border-border/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primera tasca
              </Button>
            </div>
          ) : (
            folderTasks.map((task) => (
              <TaskChecklistItem
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onEdit={handleEditTask}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Task Drawer */}
      <CreateTaskDrawer
        open={showCreateTask}
        onClose={() => {
          setShowCreateTask(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateTask}
        editingTask={editingTask}
        folders={folders}
      />
    </div>
  );
};

export default FolderDetailPage;