/**
 * Custom hook for controlled form panel navigation
 * Specifically designed for the Liquid Glass form with adjacent panel logic
 */

import { useState, useRef, useCallback } from 'react';

export type PanelType = 'left' | 'center' | 'right';

interface FormPanelSwipeOptions {
  onPanelChange?: (panel: PanelType) => void;
  threshold?: number;
  maxDistance?: number;
}

interface FormPanelSwipeReturn {
  currentPanel: PanelType;
  setCurrentPanel: (panel: PanelType) => void;
  isDragging: boolean;
  dragOffset: number;
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

export const useFormPanelSwipe = (
  options: FormPanelSwipeOptions = {}
): FormPanelSwipeReturn => {
  const { onPanelChange, threshold = 50, maxDistance = 200 } = options;
  
  const [currentPanel, setCurrentPanel] = useState<PanelType>('center');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentDragRef = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
    setDragOffset(0);
    currentDragRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // Prevent scrolling if horizontal swipe is dominant
    if (Math.abs(deltaX) > deltaY) {
      e.preventDefault();
    }

    // Limit drag distance
    const clampedDelta = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
    setDragOffset(clampedDelta);
    currentDragRef.current = clampedDelta;
  }, [maxDistance]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;

    const dragDistance = Math.abs(currentDragRef.current);
    const dragDirection = currentDragRef.current > 0 ? 'right' : 'left';

    // Reset dragging state
    setIsDragging(false);
    setDragOffset(0);
    touchStartRef.current = null;
    currentDragRef.current = 0;

    // Only change panels if drag exceeds threshold
    if (dragDistance < threshold) return;

    let newPanel: PanelType = currentPanel;

    // Adjacent panel navigation logic
    if (dragDirection === 'right') {
      // Swipe right - go to previous panel
      switch (currentPanel) {
        case 'right':
          newPanel = 'center';
          break;
        case 'center':
          newPanel = 'left';
          break;
        case 'left':
          // Already at leftmost panel
          break;
      }
    } else {
      // Swipe left - go to next panel
      switch (currentPanel) {
        case 'left':
          newPanel = 'center';
          break;
        case 'center':
          newPanel = 'right';
          break;
        case 'right':
          // Already at rightmost panel
          break;
      }
    }

    if (newPanel !== currentPanel) {
      setCurrentPanel(newPanel);
      onPanelChange?.(newPanel);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }
  }, [currentPanel, threshold, onPanelChange]);

  const setPanelWithCallback = useCallback((panel: PanelType) => {
    setCurrentPanel(panel);
    onPanelChange?.(panel);
  }, [onPanelChange]);

  return {
    currentPanel,
    setCurrentPanel: setPanelWithCallback,
    isDragging,
    dragOffset,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};