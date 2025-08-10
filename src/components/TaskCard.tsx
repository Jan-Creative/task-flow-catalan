import { Calendar, Clock, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pendent" | "en_proces" | "completat";
  priority: "alta" | "mitjana" | "baixa";
  due_date?: string;
  folder_id?: string;
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard = ({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) => {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pendent': return 'bg-warning/20 text-warning-foreground border-warning/30';
      case 'en_proces': return 'bg-primary/20 text-primary-foreground border-primary/30';
      case 'completat': return 'bg-success/20 text-success-foreground border-success/30';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta': return 'text-destructive';
      case 'mitjana': return 'text-warning';
      case 'baixa': return 'text-success';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'pendent': return 'Pendent';
      case 'en_proces': return 'En procés';
      case 'completat': return 'Completat';
    }
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta': return 'Alta';
      case 'mitjana': return 'Mitjana';
      case 'baixa': return 'Baixa';
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-glass border-border/50 shadow-glass hover:shadow-elevated transition-smooth">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 
            className={cn(
              "font-semibold text-foreground leading-tight",
              task.status === 'completat' && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>
          <div className="flex items-center gap-1">
            <Flag className={cn("h-4 w-4", getPriorityColor(task.priority))} />
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs", getStatusColor(task.status))}
            >
              {getStatusLabel(task.status)}
            </Badge>
            
            <span className={cn("text-xs font-medium", getPriorityColor(task.priority))}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>

          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.due_date).toLocaleDateString('ca-ES')}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          {task.status !== 'completat' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(task.id, task.status === 'pendent' ? 'en_proces' : 'completat')}
              className="text-xs bg-accent/50 border-accent"
            >
              {task.status === 'pendent' ? 'Iniciar' : 'Completar'}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="text-xs hover:bg-accent/50"
          >
            Editar
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;