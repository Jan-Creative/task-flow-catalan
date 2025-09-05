/**
 * Compact Selectors - Optimized status/priority selectors for iPad sidebar
 */

import React, { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface CompactSelectorProps {
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  label: string;
  variant?: 'pills' | 'dropdown';
}

export const CompactSelector = memo<CompactSelectorProps>(({ 
  value, 
  options, 
  onChange, 
  disabled,
  label,
  variant = 'pills'
}) => {
  const selectedOption = useMemo(
    () => options.find(opt => opt.value === value),
    [options, value]
  );

  if (variant === 'dropdown') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start h-9",
            disabled && "opacity-50"
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedOption?.color }}
            />
            <span className="text-sm">{selectedOption?.label}</span>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <Button
              key={option.value}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={cn(
                "h-8 text-xs font-medium transition-all duration-200",
                "border border-border/60",
                isSelected && "shadow-sm",
                !isSelected && "hover:border-border hover:bg-muted/50"
              )}
              style={isSelected ? {
                backgroundColor: `${option.color}15`,
                borderColor: option.color,
                color: option.color
              } : undefined}
            >
              <div className="flex items-center gap-1.5">
                <div 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected && "ring-1 ring-white/30"
                  )}
                  style={{ backgroundColor: option.color }}
                />
                <span>{option.label}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
});

CompactSelector.displayName = 'CompactSelector';

// Specialized components for status and priority
export const CompactStatusSelector = memo<Omit<CompactSelectorProps, 'label'>>(
  (props) => <CompactSelector {...props} label="Estat" />
);

export const CompactPrioritySelector = memo<Omit<CompactSelectorProps, 'label'>>(
  (props) => <CompactSelector {...props} label="Prioritat" />
);

CompactStatusSelector.displayName = 'CompactStatusSelector';
CompactPrioritySelector.displayName = 'CompactPrioritySelector';