import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OptimizedTaskItem from "@/components/OptimizedTaskItem";
import DatabaseToolbar from "@/components/DatabaseToolbar";
import { useOptimizedData } from "@/hooks/useOptimizedData";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";
import { SlidersHorizontal, Loader2 } from "lucide-react";

interface TodayPageProps {
  onEditTask: (task: any) => void;
  onNavigateToSettings?: () => void;
}

const TodayPage = ({ onEditTask, onNavigateToSettings }: TodayPageProps) => {
  const { todayTasks, updateTaskStatus, deleteTask, loading } = useOptimizedData();
  const { getStatusLabel, getStatusOptions, getStatusColor } = usePropertyLabels();
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

  // Custom handler for status changes with different behavior per view mode
  const handleStatusChange = useCallback(async (taskId: string, status: any) => {
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
  }, [updateTaskStatus, viewMode]);

  // Optimized filtering with useMemo - FIXED LOGIC
  const filteredTasks = useMemo(() => {
    if (!todayTasks) return [];
    
    return todayTasks.filter(task => {
      // Always show tasks that are in completing state
      if (completingTasks.has(task.id)) {
        return true;
      }
      
      // List mode: hide completed tasks (except those completing)
      if (viewMode === 'list' && task.status === 'completat') {
        return false;
      }
      
      // Kanban mode: show completed tasks if they match filters or are recently completed
      if (viewMode === 'kanban' && task.status === 'completat') {
        if (recentlyCompleted.has(task.id)) {
          return true; // Always show recently completed
        }
        // Show completed tasks only if filter allows
        if (filterStatus !== 'completat' && filterStatus !== 'all') {
          return false;
        }
      }
      
      // Apply status filter
      if (filterStatus !== "all" && task.status !== filterStatus) {
        return false;
      }
      
      // Apply priority filter
      if (filterPriority !== "all" && task.priority !== filterPriority) {
        return false;
      }
      
      return true;
    });
  }, [todayTasks, completingTasks, recentlyCompleted, filterStatus, filterPriority, viewMode]);

  // Memoized status columns for kanban view
  const statusColumns = useMemo(() => {
    return getStatusOptions().map(option => option.value);
  }, [getStatusOptions]);

  // Function to get dynamic column background style based on status color
  const getColumnBackgroundStyle = useCallback((statusColor: string) => {
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
  }, []);

  // Memoized task count by status for stats
  const taskStats = useMemo(() => {
    const stats: Record<string, number> = {};
    getStatusOptions().forEach(option => {
      stats[option.value] = filteredTasks.filter(task => task.status === option.value).length;
    });
    return stats;
  }, [filteredTasks, getStatusOptions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregant tasques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full p-4 pb-24 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Avui</h1>
        
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {getStatusOptions().slice(0, 3).map((option, index) => (
            <Card key={option.value} className="bg-card/60 backdrop-blur-glass border-border/50">
              <CardContent className="p-3 text-center">
                <div className={`text-2xl font-bold ${index === 0 ? 'text-warning' : index === 1 ? 'text-primary' : 'text-success'}`}>
                  {taskStats[option.value] || 0}
                </div>
                <div className="text-xs text-muted-foreground">{option.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Database Toolbar */}
        <DatabaseToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onFilterPriorityChange={setFilterPriority}
          onNavigateToSettings={onNavigateToSettings}
        />
      </div>

      {/* Content */}
      {filteredTasks.length === 0 ? (
        <Card className="bg-card/60 backdrop-blur-glass border-border/50">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <SlidersHorizontal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hi ha tasques per avui</p>
              <p className="text-sm mt-2">Comença creant una nova tasca!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === "list" && (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <OptimizedTaskItem
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={onEditTask}
                  onDelete={deleteTask}
                  viewMode={viewMode}
                  completingTasks={completingTasks}
                />
              ))}
            </div>
          )}

          {viewMode === "kanban" && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {statusColumns.map(status => {
                const statusTasks = filteredTasks.filter(task => task.status === status);
                const statusColor = getStatusColor(status);
                
                return (
                  <div key={status} className="min-w-80 flex-shrink-0">
                    <div className="sticky top-0 z-10 mb-4">
                      <div 
                        className="px-4 py-3 rounded-lg backdrop-blur-sm border border-white/10"
                        style={getColumnBackgroundStyle(statusColor)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white">
                            {getStatusLabel(status)}
                          </h3>
                          <span className="text-sm text-white/70 bg-white/10 px-2 py-1 rounded-full">
                            {statusTasks.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {statusTasks.map((task) => (
                        <OptimizedTaskItem
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                          onEdit={onEditTask}
                          onDelete={deleteTask}
                          viewMode="kanban"
                          completingTasks={completingTasks}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TodayPage;
