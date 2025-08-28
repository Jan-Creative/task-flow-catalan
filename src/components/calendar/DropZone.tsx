import { useState, useCallback } from 'react';
import { DropZoneInfo } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  isActive: boolean;
  isValid: boolean;
  dropZoneInfo?: DropZoneInfo;
  onDrop?: (dropZone: DropZoneInfo) => void;
  className?: string;
  children?: React.ReactNode;
  viewType: 'day' | 'week' | 'month';
}

export const DropZone = ({
  isActive,
  isValid,
  dropZoneInfo,
  onDrop,
  className,
  children,
  viewType
}: DropZoneProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    
    if (dropZoneInfo && onDrop) {
      onDrop(dropZoneInfo);
    }
  }, [dropZoneInfo, onDrop]);
  
  const formatDropZonePreview = () => {
    if (!dropZoneInfo) return null;
    
    const timeStr = dropZoneInfo.time || '';
    const dateStr = dropZoneInfo.date.toLocaleDateString('ca-ES', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
    
    switch (viewType) {
      case 'day':
        return timeStr ? `⏰ ${timeStr}` : null;
      case 'week':
        return `📅 ${dateStr} ${timeStr}`;
      case 'month':
        return `📅 ${dateStr}`;
      default:
        return null;
    }
  };
  
  return (
    <div
      className={cn(
        "relative transition-all duration-200",
        isActive && isValid && "bg-primary/10 border-2 border-dashed border-primary/30",
        isActive && !isValid && "bg-destructive/10 border-2 border-dashed border-destructive/30",
        isHovered && isValid && "bg-primary/20 border-primary/50",
        isHovered && !isValid && "bg-destructive/20 border-destructive/50",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      
      {/* Drop zone indicator */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className={cn(
            "px-3 py-2 rounded-lg text-xs font-medium shadow-lg backdrop-blur-sm",
            isValid 
              ? "bg-primary/90 text-primary-foreground" 
              : "bg-destructive/90 text-destructive-foreground"
          )}>
            {isValid ? (
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>{formatDropZonePreview()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>✗</span>
                <span>Hora no vàlida</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Hover effect overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-lg" />
      )}
    </div>
  );
};

// Grid overlay component for visual feedback during drag
export const DragGridOverlay = ({ 
  isVisible, 
  viewType, 
  gridInfo 
}: { 
  isVisible: boolean; 
  viewType: 'day' | 'week' | 'month';
  gridInfo?: {
    cellWidth: number;
    cellHeight: number;
    columns: number;
    rows: number;
  };
}) => {
  if (!isVisible || !gridInfo) return null;
  
  const { cellWidth, cellHeight, columns, rows } = gridInfo;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Vertical lines */}
      {viewType !== 'day' && Array.from({ length: columns + 1 }, (_, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 w-px bg-primary/20"
          style={{ left: i * cellWidth }}
        />
      ))}
      
      {/* Horizontal lines */}
      {viewType !== 'month' && Array.from({ length: rows + 1 }, (_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 h-px bg-primary/20"
          style={{ top: i * cellHeight }}
        />
      ))}
      
      {/* Time indicators for non-month views */}
      {viewType !== 'month' && Array.from({ length: rows }, (_, i) => (
        <div
          key={`time-${i}`}
          className="absolute left-2 text-xs text-primary/60 font-medium"
          style={{ top: i * cellHeight + 8 }}
        >
          {String(8 + i).padStart(2, '0')}:00
        </div>
      ))}
    </div>
  );
};