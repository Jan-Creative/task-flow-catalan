/**
 * useKeyboardHeight Hook - Detects iOS keyboard height and visibility
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface KeyboardState {
  height: number;
  isVisible: boolean;
}

// FASE 2: ESTABILITZAR EVENT LISTENERS - Eliminar memory leaks
export const useKeyboardHeight = (): KeyboardState => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    height: 0,
    isVisible: false,
  });
  
  const listenerAttachedRef = useRef(false); // ✅ GUARD contra duplicació
  const rafIdRef = useRef<number>(); // ✅ Use ref for rafId

  // ✅ ESTABLE: useCallback per handleViewportChange
  const handleViewportChange = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    
    rafIdRef.current = requestAnimationFrame(() => {
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
  }, []);

  // ✅ ESTABLE: useCallback per handleResize (fallback)
  const handleResize = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    
    rafIdRef.current = requestAnimationFrame(() => {
      const initialHeight = window.innerHeight;
      const currentHeight = window.innerHeight;
      const keyboardHeight = Math.max(0, initialHeight - currentHeight);
      
      setKeyboardState({
        height: keyboardHeight,
        isVisible: keyboardHeight > 150, // Higher threshold for fallback
      });
    });
  }, []);

  useEffect(() => {
    // ✅ GUARD: Skip si ja està attached (prevé duplicats en StrictMode)
    if (listenerAttachedRef.current) {
      console.warn('⚠️ useKeyboardHeight: listeners already attached, skipping');
      return;
    }

    listenerAttachedRef.current = true;
    
    // Modern approach using Visual Viewport API (iOS Safari 13+)
    if (window.visualViewport) {
      console.log('⌨️ Attaching Visual Viewport listeners for keyboard detection');
      
      // Listen to both resize and scroll for more robust detection
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      
      // Initial check
      handleViewportChange();

      return () => {
        console.log('🧹 Removing Visual Viewport listeners for keyboard detection');
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        window.visualViewport?.removeEventListener('scroll', handleViewportChange);
        listenerAttachedRef.current = false;
      };
    } else {
      // Fallback for older browsers
      console.log('⌨️ Attaching window resize listener for keyboard detection (fallback)');
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        console.log('🧹 Removing window resize listener for keyboard detection');
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        window.removeEventListener('resize', handleResize);
        listenerAttachedRef.current = false;
      };
    }
  }, [handleViewportChange, handleResize]); // ✅ Stable callbacks

  return keyboardState;
};