import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, Edit3, Trash2, AlertCircle } from "lucide-react";
import { memo, useState } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTodayTimeBlocks } from "@/hooks/useTodayTimeBlocks";
import { useTaskTimeBlocks } from "@/hooks/useTaskTimeBlocks";
import { TaskTimeBlockSelector } from "@/components/task-form/TaskTimeBlockSelector";
import { InlineTimeBlockCreator } from "@/components/task-form/InlineTimeBlockCreator";
import type { TimeBlock } from "@/types/timeblock";
import { toast } from "sonner";

export const TaskTimeBlockCard = memo(() => {
  const { task, updateTask } = useTaskContext();
  const { timeBlocks, addTimeBlock, updateTimeBlock, removeTimeBlock } = useTodayTimeBlocks();
  const { getTaskScheduleInfo, hasTimeConflict } = useTaskTimeBlocks();
  const [showSelector, setShowSelector] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

  if (!task) return null;

  const scheduleInfo = getTaskScheduleInfo(task);
  const assignedTimeBlock = scheduleInfo.timeBlockId 
    ? timeBlocks.find(block => block.id === scheduleInfo.timeBlockId)
    : null;

  const handleTimeBlockSelect = async (timeBlockId: string) => {
    try {
      await updateTask({ time_block_id: timeBlockId });
      setShowSelector(false);
      toast.success('Bloc de temps assignat');
    } catch (error) {
      console.error('Error assigning time block:', error);
      toast.error('Error al assignar el bloc de temps');
    }
  };

  const handleCustomTimeSelect = async (startTime: string, endTime: string) => {
    // Check for conflicts
    if (hasTimeConflict(startTime, endTime, task.id)) {
      toast.error('Aquest horari està en conflicte amb una altra tasca');
      return;
    }

    try {
      await updateTask({ 
        scheduled_start_time: startTime,
        scheduled_end_time: endTime,
        time_block_id: null 
      });
      setShowSelector(false);
      toast.success('Horari personalitzat assignat');
    } catch (error) {
      console.error('Error setting custom time:', error);
      toast.error('Error al assignar l\'horari personalitzat');
    }
  };

  const handleTimeBlockCreate = async (newBlock: Omit<TimeBlock, 'id'>) => {
    try {
      await addTimeBlock(newBlock);
      const createdBlocks = timeBlocks.filter(block => block.title === newBlock.title);
      const lastCreatedBlock = createdBlocks[createdBlocks.length - 1];
      
      if (lastCreatedBlock) {
        await updateTask({ time_block_id: lastCreatedBlock.id });
        toast.success('Bloc de temps creat i assignat');
      }
      setShowCreator(false);
    } catch (error) {
      console.error('Error creating time block:', error);
      toast.error('Error al crear el bloc de temps');
    }
  };

  const handleEditTimeBlock = async (blockId: string, updates: Partial<TimeBlock>) => {
    try {
      await updateTimeBlock(blockId, updates);
      setEditingBlock(null);
      toast.success('Bloc de temps actualitzat');
    } catch (error) {
      console.error('Error updating time block:', error);
      toast.error('Error al actualitzar el bloc de temps');
    }
  };

  const handleRemoveAssignment = async () => {
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

  const handleClear = () => {
    setShowSelector(false);
    setShowCreator(false);
    setEditingBlock(null);
  };

  return (
    <Card className="animate-fade-in h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          Programació Temporal
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Current Assignment Display */}
        {(assignedTimeBlock || scheduleInfo.scheduledTime) && (
          <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm">
                  {assignedTimeBlock ? assignedTimeBlock.title : 'Horari Personalitzat'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {assignedTimeBlock 
                    ? `${assignedTimeBlock.startTime} - ${assignedTimeBlock.endTime}`
                    : typeof scheduleInfo.scheduledTime === 'string' 
                      ? scheduleInfo.scheduledTime 
                      : `${scheduleInfo.scheduledTime?.start} - ${scheduleInfo.scheduledTime?.end}`
                  }
                </p>
              </div>
              <div className="flex gap-1">
                {assignedTimeBlock && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingBlock(assignedTimeBlock)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveAssignment}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Time Block Selector */}
        {showSelector && (
          <div className="mb-4">
            <TaskTimeBlockSelector
              selectedTimeBlockId={assignedTimeBlock?.id}
              selectedStartTime={task.scheduled_start_time || ''}
              selectedEndTime={task.scheduled_end_time || ''}
              onTimeBlockSelect={handleTimeBlockSelect}
              onCustomTimeSelect={handleCustomTimeSelect}
              onClear={handleClear}
              onCreateNew={() => setShowCreator(true)}
              availableTimeBlocks={timeBlocks}
            />
          </div>
        )}

        {/* Time Block Creator */}
        {showCreator && (
          <div className="mb-4">
            <InlineTimeBlockCreator
              onTimeBlockCreate={handleTimeBlockCreate}
              onCancel={() => setShowCreator(false)}
            />
          </div>
        )}

        {/* Edit Time Block */}
        {editingBlock && (
          <div className="mb-4">
            <InlineTimeBlockCreator
              onTimeBlockCreate={(updates) => handleEditTimeBlock(editingBlock.id, updates)}
              onCancel={() => setEditingBlock(null)}
            />
          </div>
        )}

        {/* Action Buttons */}
        {!showSelector && !showCreator && !editingBlock && (
          <div className="space-y-3">
            {!assignedTimeBlock && !scheduleInfo.scheduledTime && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowSelector(true)}
                  className="w-full justify-start gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Assignar Bloc de Temps
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowCreator(true)}
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Crear Nou Bloc
                </Button>
              </>
            )}
            
            {(assignedTimeBlock || scheduleInfo.scheduledTime) && (
              <Button
                variant="outline"
                onClick={() => setShowSelector(true)}
                className="w-full justify-start gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Canviar Assignació
              </Button>
            )}
          </div>
        )}

        {/* Conflict Warning */}
        {scheduleInfo.scheduledTime && hasTimeConflict(
          task.scheduled_start_time || '',
          task.scheduled_end_time || '',
          task.id
        ) && (
          <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive text-xs">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span>Conflicte d'horari detectat</span>
            </div>
          </div>
        )}

        {/* Info Text */}
        <div className="mt-auto pt-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Assigna un bloc de temps per organitzar millor el teu dia i rebre notificacions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
});