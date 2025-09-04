import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Moon, Clock, Bell } from "lucide-react";
import { DailyReminderConfigModal } from "@/components/prepare-tomorrow/DailyReminderConfigModal";
import { TodayTimeBlocksModal } from "./TodayTimeBlocksModal";

interface ConfigurationMenuProps {
  onNavigateToPrepareTomorrow?: () => void;
}

export const ConfigurationMenu = ({ onNavigateToPrepareTomorrow }: ConfigurationMenuProps) => {
  const [showTimeBlocks, setShowTimeBlocks] = useState(false);
  const [showReminderConfig, setShowReminderConfig] = useState(false);

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
        <DropdownMenuContent align="end" className="w-56 bg-background border shadow-md z-50">
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setShowReminderConfig(true)}
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
            onClick={() => setShowTimeBlocks(true)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Blocs de Temps d'Avui
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DailyReminderConfigModal open={showReminderConfig} onOpenChange={setShowReminderConfig} />

      <TodayTimeBlocksModal 
        open={showTimeBlocks}
        onClose={() => setShowTimeBlocks(false)}
      />
    </>
  );
};