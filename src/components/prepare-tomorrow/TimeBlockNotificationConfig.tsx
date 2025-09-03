import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import type { TimeBlockNotificationConfig } from '@/types/timeblock';

interface TimeBlockNotificationConfigModalProps {
  open: boolean;
  onClose: () => void;
  config: TimeBlockNotificationConfig;
  onConfigChange: (config: TimeBlockNotificationConfig) => void;
}

const reminderOptions = [
  { value: 0, label: 'En el moment exacte' },
  { value: 5, label: '5 minuts abans' },
  { value: 10, label: '10 minuts abans' },
  { value: 15, label: '15 minuts abans' },
  { value: 30, label: '30 minuts abans' },
];

export const TimeBlockNotificationConfigModal = ({
  open,
  onClose,
  config,
  onConfigChange
}: TimeBlockNotificationConfigModalProps) => {
  
  const handleConfigUpdate = (updates: Partial<TimeBlockNotificationConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuració de Notificacions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Global Enable */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableGlobal">Habilitar notificacions</Label>
              <p className="text-sm text-muted-foreground">
                Activar notificacions per tots els blocs
              </p>
            </div>
            <Switch
              id="enableGlobal"
              checked={config.enableGlobal}
              onCheckedChange={(checked) => 
                handleConfigUpdate({ enableGlobal: checked })
              }
            />
          </div>

          {config.enableGlobal && (
            <>
              {/* Default Start Notifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="defaultStartEnabled">Notificar a l'inici per defecte</Label>
                  <Switch
                    id="defaultStartEnabled"
                    checked={config.defaultStartEnabled}
                    onCheckedChange={(checked) => 
                      handleConfigUpdate({ defaultStartEnabled: checked })
                    }
                  />
                </div>
                
                {config.defaultStartEnabled && (
                  <div>
                    <Label>Temps d'avís per l'inici</Label>
                    <Select 
                      value={config.defaultStartReminder.toString()}
                      onValueChange={(value) => 
                        handleConfigUpdate({ defaultStartReminder: parseInt(value) })
                      }
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

              {/* Default End Notifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="defaultEndEnabled">Notificar al final per defecte</Label>
                  <Switch
                    id="defaultEndEnabled"
                    checked={config.defaultEndEnabled}
                    onCheckedChange={(checked) => 
                      handleConfigUpdate({ defaultEndEnabled: checked })
                    }
                  />
                </div>
                
                {config.defaultEndEnabled && (
                  <div>
                    <Label>Temps d'avís per al final</Label>
                    <Select 
                      value={config.defaultEndReminder.toString()}
                      onValueChange={(value) => 
                        handleConfigUpdate({ defaultEndReminder: parseInt(value) })
                      }
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
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Tancar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};