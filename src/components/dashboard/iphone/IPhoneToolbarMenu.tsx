import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  MoreHorizontal, 
  Timer, 
  Bell, 
  BarChart3, 
  Settings,
  Coffee,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { cn } from '@/lib/utils';

interface IPhoneToolbarMenuProps {
  onNavigateToPrepareTomorrow?: () => void;
  onOpenReminderConfig?: () => void;
  onOpenTodayTimeBlocks?: () => void;
  onNavigateToNotifications?: () => void;
}

export const IPhoneToolbarMenu = ({
  onNavigateToPrepareTomorrow,
  onOpenReminderConfig,
  onOpenTodayTimeBlocks,
  onNavigateToNotifications
}: IPhoneToolbarMenuProps) => {
  const { state } = useNotificationManager();
  const queueSize = state.processingCount;
  
  const {
    isActive,
    timeLeft,
    isBreak,
    formatTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    hasActiveTimer
  } = usePomodoroContext();

  const handleStartPomodoro = () => {
    startTimer('dashboard-widget');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="lg"
          className="h-12 w-12 p-0 relative bg-accent hover:bg-accent/80 rounded-2xl iphone-touch-target"
          title="Més opcions"
        >
          <MoreHorizontal className="h-6 w-6 text-accent-foreground" />
          {queueSize > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full"
            >
              {queueSize > 9 ? '9+' : queueSize}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-6 bg-card border-border/20 shadow-[var(--shadow-floating)]" 
        align="end"
        sideOffset={8}
      >
        <div className="space-y-4">
          {/* Pomodoro Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Pomodoro</h3>
            
            {hasActiveTimer ? (
              <div className="p-4 rounded-2xl bg-accent/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Timer className={cn(
                        "h-5 w-5 transition-colors duration-300",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>
                    <span className="font-mono text-xl font-bold text-foreground">
                      {formatTime(timeLeft)}
                    </span>
                    {isBreak && <Coffee className="h-4 w-4 text-orange-400" />}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isActive ? (
                    <Button 
                      onClick={resumeTimer}
                      size="sm" 
                      variant="default"
                      className="flex-1 h-10"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Reprendre
                    </Button>
                  ) : (
                    <Button 
                      onClick={pauseTimer}
                      size="sm" 
                      variant="secondary"
                      className="flex-1 h-10"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </Button>
                  )}
                  
                  <Button 
                    onClick={resetTimer}
                    size="sm" 
                    variant="destructive"
                    className="px-4 h-10"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleStartPomodoro}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <Timer className="h-5 w-5 mr-3" />
                Iniciar Pomodoro
              </Button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Accions ràpides</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={onNavigateToNotifications}
                variant="outline" 
                className="h-12 flex-col gap-1 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="text-xs">Notificacions</span>
                {queueSize > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                  >
                    {queueSize}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="h-12 flex-col gap-1"
                title="Estadístiques"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">Stats</span>
              </Button>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Configuració</h3>
            
            <div className="space-y-2">
              <Button 
                onClick={onNavigateToPrepareTomorrow}
                variant="ghost" 
                className="w-full justify-start h-10"
              >
                <Settings className="h-4 w-4 mr-3" />
                Preparar demà
              </Button>
              
              <Button 
                onClick={onOpenReminderConfig}
                variant="ghost" 
                className="w-full justify-start h-10"
              >
                <Bell className="h-4 w-4 mr-3" />
                Recordatoris diaris
              </Button>
              
              <Button 
                onClick={onOpenTodayTimeBlocks}
                variant="ghost" 
                className="w-full justify-start h-10"
              >
                <Timer className="h-4 w-4 mr-3" />
                Blocs de temps d'avui
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};