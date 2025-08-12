import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";

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
  task: Task;
  folderName?: string;
}

export const TaskDetailsCard = ({ task, folderName }: TaskDetailsCardProps) => {
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
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Detalls de la tasca
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
          {task.description && (
            <p className="text-muted-foreground">{task.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace('_', ' ')}
          </Badge>
          <Badge className={getPriorityColor(task.priority)}>
            Prioritat: {task.priority}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          {folderName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
              <span>{folderName}</span>
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Venciment: {format(new Date(task.due_date), 'dd MMM yyyy', { locale: ca })}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Creada: {format(new Date(task.created_at), 'dd MMM yyyy HH:mm', { locale: ca })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};