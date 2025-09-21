import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { cn } from '@/lib/utils';
import { usePomodoroWidgetLogic } from '@/hooks/usePomodoroWidgetLogic';

export const PomodoroWidget = () => {
  const {
    isActive,
    timeLeft,
    isBreak,
    hasActiveTimer,
    formatTime,
    pauseTimer,
    resetTimer,
    workDuration,
    breakDuration
  } = usePomodoroContext();
  
  const { showFloatingWidget } = usePomodoroWidgetLogic();

  // Només mostrar si la lògica de coordinació ho permet
  if (!hasActiveTimer || !showFloatingWidget) return null;

  // Calculate progress based on current session type and duration
  const totalTime = isBreak ? breakDuration * 60 : workDuration * 60;
  const progress = totalTime > 0 ? Math.max(0, Math.min(100, ((totalTime - timeLeft) / totalTime) * 100)) : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
      <div className={cn(
        "bg-background/95 backdrop-blur-md border border-border/50 rounded-full shadow-2xl",
        "flex items-center gap-3 px-4 py-3 min-w-[200px]",
        "transition-all duration-300 hover:shadow-lg hover:scale-105",
        isActive && "ring-2 ring-primary/20 shadow-primary/10"
      )}>
        {/* Circular progress indicator */}
        <div className="relative flex-shrink-0">
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          
          {/* Icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isBreak ? (
              <Coffee className="h-4 w-4 text-orange-400" />
            ) : (
              <Timer className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
            )}
          </div>
        </div>

        {/* Timer display */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-mono font-bold text-sm transition-colors",
            isActive ? "text-primary" : "text-foreground"
          )}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-xs text-muted-foreground">
            {isBreak ? 'Descans' : 'Feina'}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-1">
          {isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={pauseTimer}
              className="h-8 w-8 p-0 hover:bg-muted/80"
            >
              <Pause className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}} // Will be handled by main timer logic
              className="h-8 w-8 p-0 hover:bg-muted/80"
              disabled
            >
              <Play className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTimer}
            className="h-8 w-8 p-0 hover:bg-muted/80"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};