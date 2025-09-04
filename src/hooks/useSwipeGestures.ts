import { useRef, useState, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: (distance: number) => void;
  onSwipeRight?: (distance: number) => void;
  onSwipeEnd?: (direction: 'left' | 'right' | null, distance: number) => void;
  threshold?: number;
  maxDistance?: number;
}

interface SwipeState {
  isActive: boolean;
  direction: 'left' | 'right' | null;
  distance: number;
  progress: number;
}

export const useSwipeGestures = (options: SwipeGestureOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeEnd,
    threshold = 50,
    maxDistance = 200
  } = options;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isActive: false,
    direction: null,
    distance: 0,
    progress: 0
  });

  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    isDragging.current = true;
    setSwipeState(prev => ({ ...prev, isActive: true }));
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;

    touchCurrentX.current = e.touches[0].clientX;
    const deltaX = touchCurrentX.current - touchStartX.current;
    const distance = Math.abs(deltaX);
    const direction = deltaX < 0 ? 'left' : 'right';
    const progress = Math.min(distance / maxDistance, 1);

    setSwipeState({
      isActive: true,
      direction,
      distance,
      progress
    });

    // Trigger continuous swipe callbacks
    if (direction === 'left' && onSwipeLeft) {
      onSwipeLeft(distance);
    } else if (direction === 'right' && onSwipeRight) {
      onSwipeRight(distance);
    }
  }, [onSwipeLeft, onSwipeRight, maxDistance]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;

    const deltaX = touchCurrentX.current - touchStartX.current;
    const distance = Math.abs(deltaX);
    const direction = deltaX < 0 ? 'left' : 'right';

    isDragging.current = false;

    // Only trigger action if above threshold
    const finalDirection = distance >= threshold ? direction : null;

    if (onSwipeEnd) {
      onSwipeEnd(finalDirection, distance);
    }

    // Reset state
    setSwipeState({
      isActive: false,
      direction: null,
      distance: 0,
      progress: 0
    });

    // Reset refs
    touchStartX.current = 0;
    touchCurrentX.current = 0;
  }, [threshold, onSwipeEnd]);

  const resetSwipe = useCallback(() => {
    setSwipeState({
      isActive: false,
      direction: null,
      distance: 0,
      progress: 0
    });
    isDragging.current = false;
    touchStartX.current = 0;
    touchCurrentX.current = 0;
  }, []);

  return {
    swipeState,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetSwipe
  };
};