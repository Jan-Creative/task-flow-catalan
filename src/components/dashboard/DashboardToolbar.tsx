import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Bell, 
  BarChart3, 
  Focus,
  Coffee
} from "lucide-react";
import { ConfigurationMenu } from './ConfigurationMenu';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { PomodoroMenuPopover } from '@/components/pomodoro/PomodoroMenuPopover';
import { cn } from '@/lib/utils';

interface DashboardToolbarProps {
  onNavigateToPrepareTomorrow?: () => void;
  onOpenReminderConfig?: () => void;
  onOpenTodayTimeBlocks?: () => void;
  onNavigateToNotifications?: () => void;
}

export const DashboardToolbar = ({ 
  onNavigateToPrepareTomorrow, 
  onOpenReminderConfig, 
  onOpenTodayTimeBlocks,
  onNavigateToNotifications
}: DashboardToolbarProps) => {
  const [showStats, setShowStats] = useState(false);
  const { state, stats } = useNotificationManager();
  const queueSize = state.processingCount;
  const isSystemHealthy = stats.sent > 0;
  
  const {
    isActive,
    timeLeft,
    isBreak,
    formatTime,
    startTimer,
    pauseTimer,
    resetTimer,
    hasActiveTimer
  } = usePomodoroContext();

  const handleStartPomodoro = () => {
    startTimer('dashboard-widget');
  };

  return (
    <div className="flex items-center gap-1 bg-card rounded-2xl px-2 py-1.5 shadow-[var(--shadow-card)]">
      {/* Pomodoro Widget */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-accent">
        {hasActiveTimer ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Timer className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <span className="font-mono text-sm font-medium text-foreground">
                {formatTime(timeLeft)}
              </span>
              {isBreak && <Coffee className="h-3 w-3 text-orange-400" />}
            </div>
            
            <div className="flex items-center gap-1">
              {!isActive ? (
                <Button 
                  onClick={handleStartPomodoro}
                  size="sm" 
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-accent"
                  title="Reproduir"
                >
                  <Play className="h-3 w-3" />
                </Button>
              ) : (
                <Button 
                  onClick={pauseTimer}
                  size="sm" 
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-accent"
                  title="Pausar"
                >
                  <Pause className="h-3 w-3" />
                </Button>
              )}
              
              <Button 
                onClick={resetTimer}
                size="sm" 
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-destructive/15 hover:text-destructive"
                title="Reiniciar"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </>
        ) : (
          <PomodoroMenuPopover>
            <Button 
              size="sm" 
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-accent"
              title="Iniciar Pomodoro"
            >
              <Timer className="h-4 w-4 text-white" />
            </Button>
          </PomodoroMenuPopover>
        )}
      </div>

      {/* Notification Indicator */}
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 w-8 p-0 relative bg-accent hover:bg-accent/80 rounded-xl"
        onClick={onNavigateToNotifications}
        title="Notificacions"
      >
        <Bell className="h-4 w-4 text-white" />
        {queueSize > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center rounded-full"
          >
            {queueSize > 9 ? '9+' : queueSize}
          </Badge>
        )}
      </Button>

      {/* Stats Toggle */}
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 w-8 p-0 bg-accent hover:bg-accent/80 rounded-xl"
        onClick={() => setShowStats(!showStats)}
        title="Estadístiques"
      >
        <BarChart3 className="h-4 w-4 text-white" />
      </Button>

      {/* Focus Mode */}
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 w-8 p-0 bg-accent hover:bg-accent/80 rounded-xl opacity-50"
        title="Mode Focus (Aviat disponible)"
        disabled
      >
        <Focus className="h-4 w-4 text-white" />
      </Button>

      {/* Separator */}
      <div className="w-px h-4 bg-border/40 mx-1" />

      {/* Configuration Menu */}
      <ConfigurationMenu 
        onNavigateToPrepareTomorrow={onNavigateToPrepareTomorrow}
        onOpenReminderConfig={onOpenReminderConfig}
        onOpenTodayTimeBlocks={onOpenTodayTimeBlocks}
      />
    </div>
  );
};