/**
 * Inline Description Field - Auto-expanding textarea with character count
 */

import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface InlineDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export const InlineDescriptionField: React.FC<InlineDescriptionFieldProps> = ({
  value,
  onChange,
  placeholder = "Afegeix una descripció opcional...",
  disabled,
  maxLength = 1000,
  className
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className={cn("space-y-2", className)}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "min-h-[80px] max-h-[200px] resize-none transition-all duration-200",
          "focus:ring-2 focus:ring-primary/20",
          isOverLimit && "border-destructive focus:border-destructive",
          className
        )}
        style={{
          height: 'auto',
          overflowY: value.split('\n').length > 8 ? 'auto' : 'hidden'
        }}
      />
      
      {maxLength && (
        <div className="flex justify-end">
          <span className={cn(
            "text-xs transition-colors",
            isOverLimit ? "text-destructive" : 
            isNearLimit ? "text-warning" : "text-muted-foreground"
          )}>
            {characterCount}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};