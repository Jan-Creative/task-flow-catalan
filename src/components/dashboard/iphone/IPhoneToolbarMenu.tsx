import { useState } from "react";
import { MoreHorizontal, Settings, Bell, BarChart3, Calendar, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { usePomodoroContext } from "@/contexts/PomodoroContext";

interface IPhoneToolbarMenuProps {
  onOpenReminderConfig: () => void;
  onOpenTimeBlocks: () => void;
  onNavigateToNotifications?: () => void;
}

export const IPhoneToolbarMenu = ({
  onOpenReminderConfig,
  onOpenTimeBlocks,
  onNavigateToNotifications
}: IPhoneToolbarMenuProps) => {
  const [open, setOpen] = useState(false);
  const { state } = useNotificationManager();
  const { startGenericTimer, isActive } = usePomodoroContext();

  const handleStartPomodoro = () => {
    if (!isActive) {
      startGenericTimer(25); // Default 25 minute Pomodoro
    }
    setOpen(false);
  };

  const handleNavigateToPrepareTomorrow = () => {
    window.location.href = '/prepare-tomorrow';
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 relative bg-accent/50 hover:bg-accent border-0"
        >
          <MoreHorizontal className="h-5 w-5" />
          {state.queueSize > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {state.queueSize}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10"
            onClick={handleStartPomodoro}
          >
            <Timer className="h-4 w-4" />
            Iniciar Pomodoro
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10 relative"
            onClick={() => {
              onNavigateToNotifications?.();
              setOpen(false);
            }}
          >
            <Bell className="h-4 w-4" />
            Notificacions
            {state.queueSize > 0 && (
              <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                {state.queueSize}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10"
            onClick={() => {
              onOpenTimeBlocks();
              setOpen(false);
            }}
          >
            <Calendar className="h-4 w-4" />
            Blocs de temps
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10"
            onClick={handleNavigateToPrepareTomorrow}
          >
            <BarChart3 className="h-4 w-4" />
            Preparar demà
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10"
            onClick={() => {
              onOpenReminderConfig();
              setOpen(false);
            }}
          >
            <Settings className="h-4 w-4" />
            Configuració
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};