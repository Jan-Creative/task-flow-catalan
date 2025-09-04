
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Moon, Clock, Bell } from "lucide-react";



interface ConfigurationMenuProps {
  onNavigateToPrepareTomorrow?: () => void;
  onOpenReminderConfig?: () => void;
  onOpenTodayTimeBlocks?: () => void;
}

export const ConfigurationMenu = ({ onNavigateToPrepareTomorrow, onOpenReminderConfig, onOpenTodayTimeBlocks }: ConfigurationMenuProps) => {

  const handlePrepareTomorrow = () => {
    if (onNavigateToPrepareTomorrow) {
      onNavigateToPrepareTomorrow();
    } else {
      window.location.href = '/prepare-tomorrow';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-accent"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border shadow-md z-50" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setTimeout(() => onOpenReminderConfig?.(), 10)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Configurar Recordatoris
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={handlePrepareTomorrow}
          >
            <Moon className="h-4 w-4 mr-2" />
            Preparar Dia de Demà
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setTimeout(() => onOpenTodayTimeBlocks?.(), 10)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Blocs de Temps d'Avui
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      

    </>
  );
};