// ============= CONFIGURACIÓ PER DEFECTE DE DRECERES =============

import type { KeyboardShortcut } from '@/types/shortcuts';

// Dreceres per defecte del sistema
export const defaultShortcuts: Record<string, Omit<KeyboardShortcut, 'action' | 'enabled'>> = {
  createTask: {
    id: 'createTask',
    name: 'Crear Tasca',
    description: 'Obrir el formulari per crear una nova tasca',
    keys: ['meta', 'n'], // Cmd/Ctrl + N
    category: 'actions'
  },
  
  // Dreceres futures preparades
  navigateToday: {
    id: 'navigateToday',
    name: 'Anar a Avui',
    description: 'Navegar a la pàgina d\'avui',
    keys: ['meta', '1'],
    category: 'navigation'
  },
  
  navigateFolders: {
    id: 'navigateFolders',
    name: 'Anar a Carpetes',
    description: 'Navegar a la pàgina de carpetes',
    keys: ['meta', '2'],
    category: 'navigation'
  },
  
  navigateSettings: {
    id: 'navigateSettings',
    name: 'Anar a Configuració',
    description: 'Navegar a la pàgina de configuració',
    keys: ['meta', '3'],
    category: 'navigation'
  },
  
  closeModal: {
    id: 'closeModal',
    name: 'Tancar Modal',
    description: 'Tancar el modal o drawer actual',
    keys: ['escape'],
    category: 'general'
  }
};

// Mapeig de tecles per mostrar a la UI
export const keyDisplayNames: Record<string, string> = {
  meta: '⌘',
  ctrl: 'Ctrl',
  shift: '⇧',
  alt: '⌥',
  escape: 'Esc',
  enter: '↵',
  space: 'Espai',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→'
};

// Convertir tecles a format llegible
export const formatShortcutKeys = (keys: string[]): string => {
  return keys
    .map(key => keyDisplayNames[key.toLowerCase()] || key.toUpperCase())
    .join(' + ');
};

// Detectar si estem en Mac per mostrar Cmd vs Ctrl
export const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// Normalitzar tecles segons la plataforma
export const normalizeKeys = (keys: string[]): string[] => {
  return keys.map(key => {
    if (key === 'meta' && !isMac) return 'ctrl';
    if (key === 'ctrl' && isMac) return 'meta';
    return key;
  });
};