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
import { getIntelligentDefaultTimes } from '@/utils/timeUtils';
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
      // Use intelligent default times based on current time
      const { startTime: defaultStart, endTime: defaultEnd } = getIntelligentDefaultTimes();
      
      setTitle('');
      setDescription('');
      setStartTime(defaultStart);
      setEndTime(defaultEnd);
      setColor('#3b82f6');
      // Apply defaults from config if available
      setNotifyStart(notificationConfig?.defaultStartEnabled || false);
      setNotifyEnd(notificationConfig?.defaultEndEnabled || false);
      setStartReminderMinutes(notificationConfig?.defaultStartReminder || 5);
      setEndReminderMinutes(notificationConfig?.defaultEndReminder || 5);
    }
  }, [editingBlock, notificationConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
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
        setNotifyStart(notificationConfig?.defaultStartEnabled || false);
        setNotifyEnd(notificationConfig?.defaultEndEnabled || false);
        setStartReminderMinutes(notificationConfig?.defaultStartReminder || 5);
        setEndReminderMinutes(notificationConfig?.defaultEndReminder || 5);
      }
    } catch (error) {
      console.error('Error submitting time block:', error);
    }
  };

  const selectedColor = colorOptions.find(opt => opt.value === color);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md backdrop-blur-xl bg-background/95 border-white/10 shadow-2xl shadow-black/50" 
        overlayClassName="backdrop-blur-md bg-black/20"
        aria-describedby="timeblock-desc"
      >
        <DialogHeader className="border-b border-white/5 pb-4">
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {isEditing ? 'Editar Bloc de Temps' : 'Nou Bloc de Temps'}
          </DialogTitle>
        </DialogHeader>
        <p id="timeblock-desc" className="sr-only">Formulari per crear o editar un bloc de temps</p>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-foreground/80">Títol del bloc</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descripció de l'activitat..."
              className="bg-background/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
              required
            />
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime" className="text-sm font-medium text-foreground/80">Hora d'inici</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="bg-background/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-background/95 border-white/10">
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time} className="focus:bg-primary/20">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="endTime" className="text-sm font-medium text-foreground/80">Hora de fi</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="bg-background/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-background/95 border-white/10">
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time} className="focus:bg-primary/20">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <Label className="text-sm font-medium text-foreground/80">Color del bloc</Label>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {colorOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg",
                    color === option.value 
                      ? "border-white scale-110 shadow-lg shadow-primary/30" 
                      : "border-white/20 hover:border-white/40"
                  )}
                >
                  <div 
                    className="w-8 h-8 rounded-full mb-2 shadow-sm"
                    style={{ backgroundColor: option.value }}
                  />
                  <span className="text-xs text-center leading-tight text-foreground/70">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
            {selectedColor && (
              <p className="text-xs text-muted-foreground mt-2">
                Suggeriment: {selectedColor.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-foreground/80">Descripció (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalls adicionals, objectius..."
              className="bg-background/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
              rows={3}
            />
          </div>

          {/* Notifications Section - Always visible */}
          <div className="space-y-4 p-4 border border-white/10 rounded-xl bg-background/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <Label className="font-medium text-primary">Notificacions</Label>
              </div>
              {notificationConfig?.enableGlobal && (
                <div className="text-xs text-muted-foreground">
                  Configuració global activada
                </div>
              )}
            </div>
            
            {/* Start notification */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyStart" className="text-sm text-foreground/80">
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
                    <SelectTrigger className="bg-background/50 border-white/10 focus:border-primary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-background/95 border-white/10">
                      {reminderOptions.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()} className="focus:bg-primary/20">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-1">
                    Notificació programada per a les {(() => {
                      const [hours, minutes] = editingBlock?.startTime.split(':').map(Number) || startTime.split(':').map(Number);
                      const reminderTime = new Date();
                      reminderTime.setHours(hours, minutes - startReminderMinutes, 0, 0);
                      return reminderTime.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* End notification */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyEnd" className="text-sm text-foreground/80">
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
                    <SelectTrigger className="bg-background/50 border-white/10 focus:border-primary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-xl bg-background/95 border-white/10">
                      {reminderOptions.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()} className="focus:bg-primary/20">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-1">
                    Notificació programada per a les {(() => {
                      const [hours, minutes] = editingBlock?.endTime.split(':').map(Number) || endTime.split(':').map(Number);
                      const reminderTime = new Date();
                      reminderTime.setHours(hours, minutes - endReminderMinutes, 0, 0);
                      return reminderTime.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-6 border-t border-white/5">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDelete}
                className="mr-auto hover:scale-105 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-background/50 border-white/10 hover:bg-background/70 hover:scale-105 transition-all duration-200"
            >
              Cancel·lar
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-primary/20"
            >
              {isEditing ? 'Actualitzar' : 'Crear Bloc'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};