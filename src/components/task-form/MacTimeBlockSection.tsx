/**
 * Mac Time Block Section - Integrates real time blocks with task form
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TaskTimeBlockSelector } from './TaskTimeBlockSelector';
import { InlineTimeBlockCreator } from './InlineTimeBlockCreator';
import { useTodayTimeBlocks } from '@/hooks/useTodayTimeBlocks';
import { useTaskTimeBlocks } from '@/hooks/useTaskTimeBlocks';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { MacTaskFormReturn } from '@/hooks/tasks/useMacTaskForm';

interface MacTimeBlockSectionProps {
  form: MacTaskFormReturn;
  className?: string;
}

export const MacTimeBlockSection: React.FC<MacTimeBlockSectionProps> = ({
  form,
  className
}) => {
  const [showCreator, setShowCreator] = useState(false);
  const { timeBlocks, addTimeBlock, loading } = useTodayTimeBlocks();
  const { hasTimeConflict } = useTaskTimeBlocks();

  const handleTimeBlockSelect = (timeBlockId: string) => {
    // Clear custom times when selecting a block
    form.setValue('scheduled_start_time', '');
    form.setValue('scheduled_end_time', '');
    form.setValue('time_block_id', timeBlockId);
    
    // Show success feedback
    const selectedBlock = timeBlocks.find(block => block.id === timeBlockId);
    if (selectedBlock) {
      toast.success(`Tasca assignada a "${selectedBlock.title}"`);
    }
  };

  const handleCustomTimeSelect = (startTime: string, endTime: string) => {
    // Check for conflicts before setting
    const conflictExists = hasTimeConflict(startTime, endTime);
    
    if (conflictExists) {
      toast.error('Aquest horari està en conflicte amb una altra tasca');
      return;
    }

    // Clear time block when setting custom time
    form.setValue('time_block_id', '');
    form.setValue('scheduled_start_time', startTime);
    form.setValue('scheduled_end_time', endTime);
    
    toast.success(`Horari personalitzat assignat: ${startTime} - ${endTime}`);
  };

  const handleClear = () => {
    form.setValue('time_block_id', '');
    form.setValue('scheduled_start_time', '');
    form.setValue('scheduled_end_time', '');
    toast.info('Programació temporal eliminada');
  };

  const handleTimeBlockCreate = async (blockData: any) => {
    try {
      await addTimeBlock(blockData);
      
      // Auto-assign the newly created time block
      // Since addTimeBlock updates the state, we'll get the new block in the next render
      setShowCreator(false);
      toast.success('Bloc de temps creat correctament');
    } catch (error) {
      console.error('Error creating time block:', error);
      toast.error('Error creant el bloc de temps');
    }
  };

  const handleCreateNew = () => {
    setShowCreator(true);
  };

  const handleCancelCreate = () => {
    setShowCreator(false);
  };

  return (
    <div className={cn(className)}>
      <div className="flex items-center justify-between mb-4">
        <Label className="text-sm font-medium">Programació temporal</Label>
        {timeBlocks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {timeBlocks.length} blocs disponibles avui
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {!showCreator && (
          <TaskTimeBlockSelector
            selectedTimeBlockId={form.values.time_block_id}
            selectedStartTime={form.values.scheduled_start_time}
            selectedEndTime={form.values.scheduled_end_time}
            onTimeBlockSelect={handleTimeBlockSelect}
            onCustomTimeSelect={handleCustomTimeSelect}
            onClear={handleClear}
            onCreateNew={handleCreateNew}
            availableTimeBlocks={timeBlocks}
          />
        )}

        {/* Inline Time Block Creator */}
        {showCreator && (
          <InlineTimeBlockCreator
            onTimeBlockCreate={handleTimeBlockCreate}
            onCancel={handleCancelCreate}
          />
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">
              Carregant blocs de temps...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};