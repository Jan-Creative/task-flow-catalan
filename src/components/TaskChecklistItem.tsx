import React, { memo, useCallback, useMemo } from "react";
import { Flag, Calendar, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pendent" | "en_proces" | "completat";
  priority: "alta" | "mitjana" | "baixa";
  due_date?: string;
  folder_id?: string;
}

interface TaskChecklistItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  viewMode?: "list" | "kanban";
  completingTasks?: Set<string>;
}

const TaskChecklistItem = memo(({ 
  task, 
  onStatusChange, 
  onEdit, 
  onDelete, 
  viewMode = "list", 
  completingTasks 
}: TaskChecklistItemProps) => {
  const { getPriorityLabel, getPriorityColor: getDynamicPriorityColor, getStatusLabel, getStatusColor: getDynamicStatusColor } = usePropertyLabels();

  // Memoized color calculations
  const priorityColor = useMemo(() => {
    const color = getDynamicPriorityColor(task.priority);
    return `text-[${color}]`;
  }, [task.priority, getDynamicPriorityColor]);

  const statusColor = useMemo(() => {
    const color = getDynamicStatusColor(task.status);
    return `bg-[${color}]/10 text-[${color}] border-[${color}]/20`;
  }, [task.status, getDynamicStatusColor]);

  // Memoized handlers
  const handleCheckboxChange = useCallback((checked: boolean) => {
    if (checked) {
      onStatusChange(task.id, 'completat');
    } else {
      onStatusChange(task.id, 'pendent');
    }
  }, [task.id, onStatusChange]);

  const handleStartTask = useCallback(() => {
    onStatusChange(task.id, 'en_proces');
  }, [task.id, onStatusChange]);

  const handleEdit = useCallback(() => {
    onEdit(task);
  }, [task, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  // Memoized computed values
  const computedValues = useMemo(() => ({
    isCompleted: task.status === 'completat',
    isInProgress: task.status === 'en_proces',
    isCompleting: completingTasks?.has(task.id) || false,
    showStartButton: task.status === 'pendent',
    formattedDate: task.due_date ? new Date(task.due_date).toLocaleDateString('ca-ES') : null
  }), [task.status, task.id, task.due_date, completingTasks]);

  const { isCompleted, isInProgress, isCompleting, showStartButton, formattedDate } = computedValues;

  return (
    <div className={cn(
      "group flex items-center gap-3 py-2 px-1 hover:bg-accent/30 rounded-lg transition-colors",
      viewMode === "kanban" && "py-3 px-3",
      isCompleting && "task-completing"
    )}>
      {/* Circular Checkbox */}
      <div className="flex-shrink-0">
        <Checkbox
          checked={isCompleted || isCompleting}
          onCheckedChange={handleCheckboxChange}
          className={cn(
            "h-5 w-5 rounded-full data-[state=checked]:bg-success data-[state=checked]:border-success checkbox-hover",
            isCompleting && "checkbox-completing"
          )}
        />
      </div>

      {/* Task Content - Clickable */}
      <Link to={`/task/${task.id}`} className="flex-1 min-w-0 block">
        <div className="flex items-center gap-2 mb-1">
          <h3 
            className={cn(
              "font-medium text-sm leading-tight truncate transition-colors text-white hover:text-white/80",
              (isCompleted || isCompleting) && "line-through text-white/60"
            )}
          >
            {task.title}
          </h3>
          
          {/* Priority Flag */}
          <Flag className={cn("h-3 w-3 flex-shrink-0", priorityColor)} />
          
          {/* In Progress Badge */}
          {isInProgress && (
            <Badge variant="outline" className={cn("text-xs px-1.5 py-0", statusColor)}>
              {getStatusLabel(task.status)}
            </Badge>
          )}
        </div>

        {/* Secondary info */}
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span>{getPriorityLabel(task.priority)}</span>
          
          {formattedDate && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
            </>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {showStartButton && !isCompleted && !isCompleting && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartTask}
            className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
          >
            {getStatusLabel('en_proces')}
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

TaskChecklistItem.displayName = "TaskChecklistItem";

export default TaskChecklistItem;