/**
 * Memoized Task Form Components - Components optimitzats per performance
 */

import React, { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PropertyBadge } from '@/components/ui/property-badge';
import { CalendarIcon, FileText, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ============= STATUS SELECTOR =============
interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface StatusSelectorProps {
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TaskStatusSelector = memo<StatusSelectorProps>(({ 
  value, 
  options, 
  onChange, 
  disabled 
}) => {
  const selectedOption = useMemo(
    () => options.find(opt => opt.value === value),
    [options, value]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Estat</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "border-2",
              value === option.value && "ring-2 ring-offset-2"
            )}
            style={value === option.value ? {
              backgroundColor: option.color,
              borderColor: option.color
            } : {
              borderColor: option.color
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
});

TaskStatusSelector.displayName = 'TaskStatusSelector';

// ============= PRIORITY SELECTOR =============
interface PrioritySelectorProps {
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TaskPrioritySelector = memo<PrioritySelectorProps>(({ 
  value, 
  options, 
  onChange, 
  disabled 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Prioritat</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "border-2",
              value === option.value && "ring-2 ring-offset-2"
            )}
            style={value === option.value ? {
              backgroundColor: option.color,
              borderColor: option.color
            } : {
              borderColor: option.color
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
});

TaskPrioritySelector.displayName = 'TaskPrioritySelector';

// ============= DATE PICKER =============
interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

export const TaskDatePicker = memo<DatePickerProps>(({ 
  value, 
  onChange, 
  isOpen, 
  onOpenChange, 
  disabled 
}) => {
  const displayDate = useMemo(() => {
    if (!value) return "Seleccionar data";
    try {
      return format(new Date(value), "PPP", { locale: ca });
    } catch {
      return "Data invàlida";
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      onOpenChange(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={handleDateSelect}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
});

TaskDatePicker.displayName = 'TaskDatePicker';

// ============= CUSTOM PROPERTIES DISPLAY =============
interface CustomProperty {
  propertyId: string;
  optionId: string;
}

interface PropertyDefinition {
  id: string;
  name: string;
  icon?: string;
  options: Array<{
    id: string;
    label: string;
    color: string;
    icon?: string;
  }>;
}

interface CustomPropertiesDisplayProps {
  properties: CustomProperty[];
  definitions: PropertyDefinition[];
  onRemove: (propertyId: string) => void;
  disabled?: boolean;
}

export const CustomPropertiesDisplay = memo<CustomPropertiesDisplayProps>(({ 
  properties, 
  definitions, 
  onRemove, 
  disabled 
}) => {
  const propertiesWithDetails = useMemo(() => {
    return properties.map(prop => {
      const definition = definitions.find(d => d.id === prop.propertyId);
      const option = definition?.options.find(o => o.id === prop.optionId);
      
      return {
        ...prop,
        definition,
        option
      };
    }).filter(p => p.definition && p.option);
  }, [properties, definitions]);

  if (propertiesWithDetails.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Propietats personalitzades</label>
      <div className="flex flex-wrap gap-2">
        {propertiesWithDetails.map(({ propertyId, definition, option }) => (
          <PropertyBadge
            key={propertyId}
            propertyName={definition!.name}
            optionValue={option!.id}
            optionLabel={option!.label}
            optionColor={option!.color}
            optionIcon={option!.icon}
          />
        ))}
      </div>
    </div>
  );
});

CustomPropertiesDisplay.displayName = 'CustomPropertiesDisplay';

// ============= DESCRIPTION TOGGLE =============
interface DescriptionToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const DescriptionToggle = memo<DescriptionToggleProps>(({ 
  isOpen, 
  onToggle, 
  disabled 
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onToggle}
      disabled={disabled}
      className="h-8 px-3"
    >
      <FileText className="h-4 w-4 mr-2" />
      {isOpen ? "Amagar descripció" : "Afegir descripció"}
    </Button>
  );
});

DescriptionToggle.displayName = 'DescriptionToggle';