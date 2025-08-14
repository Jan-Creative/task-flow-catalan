// ============= HOOK PER UTILITZAR DRECERES DE TECLAT =============

import { useEffect } from 'react';
import { useKeyboardShortcuts as useKeyboardShortcutsContext } from '@/contexts/KeyboardShortcutsContext';
import type { KeyboardShortcut } from '@/types/shortcuts';

interface UseKeyboardShortcutsOptions {
  /**
   * Registrar dreceres automàticament quan el component es munta
   */
  shortcuts?: Omit<KeyboardShortcut, 'enabled'>[];
  
  /**
   * Només activar les dreceres quan aquesta condició sigui true
   */
  enabled?: boolean;
}

/**
 * Hook per registrar i utilitzar dreceres de teclat en components
 */
export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}) => {
  const context = useKeyboardShortcutsContext();
  const { shortcuts = [], enabled = true } = options;

  // Registrar dreceres automàticament
  useEffect(() => {
    if (enabled) {
      shortcuts.forEach(shortcut => {
        context.registerShortcut(shortcut);
      });
    }
  }, [shortcuts, enabled, context]);

  return {
    ...context,
    /**
     * Registrar una drecera temporal només per aquest component
     */
    registerLocalShortcut: (shortcut: Omit<KeyboardShortcut, 'enabled'>) => {
      if (enabled) {
        context.registerShortcut(shortcut);
      }
    },
    
    /**
     * Comprovar si una drecera està activa
     */
    isShortcutActive: (id: string): boolean => {
      const shortcut = context.shortcuts[id];
      return shortcut ? shortcut.enabled : false;
    },
    
    /**
     * Obtenir la configuració d'una drecera
     */
    getShortcutConfig: (id: string) => {
      return context.config[id];
    }
  };
};

/**
 * Hook simplificat per registrar una sola drecera
 */
export const useShortcut = (
  id: string,
  name: string,
  keys: string[],
  action: () => void,
  options: {
    description?: string;
    category?: 'navigation' | 'actions' | 'general';
    enabled?: boolean;
  } = {}
) => {
  const { registerLocalShortcut } = useKeyboardShortcuts({
    enabled: options.enabled
  });

  useEffect(() => {
    registerLocalShortcut({
      id,
      name,
      description: options.description || name,
      keys,
      action,
      category: options.category || 'general'
    });
  }, [id, name, keys, action, options.description, options.category]);
};