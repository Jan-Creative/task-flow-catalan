import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { cn } from '@/lib/utils';
import { usePomodoroWidgetLogic } from '@/hooks/usePomodoroWidgetLogic';

export const SidebarPomodoroWidget = React.memo(() => {
  const {
    hasActiveTimer,
    isActive,
    timeLeft,
    isBreak,
    formatTime,
    pauseTimer,
    resetTimer,
    workDuration,
    breakDuration
  } = usePomodoroContext();
  
  const { showSidebarWidget } = usePomodoroWidgetLogic();

  // Només mostrar si la lògica de coordinació ho permet
  if (!hasActiveTimer || !showSidebarWidget) {
    return null;
  }

  // Calculate progress for circular indicator with better precision
  const totalDuration = isBreak ? breakDuration * 60 : workDuration * 60;
  const elapsed = totalDuration - timeLeft;
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  const circumference = 2 * Math.PI * 16; // smaller radius for compact design
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent">
      <div className="flex items-center gap-1.5">
        <div className="relative">
          {isBreak ? (
            <Coffee className="h-4 w-4 text-orange-400" />
          ) : (
            <Timer className={cn(
              "h-4 w-4 transition-colors duration-300",
              isActive ? "text-white" : "text-white/70"
            )} />
          )}
          {isActive && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>
        <span className="font-mono text-sm font-medium text-white">
          {formatTime(timeLeft)}
        </span>
        {isBreak && (
          <span className="text-xs font-medium text-orange-400">Descans</span>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        {!isActive ? (
          <Button 
            onClick={() => {/* Logic handled by main timer */}}
            size="sm" 
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-white/10 text-white"
            title="Reproduir"
          >
            <Play className="h-3 w-3" />
          </Button>
        ) : (
          <Button 
            onClick={pauseTimer}
            size="sm" 
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-white/10 text-white"
            title="Pausar"
          >
            <Pause className="h-3 w-3" />
          </Button>
        )}
        
        <Button 
          onClick={resetTimer}
          size="sm" 
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-destructive/15 hover:text-destructive text-white"
          title="Reiniciar"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});