import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TaskWithTime {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  scheduledDate: Date;
  scheduledTime: string;
  category: string;
  categoryColor: string;
}

const TasksSidebar = () => {
  const navigate = useNavigate();

  const tasksWithTime: TaskWithTime[] = [
    {
      id: '1',
      title: 'Reunió amb l\'equip de disseny',
      priority: 'high',
      completed: false,
      scheduledDate: new Date(),
      scheduledTime: '09:00',
      category: 'Feina',
      categoryColor: 'hsl(var(--destructive))'
    },
    {
      id: '2',
      title: 'Revisar propostes de projecte',
      priority: 'medium', 
      completed: false,
      scheduledDate: new Date(),
      scheduledTime: '11:30',
      category: 'Feina',
      categoryColor: 'hsl(var(--destructive))'
    },
    {
      id: '3',
      title: 'Comprar regal anniversari',
      priority: 'high',
      completed: true,
      scheduledDate: new Date(),
      scheduledTime: '14:00',
      category: 'Personal',
      categoryColor: 'hsl(var(--primary))'
    },
    {
      id: '4',
      title: 'Trucar al metge',
      priority: 'medium',
      completed: false,
      scheduledDate: new Date(Date.now() + 86400000), // demà
      scheduledTime: '10:00',
      category: 'Personal',
      categoryColor: 'hsl(var(--primary))'
    },
    {
      id: '5',
      title: 'Preparar presentació client',
      priority: 'high',
      completed: false,
      scheduledDate: new Date(Date.now() + 86400000), // demà
      scheduledTime: '15:30',
      category: 'Feina',
      categoryColor: 'hsl(var(--destructive))'
    }
  ];

  const handleTaskClick = (taskId: string) => {
    navigate(`/task/${taskId}`);
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Avui';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demà';
    } else {
      return date.toLocaleDateString('ca-ES', { month: 'short', day: 'numeric' });
    }
  };

  const pendingTasks = tasksWithTime.filter(task => !task.completed);
  const completedTasks = tasksWithTime.filter(task => task.completed);

  return (
    <Card className="flex flex-col min-h-[180px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Tasques Programades
          <Badge variant="secondary" className="ml-auto text-xs">
            {pendingTasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-3">
            
            {/* Tasques pendents */}
            {pendingTasks.length > 0 && (
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div 
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: task.categoryColor }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>
                        {task.priority === 'high' && (
                          <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(task.scheduledDate)} • {task.scheduledTime}
                        </span>
                        <Badge variant="outline" className="text-xs py-0">
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tasques completades */}
            {completedTasks.length > 0 && (
              <div className="space-y-2">
                {pendingTasks.length > 0 && (
                  <div className="border-t border-border pt-2">
                    <span className="text-xs text-muted-foreground font-medium">Completades</span>
                  </div>
                )}
                
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group opacity-60"
                  >
                    <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs text-muted-foreground line-through line-clamp-2">
                          {task.title}
                        </h4>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(task.scheduledDate)} • {task.scheduledTime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Missatge buit */}
            {tasksWithTime.length === 0 && (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hi ha tasques programades
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TasksSidebar;