import { Grid3X3, Calendar as CalendarIcon, Clock, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week" | "day" | "agenda";

interface ViewSwitcherCardProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const ViewSwitcherCard = ({ currentView, onViewChange }: ViewSwitcherCardProps) => {
  const viewOptions = [
    { id: "month", label: "Mes", icon: Grid3X3, description: "Vista mensual completa" },
    { id: "week", label: "Setmana", icon: CalendarIcon, description: "Vista setmanal" },
    { id: "day", label: "Dia", icon: Clock, description: "Vista diària" },
    { id: "agenda", label: "Agenda", icon: List, description: "Llista d'esdeveniments" },
  ];

  return (
    <Card className="h-full bg-background/40 backdrop-blur-md border-border/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Visualització</CardTitle>
        <CardDescription>Canvia la vista del calendari</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {viewOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.id}
              variant="ghost"
              onClick={() => onViewChange(option.id as CalendarView)}
              className={cn(
                "w-full justify-start rounded-xl transition-all duration-200 p-3 h-auto",
                currentView === option.id
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/20"
              )}
            >
              <Icon className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs opacity-70">{option.description}</div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ViewSwitcherCard;