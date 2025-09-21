import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Bell, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { getIntelligentDefaultTimes } from '@/utils/timeUtils';
import type { TimeBlock } from '@/types/timeblock';

interface CreateTimeBlockModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (block: Omit<TimeBlock, 'id'>) => void;
  editingBlock?: TimeBlock | null;
  onDelete?: () => void;
}

// Generate 24-hour time options with 15-minute intervals (00:00 to 23:45)
const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const totalMinutes = i * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

const reminderOptions = [
  { value: 0, label: 'En el moment exacte' },
  { value: 5, label: '5 minuts abans' },
  { value: 10, label: '10 minuts abans' },
  { value: 15, label: '15 minuts abans' },
  { value: 30, label: '30 minuts abans' },
];

const colorOptions = [
  { value: '#ef4444', label: 'Vermell', name: 'Urgent/Important' },
  { value: '#f97316', label: 'Taronja', name: 'Reunions' },
  { value: '#eab308', label: 'Groc', name: 'Planificació' },
  { value: '#22c55e', label: 'Verd', name: 'Tasques productives' },
  { value: '#3b82f6', label: 'Blau', name: 'Comunicació' },
  { value: '#8b5cf6', label: 'Violeta', name: 'Creativitat' },
  { value: '#ec4899', label: 'Rosa', name: 'Personal' },
  { value: '#64748b', label: 'Gris', name: 'Administratiu' },
];

