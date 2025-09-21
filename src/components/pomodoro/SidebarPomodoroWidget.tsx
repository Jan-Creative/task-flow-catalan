import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { cn } from '@/lib/utils';

export const SidebarPomodoroWidget = () => {
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

  // Calculate progress for circular indicator
  const totalDuration = isBreak ? breakDuration : workDuration;
  const elapsed = totalDuration - timeLeft;
  const progress = (elapsed / totalDuration) * 100;
  const circumference = 2 * Math.PI * 20; // radius = 20
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="mx-3 mb-4">
      <div className="bg-card/50 backdrop-blur-xl rounded-xl p-4 border border-border/30 shadow-floating">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isBreak ? (
              <Coffee className="h-4 w-4 text-orange-400" />
            ) : (
              <Timer className="h-4 w-4 text-primary" />
            )}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isBreak ? 'Descans' : 'Feina'}
            </span>
          </div>
          <div className={cn(
            "w-2 h-2 rounded-full shadow-sm",
            isActive ? "bg-success animate-pulse" : "bg-muted"
          )} />
        </div>

        {/* Circular Progress Timer */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            {/* Background circle */}
            <svg
              className="w-16 h-16 transform -rotate-90"
              viewBox="0 0 44 44"
            >
              <circle
                cx="22"
                cy="22"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-muted/30"
              />
              {/* Progress circle */}
              <circle
                cx="22"
                cy="22"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-300 ease-out",
                  isBreak ? "text-orange-400" : "text-primary"
                )}
              />
            </svg>
            
            {/* Time display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-foreground">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={pauseTimer}
            disabled={!isActive}
            className={cn(
              "h-8 w-8 p-0 rounded-lg transition-all duration-200",
              "hover:bg-accent/60 hover:scale-105 active:scale-95",
              !isActive && "opacity-50 cursor-not-allowed"
            )}
          >
            {isActive ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTimer}
            className="h-8 w-8 p-0 rounded-lg transition-all duration-200 hover:bg-accent/60 hover:scale-105 active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Session info */}
        <div className="text-center mt-3">
          <span className="text-xs text-muted-foreground">
            {isBreak ? 'Temps de descans' : 'Temps de concentració'}
          </span>
        </div>
      </div>
    </div>
  );
};