import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Bell, X, Clock } from 'lucide-react';
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

  const selectedColor = colorOptions.find(opt => opt.value === color);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-background/5 backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110 border border-white/5 rounded-2xl shadow-lg/10" 
        overlayClassName="bg-transparent"
        onKeyDown={handleKeyDown}
      >
        {/* Mac-style Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-2 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {isEditing ? 'Editar Bloc de Temps' : 'Nou Bloc de Temps'}
              </h2>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Programa el teu temps de manera eficient
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Shortcut hint */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span className="text-xs text-muted-foreground/70">Enter per guardar</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-white/15 backdrop-blur-sm rounded-lg transition-all duration-200 border border-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form Layout */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col" autoComplete="off">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Essential Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                <h3 className="text-lg font-medium text-foreground">Informació Essencial</h3>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-foreground/80">Títol del bloc</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Descripció de l'activitat..."
                  className="h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                  required
                />
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-medium text-foreground/80">Hora d'inici</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200">
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
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-medium text-foreground/80">Hora de fi</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200">
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
            </div>

            {/* Visual Appearance Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                <h3 className="text-lg font-medium text-foreground">Aparença Visual</h3>
              </div>

              {/* Color picker */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground/80">Color del bloc</Label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setColor(option.value)}
                      className={cn(
                        "group flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105",
                        color === option.value 
                          ? "border-white scale-105 shadow-lg shadow-primary/30 bg-white/5" 
                          : "border-white/10 hover:border-white/30 hover:bg-white/5"
                      )}
                    >
                      <div 
                        className="w-8 h-8 rounded-full mb-2 shadow-sm transition-all duration-200 group-hover:shadow-md"
                        style={{ backgroundColor: option.value }}
                      />
                      <span className="text-xs text-center leading-tight text-foreground/70">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedColor && (
                  <p className="text-xs text-muted-foreground mt-2 px-1">
                    Suggeriment: {selectedColor.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-foreground/80">Descripció (opcional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalls adicionals, objectius del bloc..."
                  className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Notifications Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                <h3 className="text-lg font-medium text-foreground">Notificacions</h3>
              </div>

              <div className="space-y-4 p-5 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-4 w-4 text-primary" />
                  <Label className="font-medium text-primary">Configuració d'Avisos</Label>
                </div>
                
                {/* Start notification */}
                <div className="space-y-3">
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
                    <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                      <Label className="text-xs text-muted-foreground">
                        Avís abans de l'inici:
                      </Label>
                      <Select 
                        value={startReminderMinutes.toString()}
                        onValueChange={(value) => setStartReminderMinutes(parseInt(value))}
                      >
                        <SelectTrigger className="h-10 bg-white/5 border-white/10 focus:border-primary/50">
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
                      <div className="text-xs text-muted-foreground">
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
                <div className="space-y-3">
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
                    <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                      <Label className="text-xs text-muted-foreground">
                        Avís abans del final:
                      </Label>
                      <Select 
                        value={endReminderMinutes.toString()}
                        onValueChange={(value) => setEndReminderMinutes(parseInt(value))}
                      >
                        <SelectTrigger className="h-10 bg-white/5 border-white/10 focus:border-primary/50">
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
                      <div className="text-xs text-muted-foreground">
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
            </div>
          </div>

          {/* Mac-style Footer */}
          <div className="px-6 py-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isEditing && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    className="px-4 h-9 rounded-lg hover:scale-105 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
              
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="px-6 h-9 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                >
                  Cancel·lar
                </Button>
                <Button 
                  type="submit"
                  disabled={!title.trim()}
                  className="px-6 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-200"
                >
                  {isEditing ? 'Actualitzar Bloc' : 'Crear Bloc'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};