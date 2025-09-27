import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, 
  AlertTriangle, 
  Plus, 
  Sparkles 
} from "lucide-react";

interface IPhoneEmptyStateProps {
  type: 'today-tasks' | 'urgent-tasks' | 'general';
  onCreateTask?: () => void;
  title?: string;
  description?: string;
}

export const IPhoneEmptyState = ({ 
  type, 
  onCreateTask, 
  title, 
  description 
}: IPhoneEmptyStateProps) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'today-tasks':
        return {
          icon: CheckSquare,
          title: title || "Perfecte! Sense tasques pendents",
          description: description || "Has completat totes les tasques d'avui. Pots afegir-ne més o planificar per demà.",
          actionText: "Crear tasca",
          secondaryText: "Preparar demà",
          gradient: "from-success/20 to-primary/20"
        };
      case 'urgent-tasks':
        return {
          icon: Sparkles,
          title: title || "Tot sota control!",
          description: description || "No tens tasques urgents. Bon treball mantenint les coses organitzades.",
          actionText: "Crear tasca",
          secondaryText: "Veure totes",
          gradient: "from-primary/20 to-accent/20"
        };
      default:
        return {
          icon: Plus,
          title: title || "Comença a organitzar-te",
          description: description || "Crea la teva primera tasca per començar a ser més productiu.",
          actionText: "Crear tasca",
          secondaryText: "Explorar",
          gradient: "from-primary/20 to-success/20"
        };
    }
  };

  const config = getEmptyStateConfig();
  const IconComponent = config.icon;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.gradient} p-8 text-center`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/10 rounded-full blur-lg" />
      
      <div className="relative z-10 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
            <IconComponent className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">
            {config.title}
          </h3>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto">
            {config.description}
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={onCreateTask}
            size="lg"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            {config.actionText}
          </Button>
          
          <Button 
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            {config.secondaryText}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface IPhoneEmptyTasksProps {
  onCreateTask?: () => void;
}

interface IPhoneEmptyUrgentTasksProps {
  onCreateTask?: () => void;
}

export const IPhoneEmptyTasks = ({ onCreateTask }: IPhoneEmptyTasksProps) => (
  <IPhoneEmptyState 
    type="today-tasks" 
    onCreateTask={onCreateTask} 
  />
);

export const IPhoneEmptyUrgentTasks = ({ onCreateTask }: IPhoneEmptyUrgentTasksProps) => (
  <IPhoneEmptyState 
    type="urgent-tasks" 
    onCreateTask={onCreateTask} 
  />
);