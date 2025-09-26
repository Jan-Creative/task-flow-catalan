/**
 * KeyboardAdaptiveForm - Formulari que s'adapta al teclat iOS
 * Posicionament dinàmic per sobre del teclat amb targeta elegant
 */

import React, { useState, useRef, useEffect } from 'react';
import { useKeyboardHeight } from '@/hooks/device/useKeyboardHeight';
import { Input } from '@/components/ui/input';
import { X, Check } from 'lucide-react';

interface KeyboardAdaptiveFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (title: string) => void;
}

export const KeyboardAdaptiveForm: React.FC<KeyboardAdaptiveFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { height: keyboardHeight, isVisible: keyboardVisible } = useKeyboardHeight();
  
  // Posicionament dinàmic basat en l'altura del teclat
  const bottomOffset = keyboardVisible ? keyboardHeight + 20 : 40;
  
  // Auto-focus quan s'obre el formulari
  useEffect(() => {
    if (open && inputRef.current) {
      // Esperar que l'animació es completi abans d'aplicar focus
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        
        // Vibració hàptica lleu si està disponible
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Reset form quan es tanca
  useEffect(() => {
    if (!open) {
      setTitle('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit?.(title.trim());
      onClose();
      
      // Vibració de confirmació
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && title.trim()) {
      handleSubmit(e);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay amb blur */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Formulari adaptatiu */}
      <div 
        className="fixed left-4 right-4 z-50 transition-all duration-300 ease-out"
        style={{ 
          bottom: `${bottomOffset}px`,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Targeta elegant amb bordes arrodonides */}
        <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header amb indicadors */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                Nova tasca
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full transition-colors"
              aria-label="Tancar"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          {/* Form content */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-center space-x-3">
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Escriu el títol de la tasca..."
                className="flex-1 text-base font-medium border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                autoComplete="off"
                autoCapitalize="sentences"
                inputMode="text"
                enterKeyHint="done"
                onKeyDown={handleKeyDown}
              />
              
              {title.trim() && (
                <button
                  type="submit"
                  className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
                  aria-label="Crear tasca"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
          
          {/* Indicador del teclat (només en mode debug) */}
          {process.env.NODE_ENV === 'development' && keyboardVisible && (
            <div className="px-4 py-2 bg-primary/10 border-t border-border/50">
              <div className="text-xs text-muted-foreground text-center">
                Teclat: {keyboardHeight}px | Posició: {bottomOffset}px
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};