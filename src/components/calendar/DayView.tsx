import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { DraggableEvent } from "./DraggableEvent";
import { MagneticDropZone } from './MagneticDropZone';
import { DragGridOverlay } from './DropZone';
import { CalendarEvent, EventDragCallbacks } from "@/types/calendar";

interface DayViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onCreateEvent?: (eventData: { date: Date; time?: string; position?: { x: number; y: number } }) => void;
  dragCallbacks?: EventDragCallbacks;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  color: string;
  location?: string;
}

const DayView = ({ currentDate, onDateChange, onCreateEvent, dragCallbacks }: DayViewProps) => {
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();
  const [isDragging, setIsDragging] = useState(false);
  const [magneticDropZone, setMagneticDropZone] = useState<any>(null);
  
  // Calendar events hook
  const { getEventsForDate, callbacks: defaultCallbacks } = useCalendarEvents();
  const eventCallbacks = dragCallbacks || defaultCallbacks;
  
  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    onDateChange(newDate);
  };

  const formatDate = (date: Date) => {
    const daysOfWeek = ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"];
    const months = [
      "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
      "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
    ];
    
    return `${daysOfWeek[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  // Get events for the current day
  const dayEvents = useMemo(() => {
    return getEventsForDate(currentDate);
  }, [currentDate, getEventsForDate]);

  const getEventPosition = (event: CalendarEvent) => {
    const startHour = event.startDateTime.getHours();
    const startMinutes = event.startDateTime.getMinutes();
    const endHour = event.endDateTime.getHours();
    const endMinutes = event.endDateTime.getMinutes();
    
    const startPosition = ((startHour - 8) * 60 + startMinutes) / 60; // Hours from 8:00
    const duration = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60;
    
    return {
      top: `${startPosition * 6}rem`, // 6rem per hour for more space
      height: `${Math.max(duration * 6, 1.5)}rem` // Minimum height
    };
  };
  
  // Grid information for drag calculations - simplified for hour-only slots
  const gridInfo = useMemo(() => ({
    cellWidth: 0, // Day view doesn't use horizontal movement
    cellHeight: 96, // 6rem = 96px per hour
    columns: 1,
    startHour: 8
  }), []);

  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    if (currentHour < 8 || currentHour > 22) return null;
    
    const position = ((currentHour - 8) * 60 + currentMinutes) / 60;
    return `${position * 6}rem`;
  };

  const handleTimeSlotDoubleClick = (hour: number) => {
    if (onCreateEvent) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      onCreateEvent({ date: currentDate, time: timeString });
    }
  };

  const currentTimePosition = isToday ? getCurrentTimePosition() : null;

  return (
    <div className="flex flex-col h-full">
      {/* Day Header */}
      <div className="flex items-center justify-between mb-4 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-[hsl(var(--border-calendar))]">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDay("prev")}
            className="h-8 w-8 rounded-xl hover:bg-secondary border border-[hsl(var(--border-medium))]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h2 className={cn(
              "text-lg font-bold tracking-tight",
              isToday && "text-primary"
            )}>
              {formatDate(currentDate)}
            </h2>
            {isToday && (
              <span className="text-xs text-primary font-medium">Avui</span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDay("next")}
            className="h-8 w-8 rounded-xl hover:bg-secondary border border-[hsl(var(--border-medium))]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(new Date())}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Anar a avui
        </Button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 flex-shrink-0 bg-card rounded-lg border border-[hsl(var(--border-calendar))] mr-2">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-24 px-3 py-2 text-sm text-muted-foreground border-t border-[hsl(var(--border-subtle))] flex items-start first:border-t-0"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="flex-1 relative bg-card/30 rounded-xl border border-[hsl(var(--border-calendar))]">
            {/* Hour slots with integrated magnetic zones */}
            {hours.map((hour) => (
              <MagneticDropZone
                key={hour}
                timeSlot={currentDate}
                hour={hour}
                isWeekView={false}
                cellWidth={0}
                cellHeight={96}
                onMagneticHover={setMagneticDropZone}
                className="h-24 border-t border-[hsl(var(--border-medium))] hover:bg-accent/10 transition-colors cursor-pointer relative first:border-t-0"
                onDoubleClick={() => handleTimeSlotDoubleClick(hour)}
              >
                {/* Hour indicator */}
                <div className="absolute top-12 left-0 right-0 h-px bg-[hsl(var(--border-subtle))] opacity-30" />
              </MagneticDropZone>
            ))}
            
            {/* Current time indicator */}
            {currentTimePosition && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center"
                style={{ top: currentTimePosition }}
              >
                <div className="w-3 h-3 bg-primary rounded-full border-2 border-white shadow-md" />
                <div className="flex-1 h-0.5 bg-primary/60" />
              </div>
            )}
            
            {/* Draggable Events */}
            {dayEvents.map((event) => {
              const position = getEventPosition(event);
              
              return (
                <DraggableEvent
                  key={event.id}
                  event={event}
                  position={{ ...position, left: '0.5rem', right: '0.5rem' }}
                  viewType="day"
                  gridInfo={gridInfo}
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
                />
              );
            })}
            
            {/* Empty state */}
            {dayEvents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-sm font-medium mb-1">No hi ha esdeveniments</div>
                  <div className="text-xs">Fes clic per afegir un nou esdeveniment</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag Grid Overlay */}
        <DragGridOverlay
          isVisible={isDragging}
          viewType="day"
          gridInfo={{
            cellWidth: gridInfo.cellWidth,
            cellHeight: gridInfo.cellHeight,
            columns: 1,
            rows: 15
          }}
        />

        {/* Magnetic Drop Zone Preview */}
        {magneticDropZone && (
          <div className="fixed top-4 right-4 z-50 bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="text-sm font-medium">
              🧲 {magneticDropZone.time}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;