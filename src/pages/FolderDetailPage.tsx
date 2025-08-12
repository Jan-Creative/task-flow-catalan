import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/hooks/useTasks";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";
import TaskChecklistItem from "@/components/TaskChecklistItem";
import CreateTaskDrawer from "@/components/CreateTaskDrawer";
import DatabaseToolbar from "@/components/DatabaseToolbar";

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
  const { getStatusLabel, getStatusOptions, getStatusColor } = usePropertyLabels();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  // Find current folder - get real inbox folder from database
  const realInboxFolder = folders.find(f => f.is_system && f.name === 'Bustia');
  const currentFolder = folderId === 'inbox' 
    ? realInboxFolder || { id: 'inbox', name: 'Bustia', color: '#6366f1', is_system: true }
    : folders.find(f => f.id === folderId);

  // Custom handler for status changes with different behavior per view mode
  const handleStatusChange = async (taskId: string, status: any) => {
    // Clear existing timeout for this task if any
    const existingTimeout = timeoutsRef.current.get(taskId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutsRef.current.delete(taskId);
    }

    // Remove from completing state
    setCompletingTasks(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });

    if (status === 'completat') {
      // Start completing animation
      setCompletingTasks(prev => new Set(prev).add(taskId));
      
      // Set timeout for 3 seconds
      const timeout = setTimeout(async () => {
        // Remove from completing state
        setCompletingTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
        
        // Update task status
        await updateTaskStatus(taskId, status);
        
        if (viewMode === 'kanban') {
          // In kanban mode: add to recently completed to keep visible
          setRecentlyCompleted(prev => new Set(prev).add(taskId));
        }
        
        // Clean up timeout reference
        timeoutsRef.current.delete(taskId);
      }, 3000);
      
      // Store timeout reference
      timeoutsRef.current.set(taskId, timeout);
    } else {
      // For non-completed status, remove from recently completed and update normally
      setRecentlyCompleted(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      await updateTaskStatus(taskId, status);
    }
  };

  // Filter tasks for this folder with view mode logic
  const folderTasks = (() => {
    // If still loading or no data, return empty array
    if (loading || tasks.length === 0) {
      return [];
    }

    // First get all tasks for this folder
    let baseTasks = [];
    if (folderId === 'inbox') {
      // For inbox, show tasks assigned to the real inbox folder
      // OR tasks without folder_id (legacy compatibility)
      baseTasks = tasks.filter(task => {
        if (realInboxFolder) {
          return task.folder_id === realInboxFolder.id || !task.folder_id;
        }
        // Fallback: if no real inbox folder found, show tasks without folder_id
        return !task.folder_id;
      });
    } else {
      // For other folders, show tasks with matching folder_id
      baseTasks = tasks.filter(task => task.folder_id === folderId);
    }

    // Apply view mode logic
    const filteredTasks = baseTasks.filter(task => {
      // Always show tasks that are in completing state
      if (completingTasks.has(task.id)) {
        return true;
      }
      
      if (viewMode === 'list') {
        // In list mode: hide completed tasks completely (unless completing)
        if (task.status === 'completat') {
          return false;
        }
      } else {
        // In kanban mode: show completed tasks in their column
        if (task.status === 'completat' && !recentlyCompleted.has(task.id)) {
          // Show completed tasks in kanban mode
          if (filterStatus === 'completat' || filterStatus === 'all') {
            return true;
          }
          return false;
        }
        // Keep recently completed tasks visible in kanban
        if (task.status === 'completat' && recentlyCompleted.has(task.id)) {
          return true;
        }
      }
      
      let matchesStatus = filterStatus === "all" || task.status === filterStatus;
      let matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      return matchesStatus && matchesPriority;
    });

    return filteredTasks;
  })();

  const getStatusTasks = (status: string) => {
    return folderTasks.filter(task => task.status === status);
  };

  // Function to get dynamic column background style based on status color
  const getColumnBackgroundStyle = (columnId: string) => {
    const statusColor = getStatusColor(columnId);
    if (statusColor && statusColor.startsWith('#')) {
      // Convert hex to RGB and apply with opacity
      const hex = statusColor.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
        backdropFilter: 'blur(8px)'
      };
    }
    // Fallback to default card background
    return {};
  };

  const statusColumns = getStatusOptions().map(option => ({
    id: option.value,
    label: option.label,
    tasks: getStatusTasks(option.value)
  }));

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
          folder_id: folderId === 'inbox' ? (realInboxFolder?.id || null) : folderId
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

        {/* Database Toolbar */}
        <DatabaseToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onFilterPriorityChange={setFilterPriority}
          onNavigateToSettings={() => navigate('/settings')}
        />

        {/* Tasks content */}
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
            <>
              {viewMode === "list" && (
                <div className="space-y-2">
                  {folderTasks.map((task) => (
                    <TaskChecklistItem
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onEdit={handleEditTask}
                      onDelete={deleteTask}
                      viewMode={viewMode}
                      completingTasks={completingTasks}
                    />
                  ))}
                </div>
              )}

              {viewMode === "kanban" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                  {statusColumns.map((column) => (
                    <div 
                      key={column.id} 
                      className="rounded-2xl p-4 border border-border/50"
                      style={getColumnBackgroundStyle(column.id)}
                    >
                      <div className="pb-3">
                        <div className="text-sm font-medium flex items-center justify-between">
                          <span>{column.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {column.tasks.length}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {column.tasks.map((task) => (
                          <TaskChecklistItem
                            key={task.id}
                            task={task}
                            onStatusChange={handleStatusChange}
                            onEdit={handleEditTask}
                            onDelete={deleteTask}
                            viewMode={viewMode}
                            completingTasks={completingTasks}
                          />
                        ))}
                        {column.tasks.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            Cap tasca en aquest estat
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
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