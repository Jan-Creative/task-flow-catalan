import React, { useState } from 'react';
import { format } from 'date-fns';
import { Bell, Clock, Calendar, Plus, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  datetime: string;
  message: string;
}

interface NewReminderBuilderProps {
  reminders: Reminder[];
  onAdd: (reminder: { datetime: string; message: string }) => void;
  onRemove: (id: string) => void;
  startDate?: string;
  dueDate?: string;
  disabled?: boolean;
}

export const NewReminderBuilder: React.FC<NewReminderBuilderProps> = ({
  reminders,
  onAdd,
  onRemove,
  startDate,
  dueDate,
  disabled = false
}) => {
  const [reminderType, setReminderType] = useState<'exact' | 'relative'>('relative');
  const [exactDate, setExactDate] = useState<Date>();
  const [exactTime, setExactTime] = useState('09:00');
  const [relativeType, setRelativeType] = useState<'start' | 'due'>('due');
  const [relativeAmount, setRelativeAmount] = useState('15');
  const [relativeUnit, setRelativeUnit] = useState('minutes');
  const [relativeBefore, setRelativeBefore] = useState(true);
  const [message, setMessage] = useState('');

  // Quick reminder options
  const quickOptions = {
    start: [
      { label: '5 minuts abans', amount: 5, unit: 'minutes', before: true },
      { label: '15 minuts abans', amount: 15, unit: 'minutes', before: true },
      { label: '30 minuts abans', amount: 30, unit: 'minutes', before: true },
      { label: '1 hora abans', amount: 60, unit: 'minutes', before: true },
    ],
    due: [
      { label: '15 minuts abans', amount: 15, unit: 'minutes', before: true },
      { label: '1 hora abans', amount: 60, unit: 'minutes', before: true },
      { label: '1 dia abans', amount: 1, unit: 'days', before: true },
      { label: '1 setmana abans', amount: 1, unit: 'weeks', before: true },
    ]
  };

  const calculateRelativeDate = (): Date | null => {
    const baseDate = relativeType === 'start' ? startDate : dueDate;
    if (!baseDate) return null;

    const base = new Date(baseDate);
    const amount = parseInt(relativeAmount);
    if (isNaN(amount)) return null;

    let milliseconds = 0;
    switch (relativeUnit) {
      case 'minutes':
        milliseconds = amount * 60 * 1000;
        break;
      case 'hours':
        milliseconds = amount * 60 * 60 * 1000;
        break;
      case 'days':
        milliseconds = amount * 24 * 60 * 60 * 1000;
        break;
      case 'weeks':
        milliseconds = amount * 7 * 24 * 60 * 60 * 1000;
        break;
    }

    return new Date(base.getTime() + (relativeBefore ? -milliseconds : milliseconds));
  };

  const getCalculatedDate = (): Date | null => {
    if (reminderType === 'exact') {
      if (!exactDate || !exactTime) return null;
      const [hours, minutes] = exactTime.split(':').map(Number);
      const date = new Date(exactDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    } else {
      return calculateRelativeDate();
    }
  };

  const isValidReminder = (): boolean => {
    const calculatedDate = getCalculatedDate();
    if (!calculatedDate) return false;
    
    // Must be in the future
    if (calculatedDate <= new Date()) return false;
    
    // For relative reminders, check logical constraints
    if (reminderType === 'relative') {
      const baseDate = relativeType === 'start' ? startDate : dueDate;
      if (!baseDate) return false;
      
      // If "before", reminder should be before the base date
      if (relativeBefore && calculatedDate >= new Date(baseDate)) return false;
      // If "after", reminder should be after the base date
      if (!relativeBefore && calculatedDate <= new Date(baseDate)) return false;
    }
    
    return true;
  };

  const handleAddReminder = () => {
    const calculatedDate = getCalculatedDate();
    if (!calculatedDate || !isValidReminder()) return;

    onAdd({
      datetime: calculatedDate.toISOString(),
      message: message || 'Recordatori de tasca'
    });

    // Reset form
    setExactDate(undefined);
    setExactTime('09:00');
    setRelativeAmount('15');
    setMessage('');
  };

  const handleQuickAdd = (option: any) => {
    const baseDate = relativeType === 'start' ? startDate : dueDate;
    if (!baseDate) return;

    const base = new Date(baseDate);
    let milliseconds = 0;
    
    switch (option.unit) {
      case 'minutes':
        milliseconds = option.amount * 60 * 1000;
        break;
      case 'days':
        milliseconds = option.amount * 24 * 60 * 60 * 1000;
        break;
      case 'weeks':
        milliseconds = option.amount * 7 * 24 * 60 * 60 * 1000;
        break;
    }

    const reminderDate = new Date(base.getTime() - milliseconds);
    
    if (reminderDate > new Date()) {
      onAdd({
        datetime: reminderDate.toISOString(),
        message: `${option.label} del ${relativeType === 'start' ? 'inici' : 'venciment'}`
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing reminders */}
      {reminders.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Recordatoris actius</Label>
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              <Bell className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  {format(new Date(reminder.datetime), 'PPp')}
                </div>
                {reminder.message && (
                  <div className="text-xs text-muted-foreground truncate">
                    {reminder.message}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(reminder.id)}
                disabled={disabled}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Quick options */}
      {(startDate || dueDate) && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Opcions ràpides</Label>
          
          {/* Compact type selector */}
          <div className="flex gap-1">
            {startDate && (
              <Button
                type="button"
                variant={relativeType === 'start' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRelativeType('start')}
                disabled={disabled}
                className="text-xs px-2 py-1 h-7"
              >
                Inici
              </Button>
            )}
            {dueDate && (
              <Button
                type="button"
                variant={relativeType === 'due' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRelativeType('due')}
                disabled={disabled}
                className="text-xs px-2 py-1 h-7"
              >
                Venciment
              </Button>
            )}
          </div>

          {/* Compact quick buttons */}
          <div className="flex flex-wrap gap-1">
            {quickOptions[relativeType]?.map((option, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(option)}
                disabled={disabled}
                className="text-xs px-2 py-1 h-7"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced reminder builder */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Crear recordatori personalitzat</Label>
        
        {/* Compact type selector */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant={reminderType === 'exact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setReminderType('exact')}
            disabled={disabled}
            className="text-xs px-2 py-1 h-7"
          >
            Data exacta
          </Button>
          {(startDate || dueDate) && (
            <Button
              type="button"
              variant={reminderType === 'relative' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setReminderType('relative')}
              disabled={disabled}
              className="text-xs px-2 py-1 h-7"
            >
              Relatiu
            </Button>
          )}
        </div>

        {/* Compact exact date picker */}
        {reminderType === 'exact' && (
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "justify-start text-left font-normal text-xs h-8",
                    !exactDate && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  <Calendar className="mr-1 h-3 w-3" />
                  {exactDate ? format(exactDate, "dd/MM") : "Data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-sm border" align="start">
                <CalendarComponent
                  mode="single"
                  selected={exactDate}
                  onSelect={setExactDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Input
              type="time"
              value={exactTime}
              onChange={(e) => setExactTime(e.target.value)}
              disabled={disabled}
              className="text-xs h-8"
            />
          </div>
        )}

        {/* Compact relative time builder */}
        {reminderType === 'relative' && (startDate || dueDate) && (
          <div className="grid grid-cols-4 gap-1">
            <Input
              type="number"
              value={relativeAmount}
              onChange={(e) => setRelativeAmount(e.target.value)}
              placeholder="15"
              min="1"
              disabled={disabled}
              className="text-xs h-8"
            />
            
            <Select value={relativeUnit} onValueChange={setRelativeUnit} disabled={disabled}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-sm border">
                <SelectItem value="minutes">min</SelectItem>
                <SelectItem value="hours">hores</SelectItem>
                <SelectItem value="days">dies</SelectItem>
                <SelectItem value="weeks">setm</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={relativeBefore ? 'before' : 'after'} onValueChange={(value) => setRelativeBefore(value === 'before')} disabled={disabled}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-sm border">
                <SelectItem value="before">abans</SelectItem>
                <SelectItem value="after">després</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={relativeType} onValueChange={(value: 'start' | 'due') => setRelativeType(value)} disabled={disabled}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-sm border">
                {startDate && <SelectItem value="start">inici</SelectItem>}
                {dueDate && <SelectItem value="due">venciment</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Compact message input */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Missatge (opcional)"
          disabled={disabled}
          className="text-xs h-8"
        />

        {/* Preview */}
        {getCalculatedDate() && (
          <div className={cn(
            "text-xs p-2 rounded border-l-2",
            isValidReminder() 
              ? "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400"
              : "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400"
          )}>
            {isValidReminder() 
              ? `✅ Recordatori: ${format(getCalculatedDate()!, 'PPp')}`
              : "⚠️ Recordatori no vàlid (ha de ser en el futur)"
            }
          </div>
        )}

        {/* Compact add button */}
        <Button
          type="button"
          onClick={handleAddReminder}
          disabled={disabled || !isValidReminder()}
          className="w-full text-xs h-8"
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Afegir
        </Button>
      </div>
    </div>
  );
};
