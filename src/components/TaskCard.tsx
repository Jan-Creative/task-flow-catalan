import type { Task } from "@/types";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useOptimizedPropertyLabels } from "@/hooks/useOptimizedPropertyLabels";
import { getIconByName } from "@/lib/iconLibrary";
import { SmoothPriorityBadge } from "@/components/ui/smooth-priority-badge";


interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard = ({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) => {
  const { 
    getStatusLabel, 
    getPriorityLabel, 
    getStatusColor: getDynamicStatusColor, 
    getPriorityColor: getDynamicPriorityColor,
    getStatusIcon,
    getPriorityIcon
  } = useOptimizedPropertyLabels();

  const getStatusColor = (status: Task['status']) => {
    const color = getDynamicStatusColor(status);
    return `bg-[${color}]/20 text-foreground border-[${color}]/30`;
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const color = getDynamicPriorityColor(priority);
    return { color: color };
  };

  return (
    <Card className="bg-card/60 backdrop-blur-glass border-border/50 shadow-glass hover:shadow-elevated transition-smooth rounded-2xl">
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
          <SmoothPriorityBadge priority={task.priority} size="sm" />
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
              className={cn("text-xs flex items-center gap-1", getStatusColor(task.status))}
            >
              {(() => {
                const statusIconName = getStatusIcon(task.status);
                if (statusIconName) {
                  const iconDef = getIconByName(statusIconName);
                  if (iconDef) {
                    const StatusIconComponent = iconDef.icon;
                    return <StatusIconComponent className="h-3 w-3" />;
                  }
                }
                return null;
              })()}
              {getStatusLabel(task.status)}
            </Badge>
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
              className="text-xs bg-accent/50 border-accent rounded-2xl"
            >
              {task.status === 'pendent' ? getStatusLabel('en_proces') : getStatusLabel('completat')}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="text-xs hover:bg-accent/50 rounded-2xl"
          >
            Editar
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="text-xs text-destructive hover:bg-destructive/10 rounded-2xl"
          >
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;