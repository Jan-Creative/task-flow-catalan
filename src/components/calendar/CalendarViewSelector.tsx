import { Calendar, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarView = "month" | "week" | "day";

interface CalendarViewSelectorProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const CalendarViewSelector = ({ currentView, onViewChange }: CalendarViewSelectorProps) => {
  const viewOptions: Array<{
    id: CalendarView;
    label: string;
    icon: React.ComponentType<any>;
  }> = [
    { id: "month", label: "Mes", icon: Calendar },
    { id: "week", label: "Setmana", icon: CalendarDays },
    { id: "day", label: "Dia", icon: Clock }
  ];

  return (
    <div className="flex bg-secondary/50 backdrop-blur-sm rounded-xl p-1 shadow-[var(--shadow-organic)]">
      {viewOptions.map((option) => {
        const Icon = option.icon;
        const isActive = currentView === option.id;
        
        return (
          <Button
            key={option.id}
            variant="ghost"
            size="sm"
            onClick={() => onViewChange(option.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-2",
              isActive
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-organic)] hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default CalendarViewSelector;