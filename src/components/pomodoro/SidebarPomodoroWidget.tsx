import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { cn } from '@/lib/utils';

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

  if (!hasActiveTimer) {
    return null;
  }

  // Calculate progress for circular indicator with better precision
  const totalDuration = isBreak ? breakDuration * 60 : workDuration * 60;
  const elapsed = totalDuration - timeLeft;
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  const circumference = 2 * Math.PI * 16; // smaller radius for compact design
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="mx-3 mb-3">
      <div className="bg-accent/20 backdrop-blur-sm rounded-lg p-3 border border-border/20 transition-all duration-300 hover:bg-accent/30">
        {/* Compact header with status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {isBreak ? (
              <Coffee className="h-3.5 w-3.5 text-orange-400" />
            ) : (
              <Timer className="h-3.5 w-3.5 text-primary" />
            )}
            <span className="text-xs font-medium text-muted-foreground">
              {isBreak ? 'Descans' : 'Focus'}
            </span>
          </div>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-300",
            isActive ? "bg-primary animate-pulse shadow-sm" : "bg-muted/50"
          )} />
        </div>

        {/* Compact progress timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mini progress circle */}
            <div className="relative">
              <svg
                className="w-8 h-8 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={cn(
                    "transition-all duration-500 ease-out",
                    isBreak ? "text-orange-400" : "text-primary"
                  )}
                />
              </svg>
            </div>
            
            {/* Time display */}
            <span className="text-sm font-mono font-medium text-foreground">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Minimal controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={pauseTimer}
              disabled={!isActive}
              className={cn(
                "h-6 w-6 p-0 rounded transition-all duration-200",
                "hover:bg-accent/60 hover:scale-110 active:scale-95",
                !isActive && "opacity-40 cursor-not-allowed"
              )}
            >
              {isActive ? (
                <Pause className="h-2.5 w-2.5" />
              ) : (
                <Play className="h-2.5 w-2.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetTimer}
              className="h-6 w-6 p-0 rounded transition-all duration-200 hover:bg-destructive/20 hover:text-destructive hover:scale-110 active:scale-95"
            >
              <RotateCcw className="h-2.5 w-2.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});