export const CreateTimeBlockModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  editingBlock,
  onDelete
}: CreateTimeBlockModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#3b82f6');
  const [notifyStart, setNotifyStart] = useState(false);
  const [notifyEnd, setNotifyEnd] = useState(false);
  const [startReminderMinutes, setStartReminderMinutes] = useState(5);
  const [endReminderMinutes, setEndReminderMinutes] = useState(5);

  const isEditing = !!editingBlock;

  useEffect(() => {
    if (editingBlock) {
      setTitle(editingBlock.title);
      setDescription(editingBlock.description || '');
      setStartTime(editingBlock.startTime);
      setEndTime(editingBlock.endTime);
      setColor(editingBlock.color);
      setNotifyStart(editingBlock.notifications?.start || false);
      setNotifyEnd(editingBlock.notifications?.end || false);
      setStartReminderMinutes(editingBlock.reminderMinutes?.start || 5);
      setEndReminderMinutes(editingBlock.reminderMinutes?.end || 5);
    } else {
      // Use intelligent default times based on current time
      const { startTime: defaultStart, endTime: defaultEnd } = getIntelligentDefaultTimes();
      
      setTitle('');
      setDescription('');
      setStartTime(defaultStart);
      setEndTime(defaultEnd);
      setColor('#3b82f6');
      // Smart defaults: enable start notifications during work hours
      const currentHour = new Date().getHours();
      const isWorkHours = currentHour >= 8 && currentHour <= 18;
      setNotifyStart(isWorkHours);
      setNotifyEnd(false);
      setStartReminderMinutes(5);
      setEndReminderMinutes(5);
    }
  }, [editingBlock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    // Validate time order with support for cross-midnight blocks
    const [startHour, startMinutes] = startTime.split(':').map(Number);
    const [endHour, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinutes;
    let endTotalMinutes = endHour * 60 + endMinutes;
    
    // If end time is earlier than start time, assume it's the next day
    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60; // Add 24 hours
    }
    
    // Ensure minimum duration of 15 minutes
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    if (durationMinutes < 15) {
      alert('La durada mínima del bloc ha de ser de 15 minuts');
      return;
    }
    
    // Warn for very long blocks (more than 8 hours)
    if (durationMinutes > 8 * 60) {
      const confirmed = confirm('Aquest bloc té una durada de més de 8 hores. Estàs segur?');
      if (!confirmed) return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        startTime,
        endTime,
        color,
        notifications: {
          start: notifyStart,
          end: notifyEnd
        },
        reminderMinutes: {
          start: startReminderMinutes,
          end: endReminderMinutes
        },
      });

      if (!isEditing) {
        // Use intelligent default times for the next block
        const { startTime: defaultStart, endTime: defaultEnd } = getIntelligentDefaultTimes();
        
        setTitle('');
        setDescription('');
        setStartTime(defaultStart);
        setEndTime(defaultEnd);
        setColor('#3b82f6');
        // Keep smart defaults for next blocks
        const currentHour = new Date().getHours();
        const isWorkHours = currentHour >= 8 && currentHour <= 18;
        setNotifyStart(isWorkHours);
        setNotifyEnd(false);
        setStartReminderMinutes(5);
        setEndReminderMinutes(5);
      }
    } catch (error) {
      console.error('Error submitting time block:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
    
    // Return to save (simple Enter key)
    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && title.trim()) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-lg max-h-[85vh] overflow-hidden p-0 gap-0 bg-background/5 backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110 border border-white/5 rounded-2xl shadow-lg/10" 
        overlayClassName="bg-transparent"
        onKeyDown={handleKeyDown}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? 'Editar Bloc' : 'Nou Bloc'}
            </h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-white/15 rounded-lg transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col" autoComplete="off">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Title & Time Section */}
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Títol del bloc..."
                className="h-10 bg-white/5 border-white/10 focus:border-primary/50 text-base"
                required
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="h-10 bg-white/5 border-white/10 text-sm">
                    <SelectValue placeholder="Inici" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-background/95 border-white/10 max-h-60">
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger className="h-10 bg-white/5 border-white/10 text-sm">
                    <SelectValue placeholder="Final" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-background/95 border-white/10 max-h-60">
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Compact Color Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground/80">Color</Label>
              <div className="grid grid-cols-8 gap-2">
                {colorOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColor(option.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all duration-200",
                      color === option.value 
                        ? "border-white scale-110 shadow-md" 
                        : "border-white/20 hover:border-white/40 hover:scale-105"
                    )}
                    style={{ backgroundColor: option.value }}
                    title={option.name}
                  />
                ))}
              </div>
            </div>

            {/* Collapsible Description */}
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground/80 hover:text-foreground">
                <span>Descripció (opcional)</span>
                <div className="ml-auto w-4 h-4 transition-transform group-open:rotate-90">▶</div>
              </summary>
              <div className="mt-2">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalls del bloc..."
                  className="bg-white/5 border-white/10 text-sm resize-none"
                  rows={2}
                />
              </div>
            </details>

            {/* Compact Notifications */}
            <div className="space-y-2 p-3 border border-white/10 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-3.5 w-3.5 text-primary" />
                <Label className="text-xs font-medium text-primary">Notificacions</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Inici</span>
                  <Switch
                    checked={notifyStart}
                    onCheckedChange={setNotifyStart}
                    className="scale-75"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Final</span>
                  <Switch
                    checked={notifyEnd}
                    onCheckedChange={setNotifyEnd}
                    className="scale-75"
                  />
                </div>
              </div>
              
              {(notifyStart || notifyEnd) && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {notifyStart && (
                    <Select 
                      value={startReminderMinutes.toString()}
                      onValueChange={(value) => setStartReminderMinutes(parseInt(value))}
                    >
                      <SelectTrigger className="h-8 bg-white/5 border-white/10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reminderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.value === 0 ? 'Exacte' : `${option.value}min`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {notifyEnd && (
                    <Select 
                      value={endReminderMinutes.toString()}
                      onValueChange={(value) => setEndReminderMinutes(parseInt(value))}
                    >
                      <SelectTrigger className="h-8 bg-white/5 border-white/10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reminderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.value === 0 ? 'Exacte' : `${option.value}min`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t border-white/5 px-4 py-3 bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Enter • Esc
              </div>
              
              <div className="flex gap-2">
                {isEditing && onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-8 px-3 text-red-400 hover:bg-red-500/10 text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 px-3 text-xs"
                >
                  Cancel·lar
                </Button>
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={!title.trim()}
                  className="h-8 px-4 text-xs font-medium"
                >
                  {isEditing ? 'Actualitzar' : 'Crear'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
