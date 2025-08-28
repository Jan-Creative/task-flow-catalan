import { useState, useRef, useCallback } from 'react';
import Draggable, { DraggableData, DraggableEvent as ReactDraggableEvent } from 'react-draggable';
import { CalendarEvent, EventPosition, DropZoneInfo } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { useCalendarSelection } from '@/contexts/CalendarSelectionContext';

interface DraggableEventProps {
  event: CalendarEvent;
  position: EventPosition;
  onDragStart?: (event: CalendarEvent) => void;
  onDragStop?: (event: CalendarEvent, dropZone: DropZoneInfo) => void;
  onDrag?: (event: CalendarEvent, x: number, y: number) => void;
  onDoubleClick?: (event: CalendarEvent) => void;
  onClick?: (event: CalendarEvent) => void;
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
  onDoubleClick,
  onClick,
  disabled = false,
  viewType,
  gridInfo
}: DraggableEventProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { isEventSelected, setSelectedEvent } = useCalendarSelection();
  
  const calculateDropZone = useCallback((x: number, y: number): DropZoneInfo => {
    if (!gridInfo) {
      return {
        date: event.startDateTime,
        isValid: false
      };
    }
    
    const { cellWidth, cellHeight, columns, startHour } = gridInfo;
    
    // Snap to whole hour slots only - simplified time slots
    const column = Math.max(0, Math.min(Math.floor(x / cellWidth), columns - 1));
    const row = Math.max(0, Math.floor(y / cellHeight));
    
    const newDate = new Date(event.startDateTime);
    
    if (viewType === 'week') {
      // Calculate the start of the week
      const startOfWeek = new Date(event.startDateTime);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      // Set to the target day
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + column);
      
      // Set hour (whole hours only)
      const newHour = startHour + row;
      targetDate.setHours(newHour, 0, 0, 0);
      
      return {
        date: targetDate,
        time: `${newHour.toString().padStart(2, '0')}:00`,
        isValid: newHour >= startHour && newHour <= 22 && column >= 0 && column < columns,
        gridColumn: column,
        gridRow: row
      };
    }
    
    if (viewType === 'day') {
      // Only vertical movement for time change (whole hours only)
      const newHour = startHour + row;
      newDate.setHours(newHour, 0, 0, 0);
      
      return {
        date: newDate,
        time: `${newHour.toString().padStart(2, '0')}:00`,
        isValid: newHour >= startHour && newHour <= 22,
        gridRow: row
      };
    }
    
    return {
      date: event.startDateTime,
      isValid: false
    };
  }, [event.startDateTime, gridInfo, viewType]);
  
  const handleDragStart = useCallback((e: ReactDraggableEvent, data: DraggableData) => {
    setIsDragging(true);
    document.body.classList.add('calendar-dragging');
    onDragStart?.(event);
  }, [event, onDragStart]);
  
  const handleDrag = useCallback((e: ReactDraggableEvent, data: DraggableData) => {
    // Simple, non-throttled drag for smooth movement
    onDrag?.(event, data.x, data.y);
  }, [event, onDrag]);
  
  const handleDragStop = useCallback((e: ReactDraggableEvent, data: DraggableData) => {
    setIsDragging(false);
    document.body.classList.remove('calendar-dragging');
    
    const dropZone = calculateDropZone(data.x, data.y);
    onDragStop?.(event, dropZone);
  }, [event, onDragStop, calculateDropZone]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    onClick?.(event);
  }, [event, setSelectedEvent, onClick]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.(event);
  }, [event, onDoubleClick]);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
  };
  
  const duration = event.endDateTime.getTime() - event.startDateTime.getTime();
  const durationHours = duration / (1000 * 60 * 60);
  
  // Calculate bounds for dragging - restrict to valid calendar area
  const bounds = gridInfo ? {
    left: 0,
    top: 0,
    right: Math.max(0, (gridInfo.columns * gridInfo.cellWidth) - 100),
    bottom: Math.max(0, (15 * gridInfo.cellHeight) - 50) // 8AM to 10PM = 15 hours
  } : undefined;

  // Grid snap to whole hour slots only
  const gridSettings: [number, number] | undefined = gridInfo ? [
    viewType === 'week' ? gridInfo.cellWidth : 0, // Horizontal snap for week view only
    gridInfo.cellHeight // Vertical snap to hours
  ] : undefined;

  return (
    <Draggable
      nodeRef={nodeRef}
      disabled={disabled}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      defaultPosition={{ x: 0, y: 0 }}
      enableUserSelectHack={false}
      bounds={bounds}
      grid={gridSettings}
      scale={1}
    >
      <div
        ref={nodeRef}
        className={cn(
          "absolute rounded-xl p-3 select-none shadow-lg border border-[hsl(var(--border-medium))] overflow-hidden",
          event.color,
          "text-white",
          isDragging && "scale-105 shadow-2xl z-50",
          disabled ? "cursor-pointer opacity-75" : "cursor-move",
          isEventSelected(event.id) && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          // Remove transitions during drag to prevent stuttering
          !isDragging && "transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:border-[hsl(var(--border-strong))]"
        )}
        style={{
          ...position,
          zIndex: isDragging ? 1000 : isEventSelected(event.id) ? 20 : 10,
          // Disable transitions during drag
          transition: isDragging ? 'none' : undefined
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
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
