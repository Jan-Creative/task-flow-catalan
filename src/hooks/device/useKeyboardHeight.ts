/**
 * useKeyboardHeight Hook - Detects iOS keyboard height and visibility
 */

import { useState, useEffect } from 'react';

export interface KeyboardState {
  height: number;
  isVisible: boolean;
}

export const useKeyboardHeight = (): KeyboardState => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    height: 0,
    isVisible: false,
  });

  useEffect(() => {
    let rafId: number;
    
    // Modern approach using Visual Viewport API (iOS Safari 13+)
    if (window.visualViewport) {
      const handleViewportChange = () => {
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(() => {
          const viewport = window.visualViewport!;
          const windowHeight = window.innerHeight;
          const viewportHeight = viewport.height;
          const offsetTop = viewport.offsetTop || 0;
          
          // More accurate calculation including offsetTop
          const keyboardHeight = Math.max(0, windowHeight - (viewportHeight + offsetTop));
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Keyboard detection:', {
              windowHeight,
              viewportHeight,
              offsetTop,
              keyboardHeight,
              isVisible: keyboardHeight > 80
            });
          }
          
          setKeyboardState({
            height: keyboardHeight,
            isVisible: keyboardHeight > 80, // Lower threshold for better detection
          });
        });
      };

      // Listen to both resize and scroll for more robust detection
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      
      // Initial check
      handleViewportChange();

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      };
    } else {
      // Fallback for older browsers
      let initialHeight = window.innerHeight;
      
      const handleResize = () => {
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(() => {
          const currentHeight = window.innerHeight;
          const keyboardHeight = Math.max(0, initialHeight - currentHeight);
          
          setKeyboardState({
            height: keyboardHeight,
            isVisible: keyboardHeight > 150, // Higher threshold for fallback
          });
        });
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return keyboardState;
};