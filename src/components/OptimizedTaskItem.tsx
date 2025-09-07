import { memo, useCallback, useMemo } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Clock, Edit, MoreVertical, Trash2, Calendar } from "lucide-react";
import type { Tasca } from '@/types';
import { useOptimizedPropertyLabels } from '@/hooks/useOptimizedPropertyLabels';
import { getIconByName } from '@/lib/iconLibrary';
import { SmoothPriorityBadge } from '@/components/ui/smooth-priority-badge';
import { SwipeableItem } from '@/components/SwipeableItem';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { TaskProgress } from '@/hooks/useTasksSubtasksProgress';

interface OptimizedTaskItemProps {
  task: Tasca;
  onEdit?: (task: Tasca) => void;
  onStatusChange?: (taskId: string, status: Tasca['status']) => void;
  onDelete?: (taskId: string) => void;
  viewMode?: string;
  completingTasks?: Set<string>;
  taskProgress?: TaskProgress | null;
}

const OptimizedTaskItem = memo<OptimizedTaskItemProps>(({ 
  task, 
  onEdit, 
  onStatusChange, 
  onDelete,
  viewMode = "list",
  completingTasks = new Set(),
  taskProgress
}) => {
  const { 
    getStatusLabel, 
    getPriorityLabel, 
    getStatusColor: getDynamicStatusColor, 
    getPriorityColor: getDynamicPriorityColor,
    getStatusIcon,
    getPriorityIcon
  } = useOptimizedPropertyLabels();
  const handleStatusChange = useCallback((checked: boolean) => {
    const newStatus = checked ? 'completat' : 'pendent';
    onStatusChange?.(task.id, newStatus);
  }, [task.id, onStatusChange]);

  const handleEdit = useCallback(() => {
    onEdit?.(task);
  }, [task, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete?.(task.id);
  }, [task.id, onDelete]);

  const handleSwipeStatusChange = useCallback((status: Tasca['status']) => {
    onStatusChange?.(task.id, status);
  }, [task.id, onStatusChange]);

  const isCompleted = useMemo(() => task.status === 'completat', [task.status]);
  const isCompleting = useMemo(() => completingTasks.has(task.id), [completingTasks, task.id]);
  const isOverdue = useMemo(() => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && !isCompleted;
  }, [task.due_date, isCompleted]);

  const priorityColor = useMemo(() => {
    const color = getDynamicPriorityColor(task.priority);
    return { color: color };
  }, [task.priority, getDynamicPriorityColor]);

  const statusColor = useMemo(() => {
    const color = getDynamicStatusColor(task.status);
    return { backgroundColor: `${color}10`, color: color, borderColor: `${color}20` };
  }, [task.status, getDynamicStatusColor]);

  const formattedDueDate = useMemo(() => {
    if (!task.due_date) return null;
    return new Date(task.due_date).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short'
    });
  }, [task.due_date]);

  return (
    <SwipeableItem
      task={task}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onStatusChange={handleSwipeStatusChange}
      disabled={isCompleting}
    >
      <Card className={cn(
        "p-4 transition-all duration-200 hover:shadow-md",
        isCompleted && "opacity-75",
        isOverdue && "border-destructive/50",
        viewMode === 'kanban' && "p-3"
      )}>
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleStatusChange}
            disabled={isCompleting}
            className="mt-1"
            aria-label={`Marcar tasca "${task.title}" com a ${isCompleted ? 'pendent' : 'completada'}`}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn(
                    "font-medium text-sm line-clamp-2",
                    isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {task.title}
                  </h3>
                  
                  {/* Priority Badge */}
                  <SmoothPriorityBadge priority={task.priority} size="sm" />
                </div>
                
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {task.description}
                  </p>
                )}

                {/* Progress Bar for tasks with subtasks */}
                {taskProgress && taskProgress.totalSubtasks > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {taskProgress.completedSubtasks} de {taskProgress.totalSubtasks} subtasques
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {taskProgress.progressPercentage}%
                      </span>
                    </div>
                    <Progress 
                      value={taskProgress.progressPercentage} 
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Obrir menú d'accions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Badges and metadata */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs flex items-center gap-1" style={statusColor}>
                {(() => {
                  const statusIconName = getStatusIcon(task.status);
                  if (statusIconName) {
                    const iconDef = getIconByName(statusIconName);
                    if (iconDef) {
                      const StatusIconComponent = iconDef.icon;
                      return <StatusIconComponent className="h-2.5 w-2.5" />;
                    }
                  }
                  return null;
                })()}
                {getStatusLabel(task.status)}
              </Badge>

              {formattedDueDate && (
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                )}>
                  <Calendar className="h-3 w-3" />
                  <span>{formattedDueDate}</span>
                  {isOverdue && <span className="font-medium">(vencida)</span>}
                </div>
              )}

              {viewMode !== 'kanban' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(task.created_at).toLocaleDateString('ca-ES')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </SwipeableItem>
  );
});

OptimizedTaskItem.displayName = 'OptimizedTaskItem';

export default OptimizedTaskItem;