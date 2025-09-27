/**
 * Keyboard Navigation Context - Coordinació global entre teclat i navigation
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface KeyboardNavigationState {
  isKeyboardActive: boolean;
  keyboardHeight: number;
  isFormOpen: boolean;
  navigationSafeMode: boolean;
}

interface KeyboardNavigationContextType extends KeyboardNavigationState {
  setKeyboardActive: (active: boolean, height?: number) => void;
  setFormOpen: (open: boolean) => void;
  setNavigationSafeMode: (safe: boolean) => void;
  resetKeyboardState: () => void;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined);

export const KeyboardNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<KeyboardNavigationState>({
    isKeyboardActive: false,
    keyboardHeight: 0,
    isFormOpen: false,
    navigationSafeMode: false,
  });
  
  const resetTimeoutRef = useRef<number>();

  const setKeyboardActive = useCallback((active: boolean, height = 0) => {
    setState(prev => ({ 
      ...prev, 
      isKeyboardActive: active, 
      keyboardHeight: height 
    }));
    
    // Clear existing timeout
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    
    // Auto-reset keyboard state after inactivity
    if (!active) {
      resetTimeoutRef.current = window.setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          isKeyboardActive: false, 
          keyboardHeight: 0,
          navigationSafeMode: false 
        }));
      }, 500);
    }
  }, []);

  const setFormOpen = useCallback((open: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isFormOpen: open,
      navigationSafeMode: open
    }));
    
    // Reset keyboard state when form closes
    if (!open) {
      setKeyboardActive(false, 0);
    }
  }, [setKeyboardActive]);

  const setNavigationSafeMode = useCallback((safe: boolean) => {
    setState(prev => ({ ...prev, navigationSafeMode: safe }));
  }, []);

  const resetKeyboardState = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    setState({
      isKeyboardActive: false,
      keyboardHeight: 0,
      isFormOpen: false,
      navigationSafeMode: false,
    });
  }, []);

  const value: KeyboardNavigationContextType = {
    ...state,
    setKeyboardActive,
    setFormOpen,
    setNavigationSafeMode,
    resetKeyboardState,
  };

  return (
    <KeyboardNavigationContext.Provider value={value}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
};

export const useKeyboardNavigation = () => {
  const context = useContext(KeyboardNavigationContext);
  if (context === undefined) {
    throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider');
  }
  return context;
};