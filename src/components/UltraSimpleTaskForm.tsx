/**
 * UltraSimpleTaskForm - Formulari ultra optimitzat per iPhone
 * Fase 1: Només títol amb detecció perfecta de teclat
 */

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useKeyboardHeight } from '@/hooks/device/useKeyboardHeight';
import { useIOSDetection } from '@/hooks/useIOSDetection';
import { usePhoneDetection } from '@/hooks/device/usePhoneDetection';
import { cn } from '@/lib/utils';

interface UltraSimpleTaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (title: string) => void;
}

export const UltraSimpleTaskForm: React.FC<UltraSimpleTaskFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardState = useKeyboardHeight();
  const isIOS = useIOSDetection();
  const phoneInfo = usePhoneDetection();
  
  // Auto-focus quan s'obre el modal
  useEffect(() => {
    if (open && inputRef.current) {
      // Delay lleuger per assegurar que el modal s'ha renderitzat
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        console.log('🎯 Auto-focus activat:', { open, isIOS, isPhone: phoneInfo.isPhone });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open, isIOS, phoneInfo.isPhone]);

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

  // Calculem el posicionament dinàmic per iPhone
  const dynamicStyle = React.useMemo(() => {
    if (!isIOS || !phoneInfo.isPhone || !keyboardState.isVisible) {
      return {};
    }
    
    // Posicionar just al damunt del teclat amb marge de seguretat
    const bottomOffset = keyboardState.height + 20;
    
    console.log('📱 Posicionament dinàmic:', {
      keyboardHeight: keyboardState.height,
      keyboardVisible: keyboardState.isVisible,
      bottomOffset,
      safeAreaBottom: phoneInfo.safeAreaBottom
    });
    
    return {
      transform: `translateY(-${bottomOffset}px)`,
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  }, [isIOS, phoneInfo.isPhone, keyboardState.height, keyboardState.isVisible, phoneInfo.safeAreaBottom]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "w-full max-w-sm mx-auto p-0 border-0 bg-transparent shadow-none",
          // Posicionament especial per iPhone
          isIOS && phoneInfo.isPhone && "fixed bottom-4 left-4 right-4 top-auto translate-x-0 translate-y-0"
        )}
        style={isIOS && phoneInfo.isPhone ? dynamicStyle : {}}
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
              className={cn(
                "w-full text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground/60 text-foreground"
              )}
              autoComplete="off"
              autoCapitalize="sentences"
              autoCorrect="on"
            />
          </form>
          
          {/* Debug info en development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="px-4 pb-2 text-xs text-muted-foreground/50 space-y-1">
              <div>🎹 Teclat: {keyboardState.isVisible ? `${keyboardState.height}px` : 'Tancat'}</div>
              <div>📱 iOS: {isIOS ? 'Sí' : 'No'} | Phone: {phoneInfo.isPhone ? 'Sí' : 'No'}</div>
              {isIOS && phoneInfo.isPhone && (
                <div>📐 SafeArea: {phoneInfo.safeAreaBottom}px</div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};