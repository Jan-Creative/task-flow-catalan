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

const TaskChecklistItem = ({ task, onStatusChange, onEdit, onDelete, viewMode = "list", completingTasks }: TaskChecklistItemProps) => {
  const { getPriorityLabel, getPriorityColor: getDynamicPriorityColor, getStatusLabel, getStatusColor: getDynamicStatusColor } = usePropertyLabels();

  const getPriorityColor = (priority: Task['priority']) => {
    const color = getDynamicPriorityColor(priority);
    return `text-[${color}]`;
  };

  const getStatusColor = (status: Task['status']) => {
    const color = getDynamicStatusColor(status);
    return `bg-[${color}]/10 text-[${color}] border-[${color}]/20`;
  };


  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onStatusChange(task.id, 'completat');
    } else {
      onStatusChange(task.id, 'pendent');
    }
  };

  const handleStartTask = () => {
    onStatusChange(task.id, 'en_proces');
  };

  const isCompleted = task.status === 'completat';
  const isInProgress = task.status === 'en_proces';
  const isCompleting = completingTasks?.has(task.id) || false;

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
            "h-5 w-5 rounded-full data-[state=checked]:bg-success data-[state=checked]:border-success",
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
          <Flag className={cn("h-3 w-3 flex-shrink-0", getPriorityColor(task.priority))} />
          
          {/* In Progress Badge */}
          {isInProgress && (
            <Badge variant="outline" className={cn("text-xs px-1.5 py-0", getStatusColor(task.status))}>
              {getStatusLabel(task.status)}
            </Badge>
          )}
        </div>

        {/* Secondary info */}
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span>{getPriorityLabel(task.priority)}</span>
          
          {task.due_date && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.due_date).toLocaleDateString('ca-ES')}</span>
              </div>
            </>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isCompleted && !isCompleting && task.status === 'pendent' && (
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
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:text-destructive"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TaskChecklistItem;