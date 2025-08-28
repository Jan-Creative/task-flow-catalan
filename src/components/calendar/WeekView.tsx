import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { DraggableEvent } from "./DraggableEvent";
import { MagneticDropZone } from './MagneticDropZone';
import { DragGridOverlay } from './DropZone';
import { CalendarEvent, EventDragCallbacks } from "@/types/calendar";
import { isDragAndDropEnabled } from "@/config/appConfig";

interface WeekViewProps {
  currentDate: Date;
  onCreateEvent?: (eventData: { date: Date; time?: string; position?: { x: number; y: number } }) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  dragCallbacks?: EventDragCallbacks;
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

const WeekView = ({ currentDate, onCreateEvent, onEditEvent, dragCallbacks }: WeekViewProps) => {
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00
  const daysOfWeek = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte", "Diumenge"];
  const [isDragging, setIsDragging] = useState(false);
  const [magneticDropZone, setMagneticDropZone] = useState<any>(null);
  
  // Get the start of the week (Monday)
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDays = getWeekDays();
  const today = new Date();
  
  // Calendar events hook
  const { getEventsForWeek, callbacks: defaultCallbacks } = useCalendarEvents();
  const eventCallbacks = dragCallbacks || defaultCallbacks;

  // Get week events using the hook
  const weekEvents = useMemo(() => {
    const startOfWeek = weekDays[0];
    return getEventsForWeek(startOfWeek);
  }, [weekDays, getEventsForWeek]);
  
  // Group events by day index
  const eventsByDay = useMemo(() => {
    const grouped: { [key: number]: CalendarEvent[] } = {};
    weekDays.forEach((day, index) => {
      grouped[index] = weekEvents.filter(event => 
        event.startDateTime.toDateString() === day.toDateString()
      );
    });
    return grouped;
  }, [weekEvents, weekDays]);

  const getEventPosition = (event: CalendarEvent) => {
    const startHour = event.startDateTime.getHours();
    const startMinutes = event.startDateTime.getMinutes();
    const endHour = event.endDateTime.getHours();
    const endMinutes = event.endDateTime.getMinutes();
    
    const startPosition = ((startHour - 8) * 60 + startMinutes) / 60; // Hours from 8:00
    const duration = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60;
    
    return {
      top: `${startPosition * 4}rem`, // 4rem per hour
      height: `${Math.max(duration * 4, 1)}rem` // Minimum 1rem height
    };
  };
  
  // Grid information for drag calculations - simplified for hour-only slots
  const gridInfo = useMemo(() => ({
    cellWidth: 160, // Fixed column width for consistent grid
    cellHeight: 64, // 4rem = 64px per hour
    columns: 7,
    startHour: 8
  }), []);

  const handleTimeSlotDoubleClick = (day: Date, hour: number) => {
    if (onCreateEvent) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      onCreateEvent({ date: day, time: timeString });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Week Days Header */}
      <div className="grid grid-cols-8 gap-2 mb-3">
        {/* Empty cell for time column */}
        <div className="bg-card p-3 rounded-lg"></div>
        
        {/* Day headers */}
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          
          return (
            <div
              key={index}
              className={cn(
                "bg-card p-3 text-center transition-colors rounded-lg border border-[hsl(var(--border-calendar))]",
                isToday && "bg-primary/10 border-primary border"
              )}
            >
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {daysOfWeek[index]}
              </div>
              <div className={cn(
                "text-lg font-bold",
                isToday 
                  ? "text-primary" 
                  : "text-foreground"
              )}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline and Events */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-2">
          {/* Time column */}
          <div className="bg-card rounded-lg border border-[hsl(var(--border-calendar))]">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 px-3 py-2 text-xs text-muted-foreground border-t border-[hsl(var(--border-subtle))] flex items-start first:border-t-0"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dayEvents = eventsByDay[dayIndex] || [];
            
            return (
              <div key={dayIndex} className="bg-card relative rounded-lg border border-[hsl(var(--border-calendar))]">
                {/* Hour slots with integrated magnetic zones */}
                {hours.map((hour) => (
                  isDragAndDropEnabled() ? (
                    <MagneticDropZone
                      key={`${dayIndex}-${hour}`}
                      timeSlot={day}
                      hour={hour}
                      dayIndex={dayIndex}
                      isWeekView={true}
                      cellWidth={gridInfo.cellWidth}
                      cellHeight={gridInfo.cellHeight}
                      onMagneticHover={setMagneticDropZone}
                      className="h-16 border-t border-[hsl(var(--border-subtle))] hover:bg-accent/10 transition-colors cursor-pointer first:border-t-0"
                      onDoubleClick={() => handleTimeSlotDoubleClick(day, hour)}
                    />
                  ) : (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className="h-16 border-t border-[hsl(var(--border-subtle))] hover:bg-accent/10 transition-colors cursor-pointer first:border-t-0"
                      onDoubleClick={() => handleTimeSlotDoubleClick(day, hour)}
                    />
                  )
                ))}

                {/* Draggable Events */}
                {dayEvents.map((event) => {
                  const position = getEventPosition(event);
                  
                  return (
                    <DraggableEvent
                      key={event.id}
                      event={event}
                      position={{ ...position, left: '0.25rem', right: '0.25rem' }}
                      viewType="week"
                      gridInfo={gridInfo}
                      disabled={!isDragAndDropEnabled()}
                      onDragStart={() => setIsDragging(true)}
                      onDragStop={(draggedEvent, dropZone) => {
                        setIsDragging(false);
                        setMagneticDropZone(null);
                        if (dropZone.isValid && dropZone.date) {
                          // Calculate new end time maintaining duration
                          const duration = draggedEvent.endDateTime.getTime() - draggedEvent.startDateTime.getTime();
                          const newEndDateTime = new Date(dropZone.date.getTime() + duration);
                          
                          eventCallbacks.onEventMove(draggedEvent.id, dropZone.date, newEndDateTime);
                        }
                      }}
                      onDoubleClick={onEditEvent}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag Grid Overlay */}
      {isDragAndDropEnabled() && (
        <DragGridOverlay
          isVisible={isDragging}
          viewType="week"
          gridInfo={{
            cellWidth: gridInfo.cellWidth,
            cellHeight: gridInfo.cellHeight,
            columns: 7,
            rows: 15
          }}
        />
      )}

      {/* Magnetic Drop Zone Preview */}
      {magneticDropZone && (
        <div className="fixed top-4 right-4 z-50 bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="text-sm font-medium">
            🧲 {magneticDropZone.time} - {magneticDropZone.date.toLocaleDateString('ca-ES', { weekday: 'short', day: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekView;