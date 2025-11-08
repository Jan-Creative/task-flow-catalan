// ============= FALLBACK NO-OP PER KEYBOARD SHORTCUTS =============

import React, { createContext, useContext } from 'react';
import type { KeyboardShortcutsContextType } from '@/types/shortcuts';

export const EmptyKeyboardShortcutsContext = createContext<KeyboardShortcutsContextType>({
  shortcuts: {},
  config: {},
  isEnabled: false,
  registerShortcut: () => {},
  updateShortcutConfig: () => {},
  setEnabled: () => {},
  executeShortcut: () => {}
});

interface EmptyKeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export const EmptyKeyboardShortcutsProvider: React.FC<EmptyKeyboardShortcutsProviderProps> = ({ children }) => {
  const value: KeyboardShortcutsContextType = {
    shortcuts: {},
    config: {},
    isEnabled: false,
    registerShortcut: () => {
      console.warn('[EmptyKeyboardShortcuts] Using fallback provider - registerShortcut is no-op');
    },
    updateShortcutConfig: () => {
      console.warn('[EmptyKeyboardShortcuts] Using fallback provider - updateShortcutConfig is no-op');
    },
    setEnabled: () => {
      console.warn('[EmptyKeyboardShortcuts] Using fallback provider - setEnabled is no-op');
    },
    executeShortcut: () => {
      console.warn('[EmptyKeyboardShortcuts] Using fallback provider - executeShortcut is no-op');
    }
  };

  return (
    <EmptyKeyboardShortcutsContext.Provider value={value}>
      {children}
    </EmptyKeyboardShortcutsContext.Provider>
  );
};

export const useEmptyKeyboardShortcuts = (): KeyboardShortcutsContextType => {
  return useContext(EmptyKeyboardShortcutsContext);
};
