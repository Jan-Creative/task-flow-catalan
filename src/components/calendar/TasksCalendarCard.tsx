import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmoothPriorityBadge } from "@/components/ui/smooth-priority-badge";
import { CheckCircle2, Clock, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface TaskWithTime {
  id: string;
  title: string;
  priority: string;
  completed: boolean;
  scheduledDate: Date;
  scheduledTime?: string;
  category: string;
  categoryColor: string;
}

const TasksCalendarCard = () => {
  const navigate = useNavigate();
  
  // Mock tasks with scheduled times
  const tasksWithTime: TaskWithTime[] = [
    {
      id: "1",
      title: "Reunió amb client",
      priority: "alta",
      completed: false,
      scheduledDate: new Date(),
      scheduledTime: "10:30",
      category: "Feina",
      categoryColor: "#f59e0b"
    },
    {
      id: "2",
      title: "Revisió disseny web",
      priority: "mitjana",
      completed: false,
      scheduledDate: new Date(),
      scheduledTime: "14:00",
      category: "Disseny",
      categoryColor: "#8b5cf6"
    },
    {
      id: "3",
      title: "Comprar menjar gat",
      priority: "baixa",
      completed: true,
      scheduledDate: new Date(Date.now() + 86400000), // tomorrow
      scheduledTime: "18:00",
      category: "Casa",
      categoryColor: "#3b82f6"
    },
    {
      id: "4",
      title: "Preparar presentació",
      priority: "alta",
      completed: false,
      scheduledDate: new Date(Date.now() + 86400000), // tomorrow
      scheduledTime: "09:00",
      category: "Feina",
      categoryColor: "#f59e0b"
    }
  ];

  const handleTaskClick = (taskId: string) => {
    navigate(`/task/${taskId}`);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Avui";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Demà";
    } else {
      return date.toLocaleDateString('ca-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  };

  const upcomingTasks = tasksWithTime.filter(task => !task.completed);
  const completedCount = tasksWithTime.filter(task => task.completed).length;

  return (
    <Card className="h-full bg-background/40 backdrop-blur-md border-border/20 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Tasques Programades</CardTitle>
            <CardDescription>
              {upcomingTasks.length} pendents · {completedCount} completades
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 overflow-y-auto">
        {tasksWithTime.map((task, index) => (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 animate-fade-in",
              "border border-transparent hover:border-border/30 hover:scale-[1.02]",
              task.completed
                ? "bg-background/10 opacity-60"
                : "bg-background/20 hover:bg-background/30"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Completion status */}
            <div className="flex-shrink-0">
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
              )}
            </div>

            {/* Task content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  "text-sm font-medium truncate",
                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {task.title}
                </h4>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(task.scheduledDate)}</span>
                </div>
                {task.scheduledTime && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{task.scheduledTime}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Task metadata */}
            <div className="flex flex-col items-end gap-1">
              <SmoothPriorityBadge priority={task.priority} size="sm" />
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: `${task.categoryColor}15`,
                  color: task.categoryColor,
                  borderColor: `${task.categoryColor}30`
                }}
              >
                {task.category}
              </Badge>
            </div>
          </div>
        ))}

        {tasksWithTime.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hi ha tasques programades</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksCalendarCard;