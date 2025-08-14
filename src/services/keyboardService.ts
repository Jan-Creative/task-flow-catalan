// ============= SERVEI CORE PER SISTEMA DE DRECERES =============

import type { KeyboardShortcut, KeyCombination, ShortcutConfig } from '@/types/shortcuts';

export class KeyboardService {
  private listeners: Map<string, (event: KeyboardEvent) => void> = new Map();
  private shortcuts: Map<string, KeyboardShortcut> = new Map();

  /**
   * Converteix un event de teclat a combinació de tecles
   */
  static eventToKeyCombination(event: KeyboardEvent): KeyCombination {
    return {
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      key: event.key.toLowerCase()
    };
  }

  /**
   * Converteix una array de tecles a string per comparació
   */
  static keysToString(keys: string[]): string {
    return keys.map(k => k.toLowerCase()).sort().join('+');
  }

  /**
   * Converteix una combinació de tecles a string
   */
  static combinationToString(combination: KeyCombination): string {
    const parts: string[] = [];
    
    if (combination.ctrlKey) parts.push('ctrl');
    if (combination.metaKey) parts.push('meta');
    if (combination.shiftKey) parts.push('shift');
    if (combination.altKey) parts.push('alt');
    parts.push(combination.key);
    
    return parts.sort().join('+');
  }

  /**
   * Comprova si un element és un input que accepta text
   */
  static isTextInput(element: Element): boolean {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['text', 'password', 'email', 'search', 'url', 'tel'];
    
    if (tagName === 'textarea') return true;
    if (tagName === 'input') {
      const type = (element as HTMLInputElement).type?.toLowerCase();
      return !type || inputTypes.includes(type);
    }
    if (element.getAttribute('contenteditable') === 'true') return true;
    
    return false;
  }

  /**
   * Registra una drecera
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  /**
   * Desregistra una drecera
   */
  unregisterShortcut(id: string): void {
    this.shortcuts.delete(id);
    this.listeners.delete(id);
  }

  /**
   * Comprova si una combinació de tecles coincideix amb una drecera
   */
  matchesShortcut(combination: KeyCombination, shortcut: KeyboardShortcut): boolean {
    if (!shortcut.enabled || shortcut.keys.length === 0) return false;
    
    const combinationString = KeyboardService.combinationToString(combination);
    const shortcutString = KeyboardService.keysToString(shortcut.keys);
    
    return combinationString === shortcutString;
  }

  /**
   * Busca dreceres que coincideixin amb una combinació
   */
  findMatchingShortcuts(combination: KeyCombination): KeyboardShortcut[] {
    const matches: KeyboardShortcut[] = [];
    
    for (const shortcut of this.shortcuts.values()) {
      if (this.matchesShortcut(combination, shortcut)) {
        matches.push(shortcut);
      }
    }
    
    return matches;
  }

  /**
   * Executa una drecera per ID
   */
  executeShortcut(id: string): boolean {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut || !shortcut.enabled) return false;
    
    try {
      shortcut.action();
      return true;
    } catch (error) {
      console.error(`Error executant drecera ${id}:`, error);
      return false;
    }
  }

  /**
   * Gestiona events de teclat globals
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    // No processar si s'està editant text
    if (KeyboardService.isTextInput(event.target as Element)) {
      return false;
    }

    const combination = KeyboardService.eventToKeyCombination(event);
    const matchingShortcuts = this.findMatchingShortcuts(combination);
    
    if (matchingShortcuts.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      
      // Executar la primera drecera que coincideixi
      const shortcut = matchingShortcuts[0];
      this.executeShortcut(shortcut.id);
      
      return true;
    }
    
    return false;
  }

  /**
   * Neteja tots els listeners i dreceres
   */
  cleanup(): void {
    this.shortcuts.clear();
    this.listeners.clear();
  }
}

// Instància global del servei
export const keyboardService = new KeyboardService();