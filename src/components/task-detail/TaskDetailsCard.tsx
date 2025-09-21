import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, FolderOpen, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { memo, useState } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTaskProperties } from "@/hooks/useTaskProperties";
import { useProperties } from "@/hooks/useProperties";
import { PropertyBadge } from "@/components/ui/property-badge";
import { useTodayTimeBlocks } from "@/hooks/useTodayTimeBlocks";
import { useTaskTimeBlocks } from "@/hooks/useTaskTimeBlocks";
import { TaskTimeBlockSelector } from "@/components/task-form/TaskTimeBlockSelector";
import { toast } from "sonner";

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
  const { updateTask } = contextData || {};
  
  // Time block management
  const { timeBlocks } = useTodayTimeBlocks();
  const { getTaskScheduleInfo } = useTaskTimeBlocks();
  const [showTimeBlockSelector, setShowTimeBlockSelector] = useState(false);
  
  // Obtenir les propietats de la tasca
  const { data: taskProperties = [] } = useTaskProperties(task?.id);
  const { getStatusOptions, getPriorityOptions } = useProperties();

  // Crear llista unificada de totes les propietats
  const allProperties = [];
  let hasSystemPriority = false;
  
  // 1. Propietats de sistema: Status (només si existeix)
  if (task?.status) {
    const statusOptions = getStatusOptions();
    const currentStatusOption = statusOptions.find(opt => opt.value === task.status);
    if (currentStatusOption) {
      allProperties.push({
        id: `status-${task.status}`,
        propertyName: "Estat",
        optionValue: currentStatusOption.value,
        optionLabel: currentStatusOption.label,
        optionColor: currentStatusOption.color,
        optionIcon: currentStatusOption.icon,
        order: 1
      });
    }
  }

  // 2. Propietats de sistema: Priority (només si existeix)
  if (task?.priority) {
    const priorityOptions = getPriorityOptions();
    const currentPriorityOption = priorityOptions.find(opt => opt.value === task.priority);
    if (currentPriorityOption) {
      allProperties.push({
        id: `priority-${task.priority}`,
        propertyName: "Prioritat",
        optionValue: currentPriorityOption.value,
        optionLabel: currentPriorityOption.label,
        optionColor: currentPriorityOption.color,
        optionIcon: currentPriorityOption.icon,
        order: 2
      });
      hasSystemPriority = true;
    }
  }

  // 3. Propietat especial: Carpeta (només si existeix)
  if (folderName) {
    allProperties.push({
      id: `folder-${task?.folder_id}`,
      propertyName: "Carpeta",
      optionValue: task?.folder_id || 'folder',
      optionLabel: folderName,
      optionColor: '#6366f1', // TODO: move to design tokens
      optionIcon: 'folder',
      order: 3
    });
  }

  // 4. Propietat especial: Data límit (només si existeix)
  if (task?.due_date) {
    allProperties.push({
      id: `due-date-${task.due_date}`,
      propertyName: "Data límit",
      optionValue: task.due_date,
      optionLabel: format(new Date(task.due_date), 'dd MMM', { locale: ca }),
      optionColor: '#ef4444', // Color vermell per dates límit
      optionIcon: 'calendar',
      order: 4
    });
  }

  // 5. Propietats personalitzades de la base de dades (excloure Estat sempre i Prioritat només si ja hem afegit la de sistema)
  taskProperties
    .filter(taskProp => {
      const name = taskProp.property_definitions.name;
      if (name === 'Estat') return false;
      if (name === 'Prioritat' && hasSystemPriority) return false;
      return true;
    })
    .forEach(taskProp => {
      const name = taskProp.property_definitions.name;
      allProperties.push({
        id: taskProp.id,
        propertyName: name,
        optionValue: taskProp.property_options.value,
        optionLabel: taskProp.property_options.label,
        optionColor: taskProp.property_options.color,
        optionIcon: taskProp.property_options.icon,
        order: name === 'Prioritat' ? 2 : 5
      });
    });

  // Time block info
  const scheduleInfo = task ? getTaskScheduleInfo(task) : null;
  const assignedTimeBlock = scheduleInfo?.timeBlockId 
    ? timeBlocks.find(block => block.id === scheduleInfo.timeBlockId)
    : null;

  // Add time block to properties if assigned
  if (assignedTimeBlock || scheduleInfo?.scheduledTime) {
    allProperties.push({
      id: `time-block-${assignedTimeBlock?.id || 'custom'}`,
      propertyName: "Bloc de temps",
      optionValue: assignedTimeBlock?.id || 'custom',
      optionLabel: assignedTimeBlock ? assignedTimeBlock.title : 'Horari personalitzat',
      optionColor: '#10b981', // green color for time blocks
      optionIcon: 'clock',
      order: 2.5
    });
  }

  // Ordenar propietats per importància
  allProperties.sort((a, b) => a.order - b.order);

  // Handle time block assignment
  const handleTimeBlockSelect = async (timeBlockId: string) => {
    if (!updateTask) return;
    try {
      await updateTask({ time_block_id: timeBlockId });
      setShowTimeBlockSelector(false);
      toast.success('Bloc de temps assignat');
    } catch (error) {
      console.error('Error assigning time block:', error);
      toast.error('Error al assignar el bloc de temps');
    }
  };

  const handleCustomTimeSelect = async (startTime: string, endTime: string) => {
    if (!updateTask) return;
    try {
      await updateTask({ 
        scheduled_start_time: startTime,
        scheduled_end_time: endTime,
        time_block_id: null 
      });
      setShowTimeBlockSelector(false);
      toast.success('Horari personalitzat assignat');
    } catch (error) {
      console.error('Error setting custom time:', error);
      toast.error('Error al assignar l\'horari personalitzat');
    }
  };

  const handleRemoveTimeBlock = async () => {
    if (!updateTask) return;
    try {
      await updateTask({ 
        time_block_id: null,
        scheduled_start_time: null,
        scheduled_end_time: null 
      });
      toast.success('Assignació temporal eliminada');
    } catch (error) {
      console.error('Error removing time assignment:', error);
      toast.error('Error al eliminar l\'assignació temporal');
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
        <div className="space-y-4">
          {/* Títol i descripció */}
          <div>
            <h3 className="text-base font-semibold mb-1 leading-tight">{task.title}</h3>
            {task.description && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{task.description}</p>
            )}
          </div>

          {/* Propietats de la tasca - Sistema unificat */}
          {allProperties.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Propietats
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {allProperties.map((property) => {
                  const isTimeBlock = property.id.startsWith('time-block-');
                  return (
                    <div key={property.id} className="flex items-center gap-1">
                      <PropertyBadge
                        propertyName={property.propertyName}
                        optionValue={property.optionValue}
                        optionLabel={property.optionLabel}
                        optionColor={property.optionColor}
                        optionIcon={property.optionIcon}
                        size="sm"
                      />
                      {isTimeBlock && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveTimeBlock}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Block Selector */}
          {showTimeBlockSelector && (
            <div className="space-y-2">
              <TaskTimeBlockSelector
                selectedTimeBlockId={assignedTimeBlock?.id}
                selectedStartTime={task?.scheduled_start_time || ''}
                selectedEndTime={task?.scheduled_end_time || ''}
                onTimeBlockSelect={handleTimeBlockSelect}
                onCustomTimeSelect={handleCustomTimeSelect}
                onClear={() => setShowTimeBlockSelector(false)}
                onCreateNew={() => {}} // Disabled for now
                availableTimeBlocks={timeBlocks}
              />
            </div>
          )}

          {/* Time Block Assignment Button */}
          {!showTimeBlockSelector && !assignedTimeBlock && !scheduleInfo?.scheduledTime && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimeBlockSelector(true)}
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Assignar Bloc de Temps
              </Button>
            </div>
          )}
        </div>

        {/* Informació addicional */}
        <div className="space-y-2 text-xs mt-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>Creada: {format(new Date(task.created_at), 'dd MMM', { locale: ca })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});