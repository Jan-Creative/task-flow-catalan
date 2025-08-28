import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MiniCalendarSidebarProps {
  currentDate: Date;
  onDateSelect?: (date: Date) => void;
}

const MiniCalendarSidebar = ({ currentDate, onDateSelect }: MiniCalendarSidebarProps) => {
  const [displayDate, setDisplayDate] = useState(new Date(currentDate));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(displayDate);
    newDate.setMonth(displayDate.getMonth() + (direction === 'next' ? 1 : -1));
    setDisplayDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  const days = getDaysInMonth(displayDate);
  const today = new Date();
  const currentMonth = displayDate.getMonth();

  // Funció fixa per esdeveniments (evita parpadeig amb Math.random)
  const hasEvents = (date: Date) => {
    const day = date.getDate();
    // Dates fixes amb esdeveniments (no canviaran amb cada render)
    return [3, 7, 12, 15, 18, 23, 28].includes(day);
  };

  return (
    <Card className="h-[280px] flex flex-col bg-card shadow-[var(--shadow-card)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground">
            {displayDate.toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-6 w-6 p-0 hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-6 w-6 p-0 hover:bg-accent transition-colors"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        {/* Dies de la setmana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'].map((day) => (
            <div key={day} className="text-xs text-muted-foreground text-center h-6 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendari */}
        <div className="grid grid-cols-7 gap-0.5 flex-1 rounded-md p-1">
          {days.slice(0, 35).map((day, index) => {
            const isToday = day.toDateString() === today.toDateString();
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isSelected = day.toDateString() === currentDate.toDateString();
            const dayHasEvents = hasEvents(day);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "relative h-8 text-xs rounded-md transition-all duration-200 hover:bg-accent/80 hover:shadow-sm",
                  isCurrentMonth 
                    ? "text-foreground hover:text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground",
                  isToday && "bg-primary text-primary-foreground font-medium shadow-md",
                  isSelected && !isToday && "bg-accent text-accent-foreground font-medium shadow-sm"
                )}
              >
                <span className="relative z-10">{day.getDate()}</span>
                {dayHasEvents && !isToday && (
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full opacity-80" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MiniCalendarSidebar;