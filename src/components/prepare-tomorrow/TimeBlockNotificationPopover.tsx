import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff } from 'lucide-react';
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
  const notifications = block.notifications || { start: false, end: false };
  const reminderMinutes = block.reminderMinutes || { start: 5, end: 5 };
  
  const hasNotifications = notifications.start || notifications.end;

  const handleNotificationToggle = (type: 'start' | 'end', enabled: boolean) => {
    const newNotifications: TimeBlockNotifications = {
      ...notifications,
      [type]: enabled
    };
    
    onUpdateBlock({ 
      notifications: newNotifications,
      reminderMinutes: block.reminderMinutes || { start: 5, end: 5 }
    });
  };

  const handleReminderTimeChange = (type: 'start' | 'end', minutes: number) => {
    const newReminderMinutes: TimeBlockReminderSettings = {
      ...reminderMinutes,
      [type]: minutes
    };
    
    onUpdateBlock({ reminderMinutes: newReminderMinutes });
  };

  return (
    <Popover>
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
      
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Notificacions del bloc</h4>
            <div className="text-xs text-muted-foreground">
              {hasNotifications ? 'Activades' : 'Desactivades'}
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