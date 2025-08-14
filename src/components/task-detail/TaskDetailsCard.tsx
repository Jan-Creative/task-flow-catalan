import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { memo } from "react";
import { useTaskContext } from "@/contexts/TaskContext";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  folder_id?: string;
}

interface TaskDetailsCardProps {
  // Props are now optional since we get data from context
  task?: any;
  folderName?: string;
}

export const TaskDetailsCard = memo(({ task: propTask, folderName: propFolderName }: TaskDetailsCardProps = {}) => {
  // Use context data as priority, fallback to props for backwards compatibility
  const contextData = useTaskContext();
  const task = propTask || contextData?.task;
  const folderName = propFolderName || contextData?.folder?.name;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'en_progres': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'pendent': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'mitjana': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'baixa': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="animate-fade-in h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" />
          Detalls
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between p-4 pt-0">
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-semibold mb-1 leading-tight">{task.title}</h3>
            {task.description && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{task.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge className={`${getStatusColor(task.status)} text-xs`}>
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
              {task.priority}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 text-xs mt-4">
          {folderName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderOpen className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{folderName}</span>
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>Venciment: {format(new Date(task.due_date), 'dd MMM', { locale: ca })}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>Creada: {format(new Date(task.created_at), 'dd MMM', { locale: ca })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});