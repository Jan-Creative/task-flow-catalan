import { useMemo } from "react";
import { format, startOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { ca } from "date-fns/locale";
import { useEvents } from "@/hooks/useEvents";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types/calendar";

interface WeeklyCalendarCardProps {
  currentDate: Date;
  onDateSelect?: (date: Date) => void;
}

const WeeklyCalendarCard = ({ currentDate, onDateSelect }: WeeklyCalendarCardProps) => {
  const { events } = useEvents();
  
  // Get the current week starting from Monday
  const weekStart = useMemo(() => {
    return startOfWeek(currentDate, { weekStartsOn: 1 });
  }, [currentDate]);
  
  // Generate array of 7 days for the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);
  
  // Get events for each day of the week
  const eventsForWeek = useMemo(() => {
    const eventsByDay: Record<string, CalendarEvent[]> = {};
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      eventsByDay[dayKey] = (events || []).filter(event => 
        isSameDay(new Date(event.startDateTime), day)
      );
    });
    
    return eventsByDay;
  }, [weekDays, events]);
  
  const dayLabels = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
  
  return (
    <div className="w-full">
      {/* Current week header */}
      <div className="mb-4 text-center">
        <p className="text-sm text-muted-foreground">
          {format(weekStart, 'd MMM', { locale: ca })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: ca })}
        </p>
      </div>
      
      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsForWeek[dayKey] || [];
          const isCurrentDay = isToday(day);
          const isSelected = isSameDay(day, currentDate);
          
          return (
            <div
              key={dayKey}
              onClick={() => onDateSelect?.(day)}
              className={cn(
                "relative p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md min-h-[80px]",
                isCurrentDay
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : isSelected
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-accent hover:bg-accent/80"
              )}
            >
              {/* Day label and date */}
              <div className="text-center mb-2">
                <div className={cn(
                  "text-xs font-medium",
                  isCurrentDay ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {dayLabels[index]}
                </div>
                <div className={cn(
                  "text-lg font-semibold",
                  isCurrentDay ? "text-primary-foreground" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
              
              {/* Event indicators */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className={cn(
                      "w-full h-1.5 rounded-full opacity-80",
                      isCurrentDay ? "bg-primary-foreground/60" : "bg-primary"
                    )}
                    style={{ backgroundColor: isCurrentDay ? undefined : event.color }}
                    title={event.title}
                  />
                ))}
                
                {/* Show "+X more" if there are more than 3 events */}
                {dayEvents.length > 3 && (
                  <div className={cn(
                    "text-xs text-center mt-1",
                    isCurrentDay ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    +{dayEvents.length - 3} més
                  </div>
                )}
              </div>
              
              {/* Today indicator dot */}
              {isCurrentDay && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Quick navigation hint */}
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground">
          Feu clic en un dia per seleccionar-lo
        </p>
      </div>
    </div>
  );
};

export default WeeklyCalendarCard;