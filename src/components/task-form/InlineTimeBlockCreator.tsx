/**
 * Inline Time Block Creator - Quick time block creation within task form
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Clock, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeBlock } from '@/types/timeblock';

interface InlineTimeBlockCreatorProps {
  onTimeBlockCreate: (block: Omit<TimeBlock, 'id'>) => void;
  onCancel: () => void;
  className?: string;
}

// Generate time options
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

const quickColorOptions = [
  { value: '#ef4444', label: 'Vermell', category: 'Urgent' },
  { value: '#f97316', label: 'Taronja', category: 'Reunions' },
  { value: '#22c55e', label: 'Verd', category: 'Productiu' },
  { value: '#3b82f6', label: 'Blau', category: 'Focus' },
  { value: '#8b5cf6', label: 'Violeta', category: 'Creativitat' },
  { value: '#64748b', label: 'Gris', category: 'Administratiu' },
];

export const InlineTimeBlockCreator: React.FC<InlineTimeBlockCreatorProps> = ({
  onTimeBlockCreate,
  onCancel,
  className
}) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    // Validate time order
    const [startHour, startMinutes] = startTime.split(':').map(Number);
    const [endHour, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinutes;
    const endTotalMinutes = endHour * 60 + endMinutes;
    
    if (endTotalMinutes <= startTotalMinutes) {
      return; // Invalid time range
    }

    setIsSubmitting(true);
    
    try {
      await onTimeBlockCreate({
        title: title.trim(),
        startTime,
        endTime,
        color,
        notifications: {
          start: false,
          end: false
        }
      });
      
      // Reset form
      setTitle('');
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('#3b82f6');
    } catch (error) {
      console.error('Error creating time block:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedColorOption = quickColorOptions.find(opt => opt.value === color);

  return (
    <Card className={cn("border-dashed border-2 border-muted-foreground/25", className)}>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-border/20">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Crear Bloc de Temps</h4>
              <p className="text-xs text-muted-foreground">Crea un bloc reutilitzable per aquesta tasca</p>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="block-title" className="text-xs font-medium">
              Nom del bloc
            </Label>
            <Input
              id="block-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Reunió d'equip, Focus profund..."
              className="h-8 text-sm"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="block-start" className="text-xs font-medium">
                Inici
              </Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time} className="text-sm">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="block-end" className="text-xs font-medium">
                Fi
              </Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time} className="text-sm">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Color Selection */}
          <div>
            <Label className="text-xs font-medium flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Color
            </Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {quickColorOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md border transition-all hover:scale-[1.02]",
                    color === option.value 
                      ? "border-primary ring-1 ring-primary/20 bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: option.value }}
                  />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            {selectedColorOption && (
              <p className="text-xs text-muted-foreground mt-1">
                Ideal per: {selectedColorOption.category}
              </p>
            )}
          </div>

          {/* Duration Info */}
          <div className="p-2 bg-muted/20 rounded-md">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Durada: {(() => {
                  const [startHour, startMinutes] = startTime.split(':').map(Number);
                  const [endHour, endMinutes] = endTime.split(':').map(Number);
                  const startTotal = startHour * 60 + startMinutes;
                  const endTotal = endHour * 60 + endMinutes;
                  const duration = endTotal - startTotal;
                  const hours = Math.floor(duration / 60);
                  const minutes = duration % 60;
                  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
                })()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1 h-8 text-xs"
            >
              Cancel·lar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || isSubmitting}
              className="flex-1 h-8 text-xs"
            >
              {isSubmitting ? 'Creant...' : 'Crear i Assignar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};