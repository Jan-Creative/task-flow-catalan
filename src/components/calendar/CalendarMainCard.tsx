import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <Card className="h-full bg-background/40 backdrop-blur-md border-border/20 shadow-xl">
      <CardContent className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="h-10 w-10 rounded-full bg-background/30 hover:bg-background/50 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-xl font-semibold text-foreground min-w-[180px] text-center">
              {getCurrentMonthYear()}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="h-10 w-10 rounded-full bg-background/30 hover:bg-background/50 transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className="rounded-xl bg-background/30 backdrop-blur-sm border-border/30 hover:bg-background/50 transition-all duration-200"
          >
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
    <div className="space-y-4 h-full">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 flex-1">
        {days.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const isCurrentMonth = day.getMonth() === currentMonth;
          
          return (
            <div
              key={index}
              className={cn(
                "aspect-square p-2 rounded-xl transition-all duration-200 cursor-pointer group hover:scale-105",
                isCurrentMonth
                  ? "bg-background/20 hover:bg-background/40 border border-border/10 hover:border-border/30"
                  : "bg-transparent text-muted-foreground/30 hover:text-muted-foreground/60",
                isToday && "bg-primary/20 border-primary/40 text-primary font-bold shadow-lg"
              )}
            >
              <div className="flex flex-col h-full">
                <span className={cn(
                  "text-sm font-medium mb-1",
                  isToday ? "text-primary" : isCurrentMonth ? "text-foreground" : "text-muted-foreground/30"
                )}>
                  {day.getDate()}
                </span>
                
                {/* Event Pills */}
                {isCurrentMonth && Math.random() > 0.7 && (
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 bg-primary/70 rounded-full animate-pulse"></div>
                    {Math.random() > 0.5 && (
                      <div className="h-1.5 bg-secondary/70 rounded-full animate-pulse"></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMainCard;