import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TaskChecklistItem from "@/components/TaskChecklistItem";
import DatabaseToolbar from "@/components/DatabaseToolbar";
import { useTasks } from "@/hooks/useTasks";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";
import { SlidersHorizontal } from "lucide-react";

interface TodayPageProps {
  onEditTask: (task: any) => void;
  onNavigateToSettings?: () => void;
}

const TodayPage = ({ onEditTask, onNavigateToSettings }: TodayPageProps) => {
  const { tasks, updateTaskStatus, deleteTask, loading } = useTasks();
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

  // Filter today's tasks based on view mode
  const todayTasks = tasks.filter(task => {
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
      // In kanban mode: show completed tasks in their column, keep recently completed visible
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

  const getStatusTasks = (status: string) => {
    return todayTasks.filter(task => task.status === status);
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

  if (loading) {
    return (
      <div className="p-6 pb-24">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Carregant tasques...</p>
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
                  {getStatusTasks(option.value).length}
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
      {todayTasks.length === 0 ? (
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
              {todayTasks.map((task) => (
                <TaskChecklistItem
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
                        onEdit={onEditTask}
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
  );
};

export default TodayPage;