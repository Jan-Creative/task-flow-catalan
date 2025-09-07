import { useMemo, useState } from "react";
import { format, startOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { ca } from "date-fns/locale";
import { useEvents } from "@/hooks/useEvents";
import { useOptimizedPropertyLabels } from "@/hooks/useOptimizedPropertyLabels";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types/calendar";
import { Tasca } from "@/types";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CheckSquare } from "lucide-react";

interface WeeklyCalendarCardProps {
  currentDate: Date;
  onDateSelect?: (date: Date) => void;
  tasks?: Tasca[];
}

const WeeklyCalendarCard = ({ currentDate, onDateSelect, tasks = [] }: WeeklyCalendarCardProps) => {
  const { events } = useEvents();
  const { getStatusLabel } = useOptimizedPropertyLabels();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
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

  // Get tasks for each day of the week
  const tasksForWeek = useMemo(() => {
    const tasksByDay: Record<string, Tasca[]> = {};
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      tasksByDay[dayKey] = (tasks || []).filter(task => {
        if (!task.due_date) return false;
        return isSameDay(new Date(task.due_date), day);
      });
    });
    
    return tasksByDay;
  }, [weekDays, tasks]);

  // Get data for selected date
  const selectedDateData = useMemo(() => {
    if (!selectedDate) return { events: [], tasks: [] };
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return {
      events: eventsForWeek[dateKey] || [],
      tasks: tasksForWeek[dateKey] || []
    };
  }, [selectedDate, eventsForWeek, tasksForWeek]);

  // Handle day selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(isSameDay(date, selectedDate || new Date('1970-01-01')) ? null : date);
    onDateSelect?.(date);
  };
  
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
          const dayTasks = tasksForWeek[dayKey] || [];
          const isCurrentDay = isToday(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const totalItems = dayEvents.length + dayTasks.length;
          
          return (
            <div
              key={dayKey}
              onClick={() => handleDateSelect(day)}
              className={cn(
                "relative p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md min-h-[80px]",
                isCurrentDay
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : isSelected
                  ? "bg-primary/20 text-primary border-2 border-primary/50"
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
              
              {/* Event and task indicators */}
              <div className="space-y-1">
                {/* Event indicators */}
                {dayEvents.slice(0, 2).map((event, eventIndex) => (
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
                
                {/* Task indicators */}
                {dayTasks.slice(0, 2 - dayEvents.slice(0, 2).length).map((task, taskIndex) => (
                  <div
                    key={task.id}
                    className={cn(
                      "w-full h-1.5 rounded-full opacity-60",
                      isCurrentDay ? "bg-primary-foreground/40" : "bg-muted-foreground"
                    )}
                    title={task.title}
                  />
                ))}
                
                {/* Show "+X more" if there are more items */}
                {totalItems > 2 && (
                  <div className={cn(
                    "text-xs text-center mt-1",
                    isCurrentDay ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    +{totalItems - 2} més
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
      
      {/* Selected day details */}
      {selectedDate && (
        <div className="mt-4 p-4 bg-accent/30 rounded-xl border border-primary/20 animate-accordion-down">
          <div className="mb-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {format(selectedDate, 'EEEE, d MMMM', { locale: ca })}
            </h4>
          </div>
          
          <div className="space-y-4">
            {/* Events section */}
            {selectedDateData.events.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Esdeveniments ({selectedDateData.events.length})
                </h5>
                <div className="space-y-2">
                  {selectedDateData.events.slice(0, 4).map((event) => (
                    <div key={event.id} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: event.color }}
                      />
                      <span className="font-medium truncate">{event.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(event.startDateTime), 'HH:mm', { locale: ca })}
                      </span>
                    </div>
                  ))}
                  {selectedDateData.events.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      +{selectedDateData.events.length - 4} esdeveniments més
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Tasks section */}
            {selectedDateData.tasks.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <CheckSquare className="h-3 w-3" />
                  Tasques ({selectedDateData.tasks.length})
                </h5>
                <div className="space-y-2">
                  {selectedDateData.tasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {getStatusLabel(task.status)}
                      </Badge>
                      <span className="truncate flex-1">{task.title}</span>
                      {task.priority && (
                        <PriorityBadge priority={task.priority} size="sm" className="ml-auto" />
                      )}
                    </div>
                  ))}
                  {selectedDateData.tasks.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      +{selectedDateData.tasks.length - 4} tasques més
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {selectedDateData.events.length === 0 && selectedDateData.tasks.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No hi ha esdeveniments ni tasques per aquest dia
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Quick navigation hint */}
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground">
          {selectedDate ? 'Feu clic en un altre dia o al mateix per canviar la selecció' : 'Feu clic en un dia per veure els detalls'}
        </p>
      </div>
    </div>
  );
};

export default WeeklyCalendarCard;