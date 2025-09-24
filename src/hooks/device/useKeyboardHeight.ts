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
    // Modern approach using Visual Viewport API (iOS Safari 13+)
    if (window.visualViewport) {
      const handleViewportChange = () => {
        const viewport = window.visualViewport!;
        const windowHeight = window.innerHeight;
        const viewportHeight = viewport.height;
        const keyboardHeight = Math.max(0, windowHeight - viewportHeight);
        
        setKeyboardState({
          height: keyboardHeight,
          isVisible: keyboardHeight > 0,
        });
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
      
      // Initial check
      handleViewportChange();

      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    } else {
      // Fallback for older browsers
      let initialHeight = window.innerHeight;
      
      const handleResize = () => {
        const currentHeight = window.innerHeight;
        const keyboardHeight = Math.max(0, initialHeight - currentHeight);
        
        setKeyboardState({
          height: keyboardHeight,
          isVisible: keyboardHeight > 150, // Threshold to avoid false positives
        });
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return keyboardState;
};