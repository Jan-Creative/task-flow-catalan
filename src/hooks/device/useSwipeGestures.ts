/**
 * useSwipeGestures Hook - Handles swipe gestures for form card
 */

import { useState, useRef, useCallback } from 'react';

export interface SwipeGestureConfig {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeDownForce?: () => void;
  threshold?: number;
  velocityThreshold?: number;
}

export interface SwipeGestureReturn {
  isDragging: boolean;
  dragOffset: number;
  gestureHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

export const useSwipeGestures = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeDownForce,
  threshold = 50,
  velocityThreshold = 0.5,
}: SwipeGestureConfig): SwipeGestureReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  const startY = useRef<number>(0);
  const startTime = useRef<number>(0);
  const currentY = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startY.current = touch.clientY;
    currentY.current = touch.clientY;
    startTime.current = Date.now();
    setIsDragging(true);
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    currentY.current = touch.clientY;
    const offset = touch.clientY - startY.current;
    
    // Only allow downward drag for closing gesture
    if (offset > 0) {
      setDragOffset(Math.min(offset, 200)); // Max drag distance
    } else {
      setDragOffset(Math.max(offset, -100)); // Allow some upward drag
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const deltaY = currentY.current - startY.current;
    const deltaTime = Date.now() - startTime.current;
    const velocity = Math.abs(deltaY) / deltaTime;
    
    // Determine gesture type
    if (Math.abs(deltaY) > threshold || velocity > velocityThreshold) {
      if (deltaY > 0) {
        // Downward swipe
        if (deltaY > threshold * 2 || velocity > velocityThreshold * 2) {
          onSwipeDownForce?.(); // Force close
        } else {
          onSwipeDown?.(); // Collapse
        }
      } else {
        // Upward swipe
        onSwipeUp?.(); // Expand
      }
    }
    
    // Reset state
    setIsDragging(false);
    setDragOffset(0);
    startY.current = 0;
    currentY.current = 0;
    startTime.current = 0;
  }, [isDragging, threshold, velocityThreshold, onSwipeUp, onSwipeDown, onSwipeDownForce]);

  return {
    isDragging,
    dragOffset,
    gestureHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};