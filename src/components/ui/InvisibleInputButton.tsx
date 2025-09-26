import React, { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
 * Component híbrid que combina un botó visual amb un camp de text invisible
 * per permetre l'activació automàtica del teclat a iOS
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

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Activar el camp invisible per desplegar el teclat
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleInputFocus = useCallback(() => {
    console.log('📱 Camp invisible activat - Teclat desplegant...');
    onInputFocus?.();
  }, [onInputFocus]);

  const handleInputBlur = useCallback(() => {
    console.log('📱 Camp invisible desactivat');
    onInputBlur?.();
  }, [onInputBlur]);

  return (
    <div className="relative">
      {/* Camp de text invisible posicionat sobre el botó */}
      <input
        ref={inputRef}
        type="text"
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-auto z-10 bg-transparent border-none outline-none text-transparent caret-transparent"
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        readOnly
        tabIndex={-1}
        style={{
          // Assegurar que el camp és completament invisible
          background: 'transparent',
          color: 'transparent',
          textShadow: 'none',
          caretColor: 'transparent'
        }}
      />
      
      {/* Botó visual que es renderitza per sota */}
      <Button
        size={size}
        variant={variant}
        className={cn(className, "relative z-0")}
        style={style}
        onClick={handleButtonClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
};