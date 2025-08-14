// ============= CONTEXT GLOBAL PER DRECERES DE TECLAT =============

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { keyboardService } from '@/services/keyboardService';
import { defaultShortcuts } from '@/utils/shortcutDefaults';
import type { 
  KeyboardShortcutsContextType, 
  KeyboardShortcut, 
  ShortcutConfig,
  KeyboardShortcutsState 
} from '@/types/shortcuts';

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'keyboard-shortcuts-config';

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({ children }) => {
  const [state, setState] = useState<KeyboardShortcutsState>(() => {
    // Carregar configuració de localStorage
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    const config = savedConfig ? JSON.parse(savedConfig) : {};
    
    return {
      shortcuts: {},
      config,
      isEnabled: true
    };
  });

  const keyboardHandlerRef = useRef<(event: KeyboardEvent) => void>();

  // Guardar configuració a localStorage
  const saveConfig = useCallback((config: Record<string, ShortcutConfig>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, []);

  // Registrar una nova drecera
  const registerShortcut = useCallback((shortcut: Omit<KeyboardShortcut, 'enabled'>) => {
    setState(prevState => {
      const config = prevState.config[shortcut.id] || { 
        id: shortcut.id, 
        keys: shortcut.keys, 
        enabled: true 
      };
      
      const fullShortcut: KeyboardShortcut = {
        ...shortcut,
        enabled: config.enabled,
        keys: config.keys
      };

      // Registrar al servei
      keyboardService.registerShortcut(fullShortcut);

      const newState = {
        ...prevState,
        shortcuts: {
          ...prevState.shortcuts,
          [shortcut.id]: fullShortcut
        }
      };

      return newState;
    });
  }, []);

  // Actualitzar configuració d'una drecera
  const updateShortcutConfig = useCallback((id: string, configUpdate: Partial<ShortcutConfig>) => {
    setState(prevState => {
      const existingConfig = prevState.config[id] || { id, keys: [], enabled: true };
      const newConfig = { ...existingConfig, ...configUpdate };
      
      const updatedConfigs = {
        ...prevState.config,
        [id]: newConfig
      };

      // Actualitzar la drecera si existeix
      if (prevState.shortcuts[id]) {
        const updatedShortcut = {
          ...prevState.shortcuts[id],
          enabled: newConfig.enabled,
          keys: newConfig.keys
        };

        keyboardService.registerShortcut(updatedShortcut);

        saveConfig(updatedConfigs);

        return {
          ...prevState,
          config: updatedConfigs,
          shortcuts: {
            ...prevState.shortcuts,
            [id]: updatedShortcut
          }
        };
      }

      saveConfig(updatedConfigs);
      return {
        ...prevState,
        config: updatedConfigs
      };
    });
  }, [saveConfig]);

  // Activar/desactivar sistema de dreceres
  const setEnabled = useCallback((enabled: boolean) => {
    setState(prevState => ({ ...prevState, isEnabled: enabled }));
  }, []);

  // Executar una drecera
  const executeShortcut = useCallback((id: string) => {
    if (state.isEnabled) {
      keyboardService.executeShortcut(id);
    }
  }, [state.isEnabled]);

  // Handler global per events de teclat
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (state.isEnabled) {
        keyboardService.handleKeyDown(event);
      }
    };

    keyboardHandlerRef.current = handler;
    document.addEventListener('keydown', handler, true);

    return () => {
      document.removeEventListener('keydown', handler, true);
    };
  }, [state.isEnabled]);

  // Cleanup en desmuntar
  useEffect(() => {
    return () => {
      keyboardService.cleanup();
    };
  }, []);

  const contextValue: KeyboardShortcutsContextType = {
    shortcuts: state.shortcuts,
    config: state.config,
    isEnabled: state.isEnabled,
    registerShortcut,
    updateShortcutConfig,
    setEnabled,
    executeShortcut
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

export const useKeyboardShortcuts = (): KeyboardShortcutsContextType => {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};