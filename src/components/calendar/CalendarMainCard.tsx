import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarMainCardProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarMainCard = ({ currentDate, onDateChange }: CalendarMainCardProps) => {
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const monthNames = [
    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
    "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
  ];

  const getCurrentMonthYear = () => {
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <Card className="h-full bg-card backdrop-blur-xl shadow-[var(--shadow-elevated)] flex flex-col">
      <CardContent className="p-4 h-full flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="h-8 w-8 rounded-xl bg-secondary hover:bg-secondary-hover transition-all duration-300 shadow-[var(--shadow-organic)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-lg font-bold text-foreground min-w-[160px] text-center tracking-tight">
              {getCurrentMonthYear()}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="h-8 w-8 rounded-xl bg-secondary hover:bg-secondary-hover transition-all duration-300 shadow-[var(--shadow-organic)]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className="rounded-xl bg-accent hover:bg-accent-hover backdrop-blur-sm transition-all duration-300 text-foreground hover:text-primary font-medium px-4 py-2 text-sm shadow-[var(--shadow-organic)]"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Avui
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col">
          <MonthView currentDate={currentDate} />
        </div>
      </CardContent>
    </Card>
  );
};

// Generate mock events for demonstration
const generateMockEvents = (day: Date) => {
  const events = [];
  const dayNum = day.getDate();
  
  // Add some variety to events based on day using design system colors
  if (dayNum % 7 === 0) {
    events.push({ type: 'meeting', color: 'bg-primary', label: 'Reunió' });
  }
  if (dayNum % 5 === 0) {
    events.push({ type: 'task', color: 'bg-success', label: 'Tasca' });
  }
  if (dayNum % 11 === 0) {
    events.push({ type: 'event', color: 'bg-secondary', label: 'Esdeveniment' });
  }
  if (dayNum % 13 === 0) {
    events.push({ type: 'reminder', color: 'bg-warning', label: 'Recordatori' });
  }
  
  return events.slice(0, 3); // Max 3 events per day
};

// Month View Component
const MonthView = ({ currentDate }: { currentDate: Date }) => {
  const daysOfWeek = ["Dl", "Dm", "Dc", "Dj", "Dv", "Ds", "Dg"];
  
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const days = getDaysInMonth();
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-foreground py-2 tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 grid-rows-6 gap-1 flex-1 rounded-lg p-1">
        {days.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const isCurrentMonth = day.getMonth() === currentMonth;
          const events = isCurrentMonth ? generateMockEvents(day) : [];
          
          return (
            <div
              key={index}
              className={cn(
                "relative p-2 rounded-xl transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col",
                "border-2 hover:shadow-[var(--shadow-organic)] hover:border-black/70",
                isCurrentMonth
                  ? "bg-card hover:bg-secondary-hover transition-all duration-200 border-black/60"
                  : cn(
                      "bg-muted hover:bg-accent transition-all duration-200 opacity-60 border-black/40",
                      "bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_25%,rgba(0,0,0,0.2)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.2)_75%)] bg-[length:6px_6px]"
                    ),
                isToday && "bg-primary-muted hover:bg-primary/20 shadow-[var(--glow-primary)] border-primary/60 hover:border-primary/90"
              )}
            >
              <div className="flex flex-col h-full">
                <span className={cn(
                  "text-sm font-bold mb-2 tracking-tight",
                  isToday 
                    ? "text-primary-foreground" 
                    : isCurrentMonth 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                )}>
                  {day.getDate()}
                </span>
                
                {/* Event Pills */}
                <div className="flex-1 space-y-1.5">
                  {events.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={cn(
                        "h-2 rounded-full transition-all duration-200 group-hover:scale-105",
                        event.color,
                        "shadow-sm relative overflow-hidden"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50" />
                    </div>
                  ))}
                  
                  {/* Event count indicator for more than 3 events */}
                  {events.length === 3 && isCurrentMonth && (
                    <div className="text-xs text-muted-foreground/70 font-medium pt-1">
                      +2 més
                    </div>
                  )}
                </div>
                
                {/* Hover overlay effect */}
                <div className="absolute inset-0 bg-[var(--gradient-glass)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMainCard;