import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, Play, Coffee, Clock, Settings, Minus, Plus } from 'lucide-react';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { cn } from '@/lib/utils';

interface PomodoroMenuPopoverProps {
  children: React.ReactNode;
}

const QUICK_PRESETS = [
  { duration: 5, label: '5min', description: 'Ràpid' },
  { duration: 15, label: '15min', description: 'Curt' },
  { duration: 25, label: '25min', description: 'Clàssic' },
  { duration: 45, label: '45min', description: 'Focus' },
];

export const PomodoroMenuPopover = ({ children }: PomodoroMenuPopoverProps) => {
  const {
    isActive,
    timeLeft,
    isBreak,
    workDuration,
    startGenericTimer,
    formatTime,
    hasActiveTimer
  } = usePomodoroContext();

  const [open, setOpen] = useState(false);
  const [customDuration, setCustomDuration] = useState(25);
  const [showCustom, setShowCustom] = useState(false);

  const handleStartTimer = async (duration: number) => {
    try {
      console.log('Starting generic timer with duration:', duration);
      await startGenericTimer(duration);
      setOpen(false);
      console.log('Generic timer started successfully');
    } catch (error) {
      console.error('Error starting generic timer:', error);
      // You could add a toast notification here for user feedback
    }
  };

  const adjustCustomDuration = (delta: number) => {
    const newValue = Math.min(Math.max(customDuration + delta, 5), 120);
    setCustomDuration(newValue);
  };

  // Don't show menu if timer is already active
  if (hasActiveTimer) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end">
          <div className="space-y-4">
            {/* Active timer display */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <span className="font-medium">Timer Actiu</span>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-2xl font-mono font-bold text-primary mb-1">
                  {formatTime(timeLeft)}
                </div>
                <Badge variant={!isBreak ? 'default' : 'secondary'} className="text-xs">
                  {!isBreak ? 'Feina' : 'Descans'}
                  {isBreak && <Coffee className="h-3 w-3 ml-1" />}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Utilitza la targeta flotant per controlar el timer
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-border/30">
            <Timer className="h-5 w-5 text-primary" />
            <span className="font-semibold">Pomodoro Timer</span>
          </div>

          {/* Quick presets */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Presets ràpids</h4>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PRESETS.map((preset) => (
                <Button
                  key={preset.duration}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center gap-1 hover:bg-primary/10 hover:border-primary"
                  onClick={() => handleStartTimer(preset.duration)}
                >
                  <span className="font-bold text-primary">{preset.label}</span>
                  <span className="text-xs text-muted-foreground">{preset.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Personalitzat</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustom(!showCustom)}
                className="h-6 px-2 text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                {showCustom ? 'Amagar' : 'Mostrar'}
              </Button>
            </div>

            {showCustom && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-muted/30 rounded-xl p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => adjustCustomDuration(-5)}
                    disabled={customDuration <= 5}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-mono font-bold">{customDuration}</span>
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => adjustCustomDuration(5)}
                    disabled={customDuration >= 120}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={() => handleStartTimer(customDuration)}
                >
                  <Play className="h-4 w-4" />
                  Iniciar {customDuration} minuts
                </Button>
              </div>
            )}

            {!showCustom && (
              <Button
                className="w-full gap-2"
                onClick={() => handleStartTimer(customDuration)}
              >
                <Play className="h-4 w-4" />
                Iniciar {customDuration} minuts
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
            El timer apareixerà com a targeta flotant quan estigui actiu
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};