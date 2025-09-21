import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Clock } from 'lucide-react';
import { useTimeBlockNotifications } from '@/hooks/useTimeBlockNotifications';
import type { TimeBlock, TimeBlockNotifications, TimeBlockReminderSettings } from '@/types/timeblock';

interface TimeBlockNotificationPopoverProps {
  block: TimeBlock;
  onUpdateBlock: (updates: Partial<TimeBlock>) => void;
}

const reminderOptions = [
  { value: 0, label: 'Exacte' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
];

export const TimeBlockNotificationPopover = ({
  block,
  onUpdateBlock
}: TimeBlockNotificationPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = block.notifications || { start: false, end: false };
  const reminderMinutes = block.reminderMinutes || { start: 5, end: 5 };
  const { updateBlockNotifications, cancelBlockNotifications } = useTimeBlockNotifications();
  
  const hasNotifications = notifications.start || notifications.end;

  const handleNotificationToggle = async (type: 'start' | 'end', enabled: boolean) => {
    const newNotifications: TimeBlockNotifications = {
      ...notifications,
      [type]: enabled
    };
    
    const updatedBlock = { 
      ...block,
      notifications: newNotifications,
      reminderMinutes: block.reminderMinutes || { start: 5, end: 5 }
    };
    
    onUpdateBlock({ 
      notifications: newNotifications,
      reminderMinutes: block.reminderMinutes || { start: 5, end: 5 }
    });

    // Schedule or cancel notifications immediately
    if (enabled) {
      await updateBlockNotifications(updatedBlock);
    } else {
      await cancelBlockNotifications(block.id);
    }
  };

  const handleReminderTimeChange = async (type: 'start' | 'end', minutes: number) => {
    const newReminderMinutes: TimeBlockReminderSettings = {
      ...reminderMinutes,
      [type]: minutes
    };
    
    const updatedBlock = { 
      ...block,
      reminderMinutes: newReminderMinutes 
    };
    
    onUpdateBlock({ reminderMinutes: newReminderMinutes });

    // Reschedule notifications with new timing
    if (notifications[type]) {
      await updateBlockNotifications(updatedBlock);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          {hasNotifications ? (
            <Bell className="h-3 w-3 text-primary" />
          ) : (
            <BellOff className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border-white/10 shadow-xl" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm text-primary">Notificacions</h4>
            </div>
            <div className="text-xs text-muted-foreground">
              {hasNotifications ? '✅ Activades' : '⚫ Desactivades'}
            </div>
          </div>
          
          {/* Start notification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="start-notification" className="text-sm">
                Notificar a l'inici
              </Label>
              <Switch
                id="start-notification"
                checked={notifications.start}
                onCheckedChange={(checked) => 
                  handleNotificationToggle('start', checked)
                }
              />
            </div>
            
            {notifications.start && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Avís abans de:
                </Label>
                <Select 
                  value={reminderMinutes.start.toString()}
                  onValueChange={(value) => 
                    handleReminderTimeChange('start', parseInt(value))
                  }
                >
                  <SelectTrigger className="h-8">
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
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  Notificació: {(() => {
                    const [hours, minutes] = block.startTime.split(':').map(Number);
                    const reminderTime = new Date();
                    reminderTime.setHours(hours, minutes - reminderMinutes.start, 0, 0);
                    return reminderTime.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
                  })()} (demà)
                </div>
              </div>
            )}
          </div>

          {/* End notification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="end-notification" className="text-sm">
                Notificar al final
              </Label>
              <Switch
                id="end-notification"
                checked={notifications.end}
                onCheckedChange={(checked) => 
                  handleNotificationToggle('end', checked)
                }
              />
            </div>
            
            {notifications.end && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Avís abans de:
                </Label>
                <Select 
                  value={reminderMinutes.end.toString()}
                  onValueChange={(value) => 
                    handleReminderTimeChange('end', parseInt(value))
                  }
                >
                  <SelectTrigger className="h-8">
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
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  Notificació: {(() => {
                    const [hours, minutes] = block.endTime.split(':').map(Number);
                    const reminderTime = new Date();
                    reminderTime.setHours(hours, minutes - reminderMinutes.end, 0, 0);
                    return reminderTime.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
                  })()} (demà)
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};