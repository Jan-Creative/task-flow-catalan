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

interface OptimizedTaskItemProps {
  task: Tasca;
  onEdit?: (task: Tasca) => void;
  onStatusChange?: (taskId: string, status: Tasca['status']) => void;
  onDelete?: (taskId: string) => void;
  viewMode?: string;
  completingTasks?: Set<string>;
}

const OptimizedTaskItem = memo<OptimizedTaskItemProps>(({ 
  task, 
  onEdit, 
  onStatusChange, 
  onDelete,
  viewMode = "list",
  completingTasks = new Set()
}) => {
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

  const isCompleted = useMemo(() => task.status === 'completat', [task.status]);
  const isCompleting = useMemo(() => completingTasks.has(task.id), [completingTasks, task.id]);
  const isOverdue = useMemo(() => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && !isCompleted;
  }, [task.due_date, isCompleted]);

  const priorityColor = useMemo(() => {
    switch (task.priority) {
      case 'alta': return 'bg-destructive text-destructive-foreground';
      case 'mitjana': return 'bg-warning text-warning-foreground';
      case 'baixa': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  }, [task.priority]);

  const statusColor = useMemo(() => {
    switch (task.status) {
      case 'completat': return 'bg-success text-success-foreground';
      case 'en_proces': return 'bg-primary text-primary-foreground';
      case 'pendent': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  }, [task.status]);

  const formattedDueDate = useMemo(() => {
    if (!task.due_date) return null;
    return new Date(task.due_date).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short'
    });
  }, [task.due_date]);

  return (
    <Card className={`p-4 transition-all duration-200 hover:shadow-md ${
      isCompleted ? 'opacity-75' : ''
    } ${isOverdue ? 'border-destructive/50' : ''} ${
      viewMode === 'kanban' ? 'p-3' : ''
    }`}>
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
              <h3 className={`font-medium ${viewMode === 'kanban' ? 'text-sm' : 'text-sm'} mb-1 line-clamp-2 ${
                isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {task.description}
                </p>
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
            <Badge variant="secondary" className={`text-xs ${statusColor}`}>
              {task.status.replace('_', ' ')}
            </Badge>
            
            <Badge variant="outline" className={`text-xs ${priorityColor}`}>
              {task.priority}
            </Badge>

            {formattedDueDate && (
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-destructive' : 'text-muted-foreground'
              }`}>
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
  );
});

OptimizedTaskItem.displayName = 'OptimizedTaskItem';

export default OptimizedTaskItem;