import { useState, useRef, useCallback, useEffect } from 'react';
import { DropZoneInfo } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface MagneticDropZoneProps {
  timeSlot: Date;
  hour: number;
  dayIndex?: number;
  isWeekView?: boolean;
  cellWidth: number;
  cellHeight: number;
  onMagneticHover?: (dropZone: DropZoneInfo | null) => void;
  onDoubleClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const MAGNETIC_DISTANCE = 20; // pixels

export const MagneticDropZone = ({
  timeSlot,
  hour,
  dayIndex = 0,
  isWeekView = false,
  cellWidth,
  cellHeight,
  onMagneticHover,
  onDoubleClick,
  className,
  children,
  style
}: MagneticDropZoneProps) => {
  const [isMagnetic, setIsMagnetic] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);

  const checkMagneticProximity = useCallback((x: number, y: number) => {
    if (!zoneRef.current) return false;

    const rect = zoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    return distance <= MAGNETIC_DISTANCE;
  }, []);

  const createDropZone = useCallback((): DropZoneInfo => {
    const newDate = new Date(timeSlot);
    newDate.setHours(hour, 0, 0, 0);

    return {
      date: newDate,
      time: `${hour.toString().padStart(2, '0')}:00`,
      isValid: hour >= 8 && hour <= 22,
      gridColumn: isWeekView ? dayIndex : undefined,
      gridRow: hour - 8
    };
  }, [timeSlot, hour, dayIndex, isWeekView]);

  // Global mouse move listener for magnetic effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isMagneticNow = checkMagneticProximity(e.clientX, e.clientY);
      
      if (isMagneticNow !== isMagnetic) {
        setIsMagnetic(isMagneticNow);
        
        if (isMagneticNow) {
          const dropZone = createDropZone();
          onMagneticHover?.(dropZone);
        } else if (!isMagneticNow && isMagnetic) {
          onMagneticHover?.(null);
        }
      }
    };

    // Only listen when dragging is active (we'll manage this through a global state)
    const isDragging = document.body.classList.contains('calendar-dragging');
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMagnetic, checkMagneticProximity, createDropZone, onMagneticHover]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsMagnetic(false);
    onMagneticHover?.(null);
  }, [onMagneticHover]);

  const formatTime = () => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDate = () => {
    return timeSlot.toLocaleDateString('ca-ES', { 
      weekday: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div
      ref={zoneRef}
      className={cn(
        "relative transition-all duration-300 ease-out",
        isMagnetic && "scale-105 z-30",
        isHovered && "bg-primary/5",
        className
      )}
      style={{
        width: cellWidth || 'auto',
        height: cellHeight,
        ...style
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={onDoubleClick}
    >
      {children}
      
      {/* Magnetic indicator */}
      {isMagnetic && (
        <div className="absolute inset-0 rounded-lg border-2 border-primary/50 bg-primary/10 backdrop-blur-sm animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-medium shadow-lg">
              🧲 {isWeekView ? `${formatDate()} ${formatTime()}` : formatTime()}
            </div>
          </div>
        </div>
      )}
      
      {/* Subtle grid indicator */}
      {(isMagnetic || isHovered) && (
        <div className="absolute inset-0 border border-primary/20 rounded" />
      )}
    </div>
  );
};