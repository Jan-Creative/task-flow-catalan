import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TaskChecklistItem from "@/components/TaskChecklistItem";
import { useTasks } from "@/hooks/useTasks";
import { List, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodayPageProps {
  onEditTask: (task: any) => void;
}

const TodayPage = ({ onEditTask }: TodayPageProps) => {
  const { tasks, updateTaskStatus, deleteTask, loading } = useTasks();
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());
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

    if (status === 'completat') {
      if (viewMode === 'list') {
        // In list mode: task disappears immediately when completed
        await updateTaskStatus(taskId, status);
        // No need to keep track of recently completed in list mode
      } else {
        // In kanban mode: add to recently completed to keep visible and move to completed column
        setRecentlyCompleted(prev => new Set(prev).add(taskId));
        await updateTaskStatus(taskId, status);
        
        // Keep in completed column permanently (no timeout)
        // The task will stay in the completed column
      }
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
    if (viewMode === 'list') {
      // In list mode: hide completed tasks completely
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

  // Function to get column background class based on status
  const getColumnBackgroundClass = (columnId: string) => {
    switch (columnId) {
      case "pendent":
        return "bg-status-pending-column";
      case "en_proces":
        return "bg-status-progress-column";
      case "completat":
        return "bg-status-completed-column";
      default:
        return "bg-card/40";
    }
  };

  const statusColumns = [
    { id: "pendent", label: "Pendent", tasks: getStatusTasks("pendent") },
    { id: "en_proces", label: "En procés", tasks: getStatusTasks("en_proces") },
    { id: "completat", label: "Completat", tasks: getStatusTasks("completat") },
  ];

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
          <Card className="bg-card/60 backdrop-blur-glass border-border/50">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-warning">{getStatusTasks("pendent").length}</div>
              <div className="text-xs text-muted-foreground">Pendents</div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-glass border-border/50">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{getStatusTasks("en_proces").length}</div>
              <div className="text-xs text-muted-foreground">En procés</div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-glass border-border/50">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-success">{getStatusTasks("completat").length}</div>
              <div className="text-xs text-muted-foreground">Completades</div>
            </CardContent>
          </Card>
        </div>

        {/* View controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="bg-card/60 backdrop-blur-glass"
            >
              <List className="h-4 w-4 mr-1" />
              Llista
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="bg-card/60 backdrop-blur-glass"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Tauler
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm bg-card/60 backdrop-blur-glass border border-border/50 rounded-2xl px-3 py-1.5 w-full sm:w-auto min-w-0"
            >
              <option value="all">Tots els estats</option>
              <option value="pendent">Pendent</option>
              <option value="en_proces">En procés</option>
              <option value="completat">Completat</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-sm bg-card/60 backdrop-blur-glass border border-border/50 rounded-2xl px-3 py-1.5 w-full sm:w-auto min-w-0"
            >
              <option value="all">Totes les prioritats</option>
              <option value="alta">Alta</option>
              <option value="mitjana">Mitjana</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>
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
                />
              ))}
            </div>
          )}

          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
              {statusColumns.map((column) => (
                <div key={column.id} className={`${getColumnBackgroundClass(column.id)} backdrop-blur-glass rounded-2xl p-4`}>
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