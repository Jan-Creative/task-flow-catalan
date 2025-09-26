import React, { useRef, useCallback } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InvisibleInputButtonProps {
  children: React.ReactNode;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
  style?: React.CSSProperties;
}

/**
 * Component d'input transparent que sembla un botó
 * per permetre l'activació directa del teclat a iOS
 */
export const InvisibleInputButton: React.FC<InvisibleInputButtonProps> = ({
  children,
  onInputFocus,
  onInputBlur,
  className,
  size = "lg",
  variant = "default",
  disabled = false,
  style,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputFocus = useCallback(() => {
    console.log('📱 Input directe activat - Teclat desplegant...');
    onInputFocus?.();
  }, [onInputFocus]);

  const handleInputBlur = useCallback(() => {
    console.log('📱 Input directe desactivat');
    onInputBlur?.();
  }, [onInputBlur]);

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    // NO preventDefault ni stopPropagation per mantenir el user gesture
    console.log('📱 Clic directe a l\'input');
  }, []);

  return (
    <div className="relative">
      {/* Input principal estilitzat com un botó */}
      <input
        ref={inputRef}
        type="text"
        className={cn(
          // Aplicar els estils del botó
          buttonVariants({ variant, size }),
          // Fer-lo transparent però funcional
          "bg-transparent text-transparent caret-transparent cursor-pointer",
          // Posicionament i interacció
          "relative z-10 pointer-events-auto",
          className
        )}
        style={{
          // Assegurar transparència total del text
          color: 'transparent',
          textShadow: 'none',
          caretColor: 'transparent',
          // Mantenir l'aparença del botó
          ...style
        }}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onClick={handleInputClick}
        readOnly
        disabled={disabled}
        {...props}
      />
      
      {/* Contingut visual del botó posicionat per sota */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-2 pointer-events-none z-0",
          buttonVariants({ variant, size, className: "bg-transparent border-transparent" })
        )}
        style={style}
      >
        {children}
      </div>
    </div>
  );
};