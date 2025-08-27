import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedMiniCalendarCardProps {
  currentDate: Date;
  onDateSelect?: (date: Date) => void;
}

const EnhancedMiniCalendarCard = ({ currentDate, onDateSelect }: EnhancedMiniCalendarCardProps) => {
  const [displayDate, setDisplayDate] = useState(currentDate);
  const today = new Date();
  const month = displayDate.getMonth();
  const year = displayDate.getFullYear();
  
  const getDaysInMonth = () => {
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setDisplayDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  const days = getDaysInMonth();
  const daysOfWeek = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  // Mock events for visual indicators
  const hasEvents = (date: Date) => {
    return Math.random() > 0.8; // 20% chance of having events
  };

  return (
    <Card className="h-full bg-gray-950/95 backdrop-blur-xl border-gray-800/50 shadow-2xl">
      <CardHeader className="pb-1 px-3 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm text-white">Navegació</CardTitle>
            <CardDescription className="text-xs text-gray-400">
              {displayDate.toLocaleDateString('ca-ES', { month: 'short', year: 'numeric' })}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="grid grid-cols-7 gap-1">
          {/* Days of week header */}
          {daysOfWeek.map((day, i) => (
            <div key={i} className="text-center text-xs font-semibold text-gray-500 py-1">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString();
            const isCurrentMonth = day.getMonth() === month;
            const isSelected = day.toDateString() === currentDate.toDateString();
            const hasEvent = hasEvents(day);
            
            return (
              <div
                key={i}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "relative aspect-square flex items-center justify-center rounded-md text-xs cursor-pointer transition-all duration-300",
                  "hover:scale-105 hover:bg-white/10",
                  isCurrentMonth
                    ? isToday
                      ? "bg-primary text-primary-foreground font-bold shadow-lg ring-2 ring-primary/30"
                      : isSelected
                      ? "bg-white/20 text-white font-semibold border border-white/30 shadow-md"
                      : "text-white font-medium hover:text-white"
                    : "text-gray-600 hover:text-gray-400"
                )}
              >
                {day.getDate()}
                {hasEvent && isCurrentMonth && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMiniCalendarCard;