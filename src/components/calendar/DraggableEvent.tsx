import { useState, useRef, useCallback } from 'react';
import Draggable, { DraggableData, DraggableEvent as ReactDraggableEvent } from 'react-draggable';
import { CalendarEvent, EventPosition, DropZoneInfo } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DraggableEventProps {
  event: CalendarEvent;
  position: EventPosition;
  onDragStart?: (event: CalendarEvent) => void;
  onDragStop?: (event: CalendarEvent, dropZone: DropZoneInfo) => void;
  onDrag?: (event: CalendarEvent, x: number, y: number) => void;
  disabled?: boolean;
  viewType: 'day' | 'week' | 'month';
  gridInfo?: {
    cellWidth: number;
    cellHeight: number;
    columns: number;
    startHour: number;
  };
}

export const DraggableEvent = ({
  event,
  position,
  onDragStart,
  onDragStop,
  onDrag,
  disabled = false,
  viewType,
  gridInfo
}: DraggableEventProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragThrottleRef = useRef<number>();
  
  const calculateDropZone = useCallback((x: number, y: number): DropZoneInfo => {
    if (!gridInfo) {
      return {
        date: event.startDateTime,
        isValid: false
      };
    }
    
    const { cellWidth, cellHeight, columns, startHour } = gridInfo;
    
    // Calculate which column (day) and row (hour)
    const column = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    
    // Calculate new date and time
    const newDate = new Date(event.startDateTime);
    
    if (viewType === 'week') {
      // Add days based on column
      newDate.setDate(newDate.getDate() + column);
      
      // Calculate new hour based on row and time grid
      const newHour = startHour + row;
      const newMinute = Math.round((y % cellHeight) / cellHeight * 60 / 15) * 15; // Snap to 15min
      
      newDate.setHours(newHour, newMinute, 0, 0);
      
      return {
        date: newDate,
        time: `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`,
        isValid: newHour >= startHour && newHour <= 22 && column >= 0 && column < columns,
        gridColumn: column,
        gridRow: row
      };
    }
    
    if (viewType === 'day') {
      // Only vertical movement for time change
      const newHour = startHour + row;
      const newMinute = Math.round((y % cellHeight) / cellHeight * 60 / 15) * 15;
      
      newDate.setHours(newHour, newMinute, 0, 0);
      
      return {
        date: newDate,
        time: `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`,
        isValid: newHour >= startHour && newHour <= 22,
        gridRow: row
      };
    }
    
    if (viewType === 'month') {
      // Only day changes, keep original time
      const daysToAdd = Math.floor(x / cellWidth) + Math.floor(y / cellHeight) * columns;
      newDate.setDate(newDate.getDate() + daysToAdd);
      
      return {
        date: newDate,
        isValid: true, // Month view is generally more flexible
        gridColumn: column,
        gridRow: row
      };
    }
    
    return {
      date: event.startDateTime,
      isValid: false
    };
  }, [event.startDateTime, gridInfo, viewType]);
  
  const handleDragStart = useCallback((e: ReactDraggableEvent, data: DraggableData) => {
    console.log('🎯 Drag start:', event.title);
    setIsDragging(true);
    onDragStart?.(event);
  }, [event, onDragStart]);
  
  const handleDrag = useCallback((e: ReactDraggableEvent, data: DraggableData) => {
    // Throttle drag events for better performance
    if (dragThrottleRef.current) {
      cancelAnimationFrame(dragThrottleRef.current);
    }
    
    dragThrottleRef.current = requestAnimationFrame(() => {
      onDrag?.(event, data.x, data.y);
    });
  }, [event, onDrag]);
  
  const handleDragStop = useCallback((e: ReactDraggableEvent, data: DraggableData) => {
    console.log('🎯 Drag stop:', event.title, { x: data.x, y: data.y });
    setIsDragging(false);
    
    // Clear any pending throttled drag calls
    if (dragThrottleRef.current) {
      cancelAnimationFrame(dragThrottleRef.current);
    }
    
    const dropZone = calculateDropZone(data.x, data.y);
    onDragStop?.(event, dropZone);
  }, [event, onDragStop, calculateDropZone]);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
  };
  
  const duration = event.endDateTime.getTime() - event.startDateTime.getTime();
  const durationHours = duration / (1000 * 60 * 60);
  
  return (
    <Draggable
      nodeRef={nodeRef}
      disabled={disabled}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      defaultPosition={{ x: 0, y: 0 }}
      enableUserSelectHack={false}
      scale={1}
    >
      <div
        ref={nodeRef}
        className={cn(
          "absolute rounded-xl p-3 transition-all duration-200 cursor-move select-none shadow-lg border border-[hsl(var(--border-medium))] overflow-hidden",
          event.color,
          "text-white",
          isDragging && "scale-105 shadow-2xl z-50 rotate-2",
          disabled && "cursor-not-allowed opacity-50",
          !isDragging && "hover:scale-[1.02] hover:shadow-xl hover:border-[hsl(var(--border-strong))]\""
        )}
        style={{
          ...position,
          zIndex: isDragging ? 1000 : 10
        }}
      >
        {/* Event Content */}
        <div className="relative z-10">
          <div className="font-semibold text-sm mb-1 truncate">
            {event.title}
          </div>
          
          <div className="text-white/90 text-xs mb-1">
            {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}
          </div>
          
          {event.description && viewType !== 'month' && (
            <div className="text-white/80 text-xs mb-1 truncate">
              {event.description}
            </div>
          )}
          
          {event.location && viewType === 'day' && (
            <div className="text-white/70 text-xs truncate">
              📍 {event.location}
            </div>
          )}
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 rounded-xl pointer-events-none" />
        
        {/* Drag indicator */}
        {isDragging && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/30 rounded-full animate-pulse" />
        )}
        
        {/* Resize handle for day/week views */}
        {viewType !== 'month' && !isDragging && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 cursor-ns-resize opacity-0 hover:opacity-100 transition-opacity" />
        )}
      </div>
    </Draggable>
  );
};
