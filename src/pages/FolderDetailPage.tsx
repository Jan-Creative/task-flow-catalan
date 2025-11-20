import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTasksCore } from "@/hooks/tasks/useTasksCore";
// useDadesApp removed - using useTasksCore only
import { logger } from "@/lib/debugUtils";
import type { Task } from "@/types";
import { useUnifiedProperties } from "@/hooks/useUnifiedProperties";
import TaskChecklistItem from "@/components/TaskChecklistItem";
import { CreateTaskModalLazy, LazyModal } from '@/lib/lazyLoading';
import BottomNavigation from "@/components/BottomNavigation";
import { FolderCustomizationPopover } from "@/components/folders/FolderCustomizationPopover";
import { getIconByName } from "@/lib/iconLibrary";
import { UnifiedFolderToolbar } from "@/components/folders/UnifiedFolderToolbar";


const FolderDetailPage = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { 
    tasks, 
    folders, 
    loading, 
    actualitzarEstat: updateTaskStatus, 
    actualitzarTasca: updateTask, 
    eliminarTasca: deleteTask, 
    actualitzarDades: refreshData,
    crearTasca: handleCreateTask,
    actualitzarCarpeta: updateFolder,
  } = useTasksCore();
  const { getStatusLabel, getStatusOptions, getStatusColor } = useUnifiedProperties();
  
  const handleEditTaskOp = async (
    taskId: string, 
    updates: any, 
    customProperties?: Array<{propertyId: string; optionId: string}>
  ) => {
    await updateTask(taskId, updates, customProperties);
  };
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "organize">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [showCreateTaskFromNav, setShowCreateTaskFromNav] = useState(false);
  
  // Task selection state
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

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
    ? realInboxFolder 
    : folders.find(f => f.id === folderId);
  
  logger.debug('FolderDetail', 'Current folder data', { 
    folderId, 
    realInboxFolder, 
    currentFolder, 
    allFolders: folders 
  });

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

  // Get base tasks for this folder
  const baseFolderTasks = (() => {
    if (loading || tasks.length === 0) {
      return [];
    }

    if (folderId === 'inbox') {
      return tasks.filter(task => {
        if (realInboxFolder) {
          return task.folder_id === realInboxFolder.id || !task.folder_id;
        }
        return !task.folder_id;
      });
    } else {
      return tasks.filter(task => task.folder_id === folderId);
    }
  })();

  // Get unscheduled tasks (for organize view detection)
  const unscheduledTasks = baseFolderTasks.filter(task => 
    !task.due_date && task.status !== 'completat'
  );

  // Filter tasks for this folder with view mode logic
  const folderTasks = (() => {
    if (loading || tasks.length === 0) {
      return [];
    }

    // In organize mode, only show unscheduled tasks
    if (viewMode === 'organize') {
      return unscheduledTasks.filter(task => {
        let matchesStatus = filterStatus === "all" || task.status === filterStatus;
        let matchesPriority = filterPriority === "all" || task.priority === filterPriority;
        return matchesStatus && matchesPriority;
      });
    }

    // Apply view mode logic for list/kanban
    const filteredTasks = baseFolderTasks.filter(task => {
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

    // Apply sorting
    if (sortBy !== "none") {
      filteredTasks.sort((a, b) => {
        let aValue, bValue;
        
        if (sortBy === "created_at") {
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
        } else if (sortBy === "due_date") {
          // Handle null due_date values - push them to the end
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          aValue = new Date(a.due_date).getTime();
          bValue = new Date(b.due_date).getTime();
        } else {
          return 0;
        }
        
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

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

  const handleTaskSubmit = async (taskData: any, customProperties?: Array<{propertyId: string; optionId: string}>) => {
    try {
      if (editingTask) {
        await handleEditTaskOp(editingTask.id, taskData, customProperties);
        setEditingTask(null);
      } else {
        const newTaskData = {
          ...taskData,
          folder_id: folderId === 'inbox' ? (realInboxFolder?.id || null) : folderId
        };
        await handleCreateTask(newTaskData, customProperties);
      }
      setShowCreateTask(false);
    } catch (error) {
      logger.error("Error creating/updating task", error);
      // Error is already handled by the hook with toast notification
      // Just ensure dialog stays open for retry
    }
  };

  // Handle navigation from bottom navigation
  const handleTabChange = (tab: string) => {
    switch (tab) {
      case "avui":
        navigate('/');
        break;
      case "carpetes":
        navigate('/?tab=carpetes');
        break;
      case "configuracio":
        navigate('/?tab=configuracio');
        break;
      default:
        navigate('/');
    }
  };

  const handleCreateTaskFromNav = () => {
    setShowCreateTaskFromNav(true);
    setShowCreateTask(true);
  };

  // Task selection handlers
  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === folderTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(folderTasks.map(task => task.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedTasks([]);
    setSelectionMode(false);
  };

  // Note: Removed useEffect that auto-disabled selection mode to prevent interference with user actions

  // Check if current folder is inbox
  const isInboxFolder = folderId === 'inbox' || 
    (currentFolder && currentFolder.is_system && currentFolder.name === 'Bustia');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Carregant...</p>
        </div>
      </div>
    );
  }

  if (!currentFolder) {
    logger.warn("No folder found for folderId", { folderId });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Carpeta no trobada</h2>
          <p className="text-muted-foreground mb-4">
            {folderId === 'inbox' ? 'No s\'ha trobat la carpeta Bustia' : 'La carpeta especificada no existeix'}
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Tornar a l'inici
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with breadcrumb and folder info */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/?tab=carpetes')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tornar a Carpetes
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <FolderCustomizationPopover
              folderId={currentFolder.id}
              currentIcon={currentFolder.icon}
              currentColor={currentFolder.color}
              onUpdate={async (updates) => {
                logger.debug('FolderDetail', 'onUpdate called', { 
                  folderId: currentFolder.id, 
                  isSystem: currentFolder.is_system,
                  updates 
                });
                
                await updateFolder(currentFolder.id, updates);
              }}
            >
              <div 
                className={`flex-shrink-0 p-3 rounded-xl backdrop-blur-sm transition-all duration-200 ${
                  currentFolder.is_system ? '' : 'cursor-pointer hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: `${currentFolder.color}20`,
                  border: `1px solid ${currentFolder.color}40`
                }}
              >
                {(() => {
                  if (currentFolder.icon) {
                    const IconComponent = getIconByName(currentFolder.icon)?.icon;
                    if (IconComponent) {
                      return <IconComponent className="h-6 w-6" style={{ color: currentFolder.color }} />;
                    }
                  }
                  return <FolderOpen className="h-6 w-6" style={{ color: currentFolder.color }} />;
                })()}
              </div>
            </FolderCustomizationPopover>
            
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

        {/* Unified Toolbar */}
        <UnifiedFolderToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onFilterPriorityChange={setFilterPriority}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
          onNavigateToSettings={() => navigate('/settings')}
          onCreateTask={() => setShowCreateTask(true)}
          tasks={folderTasks}
          selectedTasks={selectedTasks}
          onSelectTask={handleSelectTask}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          selectionMode={selectionMode}
          onToggleSelectionMode={() => {
            setSelectionMode(!selectionMode);
            if (selectionMode) {
              handleClearSelection();
            }
          }}
          isInboxFolder={isInboxFolder}
          inboxTaskCount={folderTasks.length}
          unscheduledTasksCount={unscheduledTasks.length}
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
              {viewMode === "organize" && (
                <div className="space-y-3">
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-amber-500/10 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-amber-700 dark:text-amber-300">
                          Tasques per organitzar
                        </h3>
                        <p className="text-sm text-amber-600/80">
                          {folderTasks.length} tasques necessiten una data programada
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {folderTasks.map((task) => (
                      <div key={task.id} className="group relative">
                        {selectionMode && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => handleSelectTask(task.id)}
                              className="h-4 w-4 rounded border-border/60 bg-background/80 text-primary focus:ring-primary/50"
                            />
                          </div>
                        )}
                        <div className={selectionMode ? "ml-8" : ""}>
                          <TaskChecklistItem
                            task={task}
                            onStatusChange={handleStatusChange}
                            onEdit={handleEditTask}
                            onDelete={deleteTask}
                            completingTasks={completingTasks}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewMode === "list" && (
                <div className="space-y-2">
                  {folderTasks.map((task) => (
                    <div key={task.id} className="group relative">
                      {selectionMode && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => handleSelectTask(task.id)}
                            className="h-4 w-4 rounded border-border/60 bg-background/80 text-primary focus:ring-primary/50"
                          />
                        </div>
                      )}
                      <div className={selectionMode ? "ml-8" : ""}>
                        <TaskChecklistItem
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                          onEdit={handleEditTask}
                          onDelete={deleteTask}
                          viewMode={viewMode}
                          completingTasks={completingTasks}
                        />
                      </div>
                    </div>
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
                          <div key={task.id} className="flex items-start gap-2">
                            {selectionMode && (
                              <input
                                type="checkbox"
                                checked={selectedTasks.includes(task.id)}
                                onChange={() => handleSelectTask(task.id)}
                                className="rounded border-border mt-2"
                              />
                            )}
                            <div className="flex-1">
                              <TaskChecklistItem
                                key={task.id}
                                task={task}
                                onStatusChange={handleStatusChange}
                                onEdit={handleEditTask}
                                onDelete={deleteTask}
                                viewMode={viewMode}
                                completingTasks={completingTasks}
                              />
                            </div>
                          </div>
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

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="carpetes"
        onTabChange={handleTabChange}
        onCreateTask={handleCreateTaskFromNav}
      />

      {/* Create Task Modal */}
      {showCreateTask && (
        <LazyModal>
          <CreateTaskModalLazy
            open={showCreateTask}
            onClose={() => {
              setShowCreateTask(false);
              setEditingTask(null);
              setShowCreateTaskFromNav(false);
            }}
            onSubmit={handleTaskSubmit}
            editingTask={editingTask}
            folders={folders}
          />
        </LazyModal>
      )}
    </div>
  );
};

export default FolderDetailPage;