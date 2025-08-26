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
    <Card className="h-full bg-gradient-to-br from-background/10 to-background/5 backdrop-blur-xl border-border/10 shadow-2xl shadow-black/20">
      <CardContent className="p-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="h-12 w-12 rounded-2xl bg-muted/20 hover:bg-muted/40 border border-border/10 hover:border-border/30 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ChevronLeft className="h-5 w-5 text-foreground/80" />
            </Button>
            
            <h2 className="text-2xl font-bold text-foreground min-w-[200px] text-center tracking-tight">
              {getCurrentMonthYear()}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="h-12 w-12 rounded-2xl bg-muted/20 hover:bg-muted/40 border border-border/10 hover:border-border/30 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ChevronRight className="h-5 w-5 text-foreground/80" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className="rounded-2xl bg-primary/10 backdrop-blur-sm border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 text-primary hover:text-primary font-medium px-6 py-3 shadow-lg"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Avui
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1">
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
  
  // Add some variety to events based on day
  if (dayNum % 7 === 0) {
    events.push({ type: 'meeting', color: 'bg-blue-500', label: 'Reunió' });
  }
  if (dayNum % 5 === 0) {
    events.push({ type: 'task', color: 'bg-green-500', label: 'Tasca' });
  }
  if (dayNum % 11 === 0) {
    events.push({ type: 'event', color: 'bg-purple-500', label: 'Esdeveniment' });
  }
  if (dayNum % 13 === 0) {
    events.push({ type: 'reminder', color: 'bg-orange-500', label: 'Recordatori' });
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
    <div className="space-y-6 h-full">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-3">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-bold text-muted-foreground py-3 tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3 flex-1">
        {days.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const isCurrentMonth = day.getMonth() === currentMonth;
          const events = isCurrentMonth ? generateMockEvents(day) : [];
          
          return (
            <div
              key={index}
              className={cn(
                "relative aspect-square p-3 rounded-2xl transition-all duration-300 cursor-pointer group overflow-hidden",
                "border-2 hover:shadow-lg hover:shadow-black/20",
                isCurrentMonth
                  ? "bg-muted/20 hover:bg-muted/40 border-border/20 hover:border-border/40 hover:scale-[1.02]"
                  : cn(
                      "bg-gradient-to-br from-muted/5 to-muted/10 border-border/10 hover:border-border/20",
                      "bg-[linear-gradient(45deg,transparent_25%,hsl(var(--border))_25%,hsl(var(--border))_50%,transparent_50%,transparent_75%,hsl(var(--border))_75%)] bg-[length:8px_8px] opacity-30"
                    ),
                isToday && "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/50 shadow-lg shadow-primary/20 ring-2 ring-primary/30"
              )}
            >
              <div className="flex flex-col h-full">
                <span className={cn(
                  "text-sm font-bold mb-2 tracking-tight",
                  isToday 
                    ? "text-primary" 
                    : isCurrentMonth 
                      ? "text-foreground" 
                      : "text-muted-foreground/40"
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
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMainCard;