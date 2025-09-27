import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar, 
  CheckSquare, 
  Zap 
} from "lucide-react";

interface IPhoneQuickActionsBarProps {
  onCreateTask?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToTasks?: () => void;
  onNavigateToPrepareTomorrow?: () => void;
}

export const IPhoneQuickActionsBar = ({
  onCreateTask,
  onNavigateToCalendar,
  onNavigateToTasks,
  onNavigateToPrepareTomorrow
}: IPhoneQuickActionsBarProps) => {
  return (
    <div className="iphone-card bg-accent/20 border border-accent/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Accions ràpides</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={onCreateTask}
          className="h-16 flex-col gap-2 bg-primary hover:bg-primary/90"
          size="lg"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Nova tasca</span>
        </Button>
        
        <Button 
          onClick={onNavigateToCalendar}
          variant="outline" 
          className="h-16 flex-col gap-2 border-accent/50 hover:bg-accent/30"
          size="lg"
        >
          <Calendar className="h-6 w-6" />
          <span className="text-sm font-medium">Calendari</span>
        </Button>
        
        <Button 
          onClick={onNavigateToTasks}
          variant="outline" 
          className="h-16 flex-col gap-2 border-accent/50 hover:bg-accent/30"
          size="lg"
        >
          <CheckSquare className="h-6 w-6" />
          <span className="text-sm font-medium">Totes les tasques</span>
        </Button>
        
        <Button 
          onClick={onNavigateToPrepareTomorrow}
          variant="outline" 
          className="h-16 flex-col gap-2 border-accent/50 hover:bg-accent/30"
          size="lg"
        >
          <Zap className="h-6 w-6" />
          <span className="text-sm font-medium">Preparar demà</span>
        </Button>
      </div>
    </div>
  );
};