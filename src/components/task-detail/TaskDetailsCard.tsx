import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { memo } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTaskProperties } from "@/hooks/useTaskProperties";
import { useProperties } from "@/hooks/useProperties";
import { PropertyBadge } from "@/components/ui/property-badge";

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
  
  // Obtenir les propietats de la tasca i del sistema
  const { data: taskProperties = [] } = useTaskProperties(task?.id);
  const { getStatusOptions, getPriorityOptions } = useProperties();

  // Obtenir opcions de sistema per Status i Priority
  const statusOptions = getStatusOptions();
  const priorityOptions = getPriorityOptions();
  
  const currentStatusOption = statusOptions.find(opt => opt.value === task?.status);
  const currentPriorityOption = priorityOptions.find(opt => opt.value === task?.priority);

  return (
    <Card className="animate-fade-in h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" />
          Detalls
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between p-4 pt-0">
        <div className="space-y-4">
          {/* Títol i descripció */}
          <div>
            <h3 className="text-base font-semibold mb-1 leading-tight">{task.title}</h3>
            {task.description && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{task.description}</p>
            )}
          </div>

          {/* Propietats de la tasca */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Propietats
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {/* Propietats de sistema: Status i Priority */}
              {currentStatusOption && (
                <PropertyBadge
                  propertyName="Estat"
                  optionValue={currentStatusOption.value}
                  optionLabel={currentStatusOption.label}
                  optionColor={currentStatusOption.color}
                  optionIcon={currentStatusOption.icon}
                  size="sm"
                />
              )}
              
              {currentPriorityOption && (
                <PropertyBadge
                  propertyName="Prioritat"
                  optionValue={currentPriorityOption.value}
                  optionLabel={currentPriorityOption.label}
                  optionColor={currentPriorityOption.color}
                  optionIcon={currentPriorityOption.icon}
                  size="sm"
                />
              )}

              {/* Propietats personalitzades de la base de dades */}
              {taskProperties.map((taskProp) => (
                <PropertyBadge
                  key={taskProp.id}
                  propertyName={taskProp.property_definitions.name}
                  optionValue={taskProp.property_options.value}
                  optionLabel={taskProp.property_options.label}
                  optionColor={taskProp.property_options.color}
                  optionIcon={taskProp.property_options.icon}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Informació addicional */}
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