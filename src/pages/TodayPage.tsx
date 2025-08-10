import { useState } from "react";
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

  // Filter today's tasks - hide completed tasks by default
  const todayTasks = tasks.filter(task => {
    // Hide completed tasks unless specifically selected
    if (task.status === 'completat' && filterStatus !== 'completat') {
      return false;
    }
    
    let matchesStatus = filterStatus === "all" || task.status === filterStatus;
    let matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const getStatusTasks = (status: string) => {
    return todayTasks.filter(task => task.status === status);
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
            <div className="bg-card/60 backdrop-blur-glass border border-border/50 rounded-2xl p-4 space-y-1">
              {todayTasks.map((task, index) => (
                <div key={task.id}>
                  <TaskChecklistItem
                    task={task}
                    onStatusChange={updateTaskStatus}
                    onEdit={onEditTask}
                    onDelete={deleteTask}
                  />
                  {index < todayTasks.length - 1 && (
                    <div className="border-b border-border/30 mx-4" />
                  )}
                </div>
              ))}
            </div>
          )}

          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
              {statusColumns.map((column) => (
                <Card key={column.id} className="bg-card/60 backdrop-blur-glass border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>{column.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {column.tasks.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 p-3">
                    {column.tasks.map((task, index) => (
                      <div key={task.id}>
                        <TaskChecklistItem
                          task={task}
                          onStatusChange={updateTaskStatus}
                          onEdit={onEditTask}
                          onDelete={deleteTask}
                        />
                        {index < column.tasks.length - 1 && (
                          <div className="border-b border-border/30 mx-2 my-1" />
                        )}
                      </div>
                    ))}
                    {column.tasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Cap tasca en aquest estat
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TodayPage;