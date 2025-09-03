import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { TimeBlock, TimeBlockNotificationConfig } from '@/types/timeblock';

interface CreateTimeBlockModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (block: Omit<TimeBlock, 'id'>) => void;
  editingBlock?: TimeBlock | null;
  onDelete?: () => void;
  notificationConfig?: TimeBlockNotificationConfig;
}

const timeOptions = Array.from({ length: 15 * 4 }, (_, i) => {
  const totalMinutes = (8 * 60) + (i * 15); // Start at 8:00, 15-minute intervals
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
  onDelete,
  notificationConfig
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
      setTitle('');
      setDescription('');
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('#3b82f6');
      // Apply defaults from config if available
      setNotifyStart(notificationConfig?.defaultStartEnabled || false);
      setNotifyEnd(notificationConfig?.defaultEndEnabled || false);
      setStartReminderMinutes(notificationConfig?.defaultStartReminder || 5);
      setEndReminderMinutes(notificationConfig?.defaultEndReminder || 5);
    }
  }, [editingBlock, notificationConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    // Validate time order
    const [startHour, startMinutes] = startTime.split(':').map(Number);
    const [endHour, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinutes;
    const endTotalMinutes = endHour * 60 + endMinutes;
    
    if (endTotalMinutes <= startTotalMinutes) {
      alert('L\'hora de fi ha de ser posterior a l\'hora d\'inici');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      startTime,
      endTime,
      color,
      notifications: notificationConfig?.enableGlobal ? {
        start: notifyStart,
        end: notifyEnd
      } : undefined,
      reminderMinutes: notificationConfig?.enableGlobal ? {
        start: startReminderMinutes,
        end: endReminderMinutes
      } : undefined,
    });

    if (!isEditing) {
      setTitle('');
      setDescription('');
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('#3b82f6');
      setNotifyStart(notificationConfig?.defaultStartEnabled || false);
      setNotifyEnd(notificationConfig?.defaultEndEnabled || false);
      setStartReminderMinutes(notificationConfig?.defaultStartReminder || 5);
      setEndReminderMinutes(notificationConfig?.defaultEndReminder || 5);
    }
  };

  const selectedColor = colorOptions.find(opt => opt.value === color);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="timeblock-desc">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Bloc de Temps' : 'Nou Bloc de Temps'}
          </DialogTitle>
        </DialogHeader>
        <p id="timeblock-desc" className="sr-only">Formulari per crear o editar un bloc de temps</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Títol del bloc</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descripció de l'activitat..."
              required
            />
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Hora d'inici</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="endTime">Hora de fi</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <Label>Color del bloc</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg border-2 transition-all hover:scale-105",
                    color === option.value 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div 
                    className="w-6 h-6 rounded-full mb-1"
                    style={{ backgroundColor: option.value }}
                  />
                  <span className="text-xs text-center leading-tight">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
            {selectedColor && (
              <p className="text-xs text-muted-foreground mt-1">
                Suggeriment: {selectedColor.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descripció (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalls adicionals, objectius..."
              rows={3}
            />
          </div>

          {/* Notifications Section */}
          {notificationConfig?.enableGlobal && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <Label className="font-medium">Notificacions</Label>
              </div>
              
              {/* Start notification */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyStart" className="text-sm">
                    Notificar a l'inici
                  </Label>
                  <Switch
                    id="notifyStart"
                    checked={notifyStart}
                    onCheckedChange={setNotifyStart}
                  />
                </div>
                
                {notifyStart && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Avís abans de l'inici:
                    </Label>
                    <Select 
                      value={startReminderMinutes.toString()}
                      onValueChange={(value) => setStartReminderMinutes(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reminderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* End notification */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyEnd" className="text-sm">
                    Notificar al final
                  </Label>
                  <Switch
                    id="notifyEnd"
                    checked={notifyEnd}
                    onCheckedChange={setNotifyEnd}
                  />
                </div>
                
                {notifyEnd && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Avís abans del final:
                    </Label>
                    <Select 
                      value={endReminderMinutes.toString()}
                      onValueChange={(value) => setEndReminderMinutes(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reminderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDelete}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel·lar
            </Button>
            <Button type="submit">
              {isEditing ? 'Actualitzar' : 'Crear Bloc'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};