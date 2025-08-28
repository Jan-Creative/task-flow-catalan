import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { DraggableEvent } from "./DraggableEvent";
import { MagneticDropZone } from './MagneticDropZone';
import { DragGridOverlay } from './DropZone';
import { CalendarEvent, EventDragCallbacks } from "@/types/calendar";
import { isDragAndDropEnabled } from "@/config/appConfig";

interface DayViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onCreateEvent?: (eventData: { date: Date; time?: string; position?: { x: number; y: number } }) => void;
  onEditEvent?: (event: CalendarEvent) => void;
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

const DayView = ({ currentDate, onDateChange, onCreateEvent, onEditEvent, dragCallbacks }: DayViewProps) => {
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
      top: `${startPosition * 4}rem`, // 4rem per hour (h-16)
      height: `${Math.max(duration * 4, 1)}rem` // Minimum height
    };
  };
  
  // Grid information for drag calculations - simplified for hour-only slots
  const gridInfo = useMemo(() => ({
    cellWidth: 0, // Day view doesn't use horizontal movement
    cellHeight: 64, // 4rem = 64px per hour (h-16)
    columns: 1,
    startHour: 8
  }), []);

  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    if (currentHour < 8 || currentHour > 22) return null;
    
    const position = ((currentHour - 8) * 60 + currentMinutes) / 60;
    return `${position * 4}rem`;
  };

  const handleTimeSlotDoubleClick = (hour: number) => {
    if (onCreateEvent) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      onCreateEvent({ date: currentDate, time: timeString });
    }
  };

  const currentTimePosition = isToday ? getCurrentTimePosition() : null;

  return (
    <div className="h-full flex flex-col">
      {/* Timeline with flexible height and internal scroll */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 flex-shrink-0 bg-card rounded-lg border border-[hsl(var(--border-calendar))] mr-2">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 px-3 py-2 text-sm text-muted-foreground border-t border-[hsl(var(--border-subtle))] flex items-start first:border-t-0"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="flex-1 relative bg-card/30 rounded-xl border border-[hsl(var(--border-calendar))]">
            {/* Hour slots with integrated magnetic zones */}
            {hours.map((hour) => (
              isDragAndDropEnabled() ? (
                <MagneticDropZone
                  key={hour}
                  timeSlot={currentDate}
                  hour={hour}
                  isWeekView={false}
                  cellWidth={0}
                  cellHeight={64}
                  onMagneticHover={setMagneticDropZone}
                  className="h-16 border-t border-[hsl(var(--border-medium))] hover:bg-accent/10 transition-colors cursor-pointer relative first:border-t-0"
                  onDoubleClick={() => handleTimeSlotDoubleClick(hour)}
                >
                  {/* Hour indicator */}
                  <div className="absolute top-8 left-0 right-0 h-px bg-[hsl(var(--border-subtle))] opacity-30" />
                </MagneticDropZone>
              ) : (
                <div
                  key={hour}
                  className="h-16 border-t border-[hsl(var(--border-medium))] hover:bg-accent/10 transition-colors cursor-pointer relative first:border-t-0"
                  onDoubleClick={() => handleTimeSlotDoubleClick(hour)}
                >
                  {/* Hour indicator */}
                  <div className="absolute top-8 left-0 right-0 h-px bg-[hsl(var(--border-subtle))] opacity-30" />
                </div>
              )
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
      {isDragAndDropEnabled() && (
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
      )}

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