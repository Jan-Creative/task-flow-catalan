/**
 * Task Time Block Selector - Component to select existing time blocks for tasks
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeBlock } from '@/types/timeblock';

interface TaskTimeBlockSelectorProps {
  selectedTimeBlockId?: string;
  selectedStartTime?: string;
  selectedEndTime?: string;
  onTimeBlockSelect?: (timeBlockId: string) => void;
  onCustomTimeSelect?: (startTime: string, endTime: string) => void;
  onClear?: () => void;
  onCreateNew?: () => void;
  availableTimeBlocks?: TimeBlock[];
  className?: string;
}

// Generate time options for custom time selection
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

export const TaskTimeBlockSelector: React.FC<TaskTimeBlockSelectorProps> = ({
  selectedTimeBlockId,
  selectedStartTime,
  selectedEndTime,
  onTimeBlockSelect,
  onCustomTimeSelect,
  onClear,
  onCreateNew,
  availableTimeBlocks = [],
  className
}) => {
  const [mode, setMode] = useState<'existing' | 'custom' | 'none'>('none');
  const [customStartTime, setCustomStartTime] = useState('09:00');
  const [customEndTime, setCustomEndTime] = useState('10:00');

  const hasSchedule = selectedTimeBlockId || (selectedStartTime && selectedEndTime);

  const handleModeChange = (newMode: 'existing' | 'custom' | 'none') => {
    setMode(newMode);
    
    if (newMode === 'none') {
      onClear?.();
    }
  };

  const handleTimeBlockSelect = (timeBlockId: string) => {
    onTimeBlockSelect?.(timeBlockId);
  };

  const handleCustomTimeChange = () => {
    if (customStartTime && customEndTime) {
      // Validate time order
      const [startHour, startMinutes] = customStartTime.split(':').map(Number);
      const [endHour, endMinutes] = customEndTime.split(':').map(Number);
      const startTotalMinutes = startHour * 60 + startMinutes;
      const endTotalMinutes = endHour * 60 + endMinutes;
      
      if (endTotalMinutes <= startTotalMinutes) {
        return; // Invalid time range
      }
      
      onCustomTimeSelect?.(customStartTime, customEndTime);
    }
  };

  const getSelectedTimeBlock = () => {
    return availableTimeBlocks.find(block => block.id === selectedTimeBlockId);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Programació Temporal
        </Label>
        {hasSchedule && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleModeChange('none')}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Eliminar
          </Button>
        )}
      </div>

      {/* Current Schedule Display */}
      {hasSchedule && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="flex-1">
              {selectedTimeBlockId && getSelectedTimeBlock() ? (
                <div>
                  <div className="font-medium text-sm">{getSelectedTimeBlock()?.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {getSelectedTimeBlock()?.startTime} - {getSelectedTimeBlock()?.endTime}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium text-sm">Horari personalitzat</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedStartTime} - {selectedEndTime}
                  </div>
                </div>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              Programada
            </Badge>
          </div>
        </div>
      )}

      {/* Mode Selection */}
      {!hasSchedule && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            {/* Use Existing Block */}
            {availableTimeBlocks.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleModeChange('existing')}
                className={cn(
                  "justify-start h-auto p-3",
                  mode === 'existing' && "ring-2 ring-primary border-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Afegir a bloc existent</div>
                    <div className="text-xs text-muted-foreground">
                      Tria un dels {availableTimeBlocks.length} blocs disponibles
                    </div>
                  </div>
                </div>
              </Button>
            )}

            {/* Create Custom Time */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModeChange('custom')}
              className={cn(
                "justify-start h-auto p-3",
                mode === 'custom' && "ring-2 ring-primary border-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Horari personalitzat</div>
                  <div className="text-xs text-muted-foreground">
                    Defineix un horari específic per aquesta tasca
                  </div>
                </div>
              </div>
            </Button>

            {/* Create New Block */}
            <Button
              type="button"
              variant="outline"
              onClick={onCreateNew}
              className="justify-start h-auto p-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Crear bloc nou</div>
                  <div className="text-xs text-muted-foreground">
                    Crea un bloc de temps que podràs reutilitzar
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Existing Block Selection */}
      {mode === 'existing' && availableTimeBlocks.length > 0 && (
        <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
          <Label className="text-sm">Selecciona un bloc existent:</Label>
          <Select onValueChange={handleTimeBlockSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Tria un bloc de temps..." />
            </SelectTrigger>
            <SelectContent>
              {availableTimeBlocks.map((block) => (
                <SelectItem key={block.id} value={block.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: block.color }}
                    />
                    <span>{block.title}</span>
                    <span className="text-muted-foreground text-xs ml-auto">
                      {block.startTime} - {block.endTime}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Custom Time Selection */}
      {mode === 'custom' && (
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
          <Label className="text-sm">Defineix l'horari personalitzat:</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime" className="text-xs text-muted-foreground">
                Hora d'inici
              </Label>
              <Select value={customStartTime} onValueChange={setCustomStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="endTime" className="text-xs text-muted-foreground">
                Hora de fi
              </Label>
              <Select value={customEndTime} onValueChange={setCustomEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCustomTimeChange}
            className="w-full"
            size="sm"
          >
            Assignar horari personalitzat
          </Button>
        </div>
      )}
    </div>
  );
};
