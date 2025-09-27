/**
 * useStableKeyboardHeight - Versió millorada amb debounce i cleanup
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useKeyboardNavigation } from '@/contexts/KeyboardNavigationContext';

export interface StableKeyboardState {
  height: number;
  isVisible: boolean;
  isStable: boolean;
}

export const useStableKeyboardHeight = (): StableKeyboardState => {
  const [keyboardState, setKeyboardState] = useState<StableKeyboardState>({
    height: 0,
    isVisible: false,
    isStable: true,
  });
  
  const { setKeyboardActive } = useKeyboardNavigation();
  const debounceTimeoutRef = useRef<number>();
  const stabilityTimeoutRef = useRef<number>();
  const rafId = useRef<number>();
  
  const updateKeyboardState = useCallback((height: number, isVisible: boolean) => {
    // Clear previous timeouts
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (stabilityTimeoutRef.current) {
      clearTimeout(stabilityTimeoutRef.current);
    }
    
    // Mark as unstable during changes
    setKeyboardState(prev => ({ ...prev, isStable: false }));
    
    // Debounced update
    debounceTimeoutRef.current = window.setTimeout(() => {
      setKeyboardState({
        height,
        isVisible,
        isStable: false,
      });
      
      // Update global context
      setKeyboardActive(isVisible, height);
      
      // Mark as stable after additional delay
      stabilityTimeoutRef.current = window.setTimeout(() => {
        setKeyboardState(prev => ({ ...prev, isStable: true }));
      }, 200);
      
    }, 150); // Debounce de 150ms
  }, [setKeyboardActive]);

  useEffect(() => {
    // Modern approach using Visual Viewport API
    if (window.visualViewport) {
      const handleViewportChange = () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        
        rafId.current = requestAnimationFrame(() => {
          const viewport = window.visualViewport!;
          const windowHeight = window.innerHeight;
          const viewportHeight = viewport.height;
          const offsetTop = viewport.offsetTop || 0;
          
          const keyboardHeight = Math.max(0, windowHeight - (viewportHeight + offsetTop));
          const isVisible = keyboardHeight > 80;
          
          updateKeyboardState(keyboardHeight, isVisible);
        });
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      
      // Initial check
      handleViewportChange();

      return () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        if (stabilityTimeoutRef.current) clearTimeout(stabilityTimeoutRef.current);
        
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      };
    } else {
      // Fallback for older browsers
      let initialHeight = window.innerHeight;
      
      const handleResize = () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        
        rafId.current = requestAnimationFrame(() => {
          const currentHeight = window.innerHeight;
          const keyboardHeight = Math.max(0, initialHeight - currentHeight);
          const isVisible = keyboardHeight > 150;
          
          updateKeyboardState(keyboardHeight, isVisible);
        });
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        if (stabilityTimeoutRef.current) clearTimeout(stabilityTimeoutRef.current);
        
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [updateKeyboardState]);

  return keyboardState;
};