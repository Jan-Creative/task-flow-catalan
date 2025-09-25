/**
 * SimpleTaskForm - Formulari ultra bàsic per iPhone
 * Sistema simplificat i net
 */

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SimpleTaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (title: string) => void;
}

export const SimpleTaskForm: React.FC<SimpleTaskFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Sistema avançat de focus amb sincronització d'animacions i iOS-específic
  useEffect(() => {
    if (open && inputRef.current) {
      console.log('🎯 SimpleTaskForm: Iniciant sistema avançat d\'auto-focus...');
      
      let focusApplied = false;
      let animationCompleted = false;
      
      // Detectar quan l'animació del Dialog ha acabat
      const dialogContent = document.querySelector('[role="dialog"]');
      
      const applyAdvancedFocus = () => {
        if (inputRef.current && !focusApplied) {
          console.log('🎯 Aplicant focus avançat...');
          
          // Estratègia iOS-específica
          const input = inputRef.current;
          
          // 1. Touchstart simulat per iOS
          const touchEvent = new Event('touchstart', { bubbles: true });
          input.dispatchEvent(touchEvent);
          
          // 2. Focus + select per assegurar selecció
          input.focus();
          input.select();
          
          // 3. Click simulat com a fallback
          setTimeout(() => {
            if (document.activeElement !== input) {
              console.log('🎯 Aplicant click simulat...');
              input.click();
              input.focus();
              input.select();
            }
          }, 50);
          
          // Verificació amb haptic feedback
          setTimeout(() => {
            if (document.activeElement === input) {
              console.log('✅ Focus aplicat correctament amb vibració');
              focusApplied = true;
              // Vibració hàptica a iOS si està disponible
              if ('vibrate' in navigator) {
                navigator.vibrate(10);
              }
            } else {
              console.log('❌ Focus fallit, activant fallback visual');
              // Aquí podríem afegir un indicador visual si calgués
            }
          }, 200);
        }
      };
      
      // Escoltar la finalització de l'animació del Dialog
      if (dialogContent) {
        const handleAnimationEnd = () => {
          console.log('🎯 Animació del Dialog completada');
          animationCompleted = true;
          setTimeout(applyAdvancedFocus, 100);
        };
        
        dialogContent.addEventListener('transitionend', handleAnimationEnd);
        dialogContent.addEventListener('animationend', handleAnimationEnd);
        
        // Cleanup
        return () => {
          dialogContent.removeEventListener('transitionend', handleAnimationEnd);
          dialogContent.removeEventListener('animationend', handleAnimationEnd);
        };
      }
      
      // Fallback temporal si no detectem animacions
      setTimeout(() => {
        if (!animationCompleted) {
          console.log('🎯 Fallback temporal: aplicant focus sense esperar animació');
          applyAdvancedFocus();
        }
      }, 800);
      
      // Fallback final després de 1.5 segons
      setTimeout(() => {
        if (!focusApplied) {
          console.log('🎯 Fallback final: forçant focus');
          applyAdvancedFocus();
        }
      }, 1500);
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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && title.trim()) {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="w-full max-w-sm mx-auto p-0 border-0 bg-transparent shadow-none fixed bottom-8 left-4 right-4 top-auto translate-x-0 translate-y-0"
        onKeyDown={handleKeyDown}
      >
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
          {/* Header minimal */}
          <div className="px-4 py-3 border-b border-border/20">
            <h3 className="text-sm font-medium text-foreground/80">
              Nova tasca
            </h3>
          </div>
          
          {/* Form content */}
          <form onSubmit={handleSubmit} className="p-4">
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escriu el títol de la tasca..."
              className="w-full text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-foreground"
              autoComplete="off"
              autoCapitalize="sentences"
              inputMode="text"
              enterKeyHint="done"
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};