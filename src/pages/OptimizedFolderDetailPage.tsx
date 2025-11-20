/**
 * Optimized Folder Detail Page
 * Refactored for performance and maintainability
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasksCore } from "@/hooks/tasks/useTasksCore";
import { useDadesApp } from "@/hooks/useDadesApp";
import { useUnifiedProperties } from "@/hooks/useUnifiedProperties";
import { useStableCallback } from "@/hooks/performance";
import { logger } from "@/lib/debugUtils";
import type { Task } from "@/types";

// Components
import { CreateTaskModalLazy, LazyModal } from '@/lib/lazyLoading';
import BottomNavigation from "@/components/BottomNavigation";
import { UnifiedFolderToolbar } from "@/components/folders/UnifiedFolderToolbar";
import { FolderHeader } from "@/components/FolderDetail/FolderHeader";
import { ListView } from "@/components/FolderDetail/ListView";
import { KanbanView } from "@/components/FolderDetail/KanbanView";
import { OrganizeView } from "@/components/FolderDetail/OrganizeView";

// Custom hook for folder task operations
const useFolderTasks = (folderId: string) => {
  const { 
    tasks, 
    folders, 
    loading, 
    actualitzarEstat: updateTaskStatus,
    crearTasca: handleCreateTask,
  } = useTasksCore();
  
  const { updateFolder } = useDadesApp();

  // Memoized folder lookup
  const realInboxFolder = useMemo(() => 
    folders.find(f => f.is_system && f.name === 'Bustia'), 
    [folders]
  );

  const currentFolder = useMemo(() => 
    folderId === 'inbox' 
      ? realInboxFolder 
      : folders.find(f => f.id === folderId),
    [folderId, realInboxFolder, folders]
  );

  // Memoized base tasks calculation
  const baseFolderTasks = useMemo(() => {
    if (loading || tasks.length === 0) return [];

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
  }, [tasks, folderId, realInboxFolder, loading]);

  // Memoized unscheduled tasks
  const unscheduledTasks = useMemo(() => 
    baseFolderTasks.filter(task => 
      !task.due_date && task.status !== 'completat'
    ), 
    [baseFolderTasks]
  );

  return {
    currentFolder,
    realInboxFolder,
    baseFolderTasks,
    unscheduledTasks,
    updateFolder,
    updateTaskStatus,
    loading,
    folders
  };
};

const OptimizedFolderDetailPage = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { handleCreateTask, handleEditTask: handleEditTaskOp } = useTaskOperations();
  
  // State management
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "organize">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Custom hook for folder operations
  const {
    currentFolder,
    realInboxFolder,
    baseFolderTasks,
    unscheduledTasks,
    updateFolder,
    updateTaskStatus,
    loading,
    folders
  } = useFolderTasks(folderId || '');

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  // Optimized task filtering with memoization
  const folderTasks = useMemo(() => {
    if (loading || baseFolderTasks.length === 0) return [];

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
      if (completingTasks.has(task.id)) return true;
      
      if (viewMode === 'list') {
        // In list mode: hide completed tasks completely (unless completing)
        if (task.status === 'completat') return false;
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
  }, [
    loading,
    baseFolderTasks,
    unscheduledTasks,
    viewMode,
    filterStatus,
    filterPriority,
    sortBy,
    sortOrder,
    completingTasks,
    recentlyCompleted
  ]);

  // Optimized status change handler
  const handleStatusChange = useStableCallback(async (taskId: string, status: any) => {
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
  });

  // Task operations
  const handleEditTask = useStableCallback((task: Task) => {
    setEditingTask(task);
    setShowCreateTask(true);
  });

  const handleTaskSubmit = useStableCallback(async (taskData: any, customProperties?: Array<{propertyId: string; optionId: string}>) => {
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
  });

  // Navigation handlers
  const handleTabChange = useStableCallback((tab: string) => {
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
  });

  // Task selection handlers
  const handleSelectTask = useStableCallback((taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  });

  const handleSelectAll = useStableCallback(() => {
    if (selectedTasks.length === folderTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(folderTasks.map(task => task.id));
    }
  });

  const handleClearSelection = useStableCallback(() => {
    setSelectedTasks([]);
    setSelectionMode(false);
  });

  // Check if current folder is inbox
  const isInboxFolder = folderId === 'inbox' || 
    (currentFolder && currentFolder.is_system && currentFolder.name === 'Bustia');

  // Loading state
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

  // Folder not found
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

  // Render task content based on view mode
  const renderTaskContent = () => {
    if (folderTasks.length === 0) {
      return (
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
      );
    }

    switch (viewMode) {
      case "organize":
        return (
          <OrganizeView
            tasks={folderTasks}
            selectedTasks={selectedTasks}
            selectionMode={selectionMode}
            completingTasks={completingTasks}
            onSelectTask={handleSelectTask}
            onEditTask={handleEditTask}
            onStatusChange={handleStatusChange}
          />
        );
      case "kanban":
        return (
          <KanbanView
            tasks={folderTasks}
            selectedTasks={selectedTasks}
            selectionMode={selectionMode}
            completingTasks={completingTasks}
            recentlyCompleted={recentlyCompleted}
            onSelectTask={handleSelectTask}
            onEditTask={handleEditTask}
            onStatusChange={handleStatusChange}
          />
        );
      default:
        return (
          <ListView
            tasks={folderTasks}
            selectedTasks={selectedTasks}
            selectionMode={selectionMode}
            completingTasks={completingTasks}
            onSelectTask={handleSelectTask}
            onEditTask={handleEditTask}
            onStatusChange={handleStatusChange}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <FolderHeader
          folder={currentFolder}
          taskCount={folderTasks.length}
          onBack={() => navigate('/?tab=carpetes')}
          onCreate={() => setShowCreateTask(true)}
          onUpdate={async (updates) => {
            logger.debug('FolderDetail', 'onUpdate called', { 
              folderId: currentFolder.id, 
              isSystem: currentFolder.is_system,
              updates 
            });
            await updateFolder(currentFolder.id, updates);
          }}
        />

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
          {renderTaskContent()}
        </div>
      </div>

      {/* Modals */}
      {showCreateTask && (
        <LazyModal>
          <CreateTaskModalLazy
            open={showCreateTask}
            onClose={() => {
              setShowCreateTask(false);
              setEditingTask(null);
            }}
            onSubmit={handleTaskSubmit}
            editingTask={editingTask}
            folders={folders}
          />
        </LazyModal>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="carpetes" 
        onTabChange={handleTabChange}
        onCreateTask={() => setShowCreateTask(true)}
      />
    </div>
  );
};

export default OptimizedFolderDetailPage;
