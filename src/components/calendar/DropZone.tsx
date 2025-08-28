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

// Simplified grid overlay for drag feedback
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
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* Simplified overlay with just a subtle background */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]">
        {/* Helper text */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="text-sm font-medium text-center">
            📋 Arrossega a una franja horària
          </div>
        </div>
      </div>
    </div>
  );
};