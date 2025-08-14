// ============= TIPUS PER SISTEMA DE DRECERES DE TECLAT =============

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[];
  action: () => void;
  enabled: boolean;
  category: 'navigation' | 'actions' | 'general';
}

export interface ShortcutConfig {
  id: string;
  keys: string[];
  enabled: boolean;
}

export interface KeyboardShortcutsState {
  shortcuts: Record<string, KeyboardShortcut>;
  config: Record<string, ShortcutConfig>;
  isEnabled: boolean;
}

export interface KeyboardShortcutsContextType {
  shortcuts: Record<string, KeyboardShortcut>;
  config: Record<string, ShortcutConfig>;
  isEnabled: boolean;
  registerShortcut: (shortcut: Omit<KeyboardShortcut, 'enabled'>) => void;
  updateShortcutConfig: (id: string, config: Partial<ShortcutConfig>) => void;
  setEnabled: (enabled: boolean) => void;
  executeShortcut: (id: string) => void;
}

export interface KeyCombination {
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  key: string;
}