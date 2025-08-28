import { useState } from "react";
import { Clock, AlertCircle, Circle, ArrowUp, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [tasks, setTasks] = useState<TaskWithTime[]>([
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
  ]);

  // Colors específics per prioritats
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'hsl(var(--destructive))';
      case 'medium':
        return 'hsl(var(--warning))';
      case 'low':
        return 'hsl(var(--muted-foreground))';
    }
  };

  // Icones específiques per prioritats
  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return ArrowUp;
      case 'medium':
        return Minus;
      case 'low':
        return Circle;
    }
  };

  // Funció per canviar l'estat de completat
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

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

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <Card className="flex flex-col h-[320px] bg-card shadow-[var(--shadow-card)] overflow-hidden">
      <CardHeader className="pb-3 px-6">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Checklist Tasques
          <Badge variant="secondary" className="ml-auto text-xs">
            {pendingTasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 px-6 pb-6">
            
            {/* Tasques pendents */}
            {pendingTasks.length > 0 && (
              <div className="space-y-2">
                {pendingTasks.map((task) => {
                  const PriorityIcon = getPriorityIcon(task.priority);
                  const priorityColor = getPriorityColor(task.priority);
                  
                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent-hover transition-colors group shadow-sm hover:shadow-[var(--shadow-organic)]"
                    >
                      {/* Checkbox per marcar com a completada */}
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                        className="mt-0.5 flex-shrink-0 hover:shadow-[var(--glow-accent)]"
                      />
                      
                      {/* Contingut de la tasca (clickable per navegació) */}
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {task.title}
                          </h4>
                          
                          {/* Badge de prioritat amb color específic */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <PriorityIcon 
                              className="h-3 w-3" 
                              style={{ color: priorityColor }}
                            />
                            <Badge 
                              variant="outline" 
                              className="text-xs py-0 border-0"
                              style={{ 
                                color: priorityColor,
                                backgroundColor: `${priorityColor}15`
                              }}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(task.scheduledDate)} • {task.scheduledTime}
                          </span>
                          <div 
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: task.categoryColor }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent-hover transition-colors group opacity-60"
                  >
                    {/* Checkbox marcat */}
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    
                    {/* Contingut de la tasca completada */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs text-muted-foreground line-through line-clamp-2">
                          {task.title}
                        </h4>
                      </div>
                      
                      <span className="text-xs text-muted-foreground">
                        {formatDate(task.scheduledDate)} • {task.scheduledTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Missatge buit */}
            {tasks.length === 0 && (
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