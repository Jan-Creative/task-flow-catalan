/**
 * Optimized Date Picker - Clean, compact date picker for iPad forms
 */

import React, { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface OptimizedDatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  compact?: boolean;
}

export const OptimizedDatePicker = memo<OptimizedDatePickerProps>(({ 
  value, 
  onChange, 
  onClear,
  disabled,
  placeholder = "Seleccionar data",
  label = "Data límit",
  compact = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const displayDate = useMemo(() => {
    if (!value) return placeholder;
    try {
      return format(new Date(value), compact ? "dd/MM/yy" : "PPP", { locale: ca });
    } catch {
      return "Data invàlida";
    }
  }, [value, placeholder, compact]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      
      <div className="relative">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                compact ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm",
                !value && "text-muted-foreground",
                "transition-colors duration-200",
                "hover:bg-muted/50 hover:border-border"
              )}
              disabled={disabled}
            >
              <CalendarIcon className={cn(
                compact ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4",
                "text-muted-foreground"
              )} />
              <span className="truncate">{displayDate}</span>
            </Button>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-auto p-0 shadow-lg border-border" 
            align="start"
            sideOffset={4}
          >
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Clear button */}
        {value && !disabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2",
              "h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive",
              "opacity-0 group-hover:opacity-100 transition-opacity"
            )}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
});

OptimizedDatePicker.displayName = 'OptimizedDatePicker';