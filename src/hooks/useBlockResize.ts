import { useState, useCallback, useRef } from 'react';

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  description?: string;
}

interface UseBlockResizeProps {
  onUpdateBlock: (blockId: string, updates: Partial<TimeBlock>) => void;
  minHour?: number;
  maxHour?: number;
  snapMinutes?: number;
}

interface ResizeState {
  isResizing: boolean;
  blockId: string | null;
  resizeType: 'top' | 'bottom' | null;
  startY: number;
  originalStartTime: string;
  originalEndTime: string;
}

export const useBlockResize = ({ 
  onUpdateBlock, 
  minHour = 8, 
  maxHour = 22, 
  snapMinutes = 15 
}: UseBlockResizeProps) => {
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    blockId: null,
    resizeType: null,
    startY: 0,
    originalStartTime: '',
    originalEndTime: '',
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Convert Y coordinate to time
  const yToTime = useCallback((y: number, containerRect: DOMRect) => {
    const relativeY = y - containerRect.top;
    const hourHeight = 40; // 2.5rem * 16px = 40px per hour in our grid
    const totalHours = relativeY / hourHeight;
    const hour = Math.floor(minHour + totalHours);
    const minutes = Math.round(((totalHours % 1) * 60) / snapMinutes) * snapMinutes;
    
    // Clamp to valid range
    const clampedHour = Math.max(minHour, Math.min(maxHour - 1, hour));
    const clampedMinutes = Math.max(0, Math.min(45, minutes));
    
    return `${clampedHour.toString().padStart(2, '0')}:${clampedMinutes.toString().padStart(2, '0')}`;
  }, [minHour, maxHour, snapMinutes]);

  // Check if time is valid (within bounds and not creating conflicts)
  const isValidTime = useCallback((startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    
    // Must be at least 15 minutes duration
    return endTotal - startTotal >= 15;
  }, []);

  const startResize = useCallback((
    blockId: string, 
    resizeType: 'top' | 'bottom', 
    startY: number,
    originalStartTime: string,
    originalEndTime: string
  ) => {
    setResizeState({
      isResizing: true,
      blockId,
      resizeType,
      startY,
      originalStartTime,
      originalEndTime,
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeState.isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newTime = yToTime(e.clientY, containerRect);
    
    let newStartTime = resizeState.originalStartTime;
    let newEndTime = resizeState.originalEndTime;
    
    if (resizeState.resizeType === 'top') {
      newStartTime = newTime;
    } else {
      newEndTime = newTime;
    }
    
    // Validate the new times
    if (isValidTime(newStartTime, newEndTime)) {
      onUpdateBlock(resizeState.blockId!, {
        startTime: newStartTime,
        endTime: newEndTime,
      });
    }
  }, [resizeState, yToTime, isValidTime, onUpdateBlock]);

  const handleMouseUp = useCallback(() => {
    setResizeState({
      isResizing: false,
      blockId: null,
      resizeType: null,
      startY: 0,
      originalStartTime: '',
      originalEndTime: '',
    });
  }, []);

  // Add global event listeners when resizing
  const attachListeners = useCallback(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [handleMouseMove, handleMouseUp]);

  const detachListeners = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove, handleMouseUp]);

  // Effect to handle event listeners
  if (resizeState.isResizing) {
    attachListeners();
  } else {
    detachListeners();
  }

  return {
    resizeState,
    startResize,
    containerRef,
  };
};