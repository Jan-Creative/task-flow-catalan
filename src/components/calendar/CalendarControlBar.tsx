import React from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, Calendar, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarView } from "./CalendarViewSelector";

interface CalendarControlBarProps {
  className?: string;
  onCreateEvent?: () => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const CalendarControlBar: React.FC<CalendarControlBarProps> = ({
  className,
  onCreateEvent,
  currentDate,
  onDateChange,
  currentView,
  onViewChange
}) => {
  const monthNames = [
    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
    "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
  ];

  const dayNames = [
    "Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"
  ];

  const navigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case "month":
        if (direction === "prev") {
          newDate.setMonth(currentDate.getMonth() - 1);
        } else {
          newDate.setMonth(currentDate.getMonth() + 1);
        }
        break;
      case "week":
        if (direction === "prev") {
          newDate.setDate(currentDate.getDate() - 7);
        } else {
          newDate.setDate(currentDate.getDate() + 7);
        }
        break;
      case "day":
        if (direction === "prev") {
          newDate.setDate(currentDate.getDate() - 1);
        } else {
          newDate.setDate(currentDate.getDate() + 1);
        }
        break;
    }
    
    onDateChange(newDate);
  };

  const getHeaderLabel = () => {
    switch (currentView) {
      case "month":
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      
      case "week": {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const startDay = startOfWeek.getDate();
        const endDay = endOfWeek.getDate();
        const startMonth = monthNames[startOfWeek.getMonth()];
        const endMonth = monthNames[endOfWeek.getMonth()];
        const year = startOfWeek.getFullYear();
        
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startDay}–${endDay} ${startMonth} ${year}`;
        } else {
          return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
        }
      }
      
      case "day": {
        const dayName = dayNames[currentDate.getDay()];
        const day = currentDate.getDate();
        const month = monthNames[currentDate.getMonth()];
        const year = currentDate.getFullYear();
        return `${dayName}, ${day} ${month} ${year}`;
      }
    }
  };

  const viewOptions = [
    { value: "month", label: "Mes", icon: Calendar },
    { value: "week", label: "Setmana", icon: CalendarDays },
    { value: "day", label: "Dia", icon: Clock }
  ];

  const currentViewOption = viewOptions.find(option => option.value === currentView);

  return (
    <Card 
      className={cn(
        "border-0 shadow-glass",
        "px-4 py-3 flex items-center justify-between gap-4",
        "animate-fade-in",
        className
      )}
    >
      {/* Esquerra: Navegació + Selector de data */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("prev")}
            className="h-8 w-8 rounded-xl bg-secondary hover:bg-secondary-hover transition-all duration-300 shadow-[var(--shadow-organic)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-base font-bold text-foreground min-w-[180px] text-center tracking-tight">
            {getHeaderLabel()}
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("next")}
            className="h-8 w-8 rounded-xl bg-secondary hover:bg-secondary-hover transition-all duration-300 shadow-[var(--shadow-organic)]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(new Date())}
          className="rounded-xl bg-accent hover:bg-accent-hover backdrop-blur-sm transition-all duration-300 text-foreground hover:text-primary font-medium px-3 py-2 text-sm shadow-[var(--shadow-organic)]"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Avui
        </Button>
      </div>

      {/* Dreta: Selector de vista + Nou esdeveniment */}
      <div className="flex items-center gap-3">
        <Select value={currentView} onValueChange={(value: CalendarView) => onViewChange(value)}>
          <SelectTrigger className="w-[120px] h-8 rounded-xl bg-secondary/50 backdrop-blur-sm shadow-[var(--shadow-organic)] border-0">
            <div className="flex items-center gap-2">
              {currentViewOption && <currentViewOption.icon className="h-3.5 w-3.5" />}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {viewOptions.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Button
          onClick={onCreateEvent}
          className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md rounded-xl"
          size="sm"
        >
          <CalendarPlus className="h-4 w-4 mr-2" />
          Nou esdeveniment
        </Button>
      </div>
    </Card>
  );
};

export default CalendarControlBar;