import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import CalendarViewSelector, { CalendarView } from "./CalendarViewSelector";
import WeekView from "./WeekView";
import DayView from "./DayView";

interface CalendarMainCardProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onCreateEvent?: (eventData: { date: Date; time?: string; position?: { x: number; y: number } }) => void;
}

const CalendarMainCard = ({ currentDate, onDateChange, currentView, onViewChange, onCreateEvent }: CalendarMainCardProps) => {
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

  const monthNames = [
    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
    "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
  ];

  const dayNames = [
    "Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"
  ];

  const getHeaderLabel = () => {
    switch (currentView) {
      case "month":
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      
      case "week": {
        // Get week start (Monday) and end (Sunday)
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

  return (
    <Card className="h-full bg-card backdrop-blur-xl shadow-[var(--shadow-elevated)] flex flex-col">
      <CardContent className="p-4 h-full flex flex-col flex-1">
        {/* Calendar Content - Centralized */}
        <div className="flex-1 flex flex-col min-h-0">
          {currentView === "month" && <MonthView currentDate={currentDate} onCreateEvent={onCreateEvent} />}
          {currentView === "week" && <WeekView currentDate={currentDate} onCreateEvent={onCreateEvent} />}
          {currentView === "day" && (
            <DayView 
              currentDate={currentDate} 
              onDateChange={onDateChange}
              onCreateEvent={onCreateEvent}
            />
          )}
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
const MonthView = ({ currentDate, onCreateEvent }: { currentDate: Date; onCreateEvent?: (eventData: { date: Date; time?: string; position?: { x: number; y: number } }) => void }) => {
  const daysOfWeek = ["Dl", "Dm", "Dc", "Dj", "Dv", "Ds", "Dg"];
  
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate start of week (Monday) for the first day of the month
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0 offset
    startDate.setDate(firstDay.getDate() - daysToSubtract);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    // Generate 6 weeks (42 days) to ensure complete month view
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const days = getDaysInMonth();
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  const handleDayDoubleClick = (day: Date, event: React.MouseEvent) => {
    if (onCreateEvent) {
      const rect = event.currentTarget.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      onCreateEvent({ date: day, position });
    }
  };

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
                "border hover:shadow-[var(--shadow-organic)] hover:border-[hsl(var(--border-strong))]",
                isCurrentMonth
                  ? "bg-card hover:bg-secondary-hover transition-all duration-200 border-[hsl(var(--border-calendar))]"
                  : cn(
                      "bg-muted hover:bg-accent transition-all duration-200 opacity-60 border-[hsl(var(--border-subtle))]",
                      "bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_25%,rgba(0,0,0,0.2)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.2)_75%)] bg-[length:6px_6px]"
                    ),
                isToday && "bg-primary-muted hover:bg-primary/20 shadow-[var(--glow-primary)] border-primary/60 hover:border-primary/90"
              )}
              onDoubleClick={(e) => handleDayDoubleClick(day, e)}
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