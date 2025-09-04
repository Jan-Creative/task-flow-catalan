import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Clock, Bell, TestTube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface DailyReminderPreferences {
  id?: string;
  is_enabled: boolean;
  reminder_time: string;
  custom_title: string | null;
  custom_message: string | null;
  days_of_week: number[];
  timezone?: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Dilluns", short: "Dl" },
  { value: 2, label: "Dimarts", short: "Dt" },
  { value: 3, label: "Dimecres", short: "Dc" },
  { value: 4, label: "Dijous", short: "Dj" },
  { value: 5, label: "Divendres", short: "Dv" },
  { value: 6, label: "Dissabte", short: "Ds" },
  { value: 7, label: "Diumenge", short: "Dg" },
];

const DEFAULT_TITLE = "⏰ Hora de preparar el dia de demà!";
const DEFAULT_MESSAGE = "No oblidis planificar les teves tasques i organitzar el teu dia de demà per començar amb bon peu.";

interface DailyReminderConfigModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DailyReminderConfigModal({ open: externalOpen, onOpenChange }: DailyReminderConfigModalProps = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<DailyReminderPreferences>({
    is_enabled: true,
    reminder_time: "22:00",
    custom_title: null,
    custom_message: null,
    days_of_week: [1, 2, 3, 4, 5, 6, 7], // Tots els dies per defecte
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid'
  });

  useEffect(() => {
    if (open && user) {
      loadPreferences();
    }
  }, [open, user]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_reminder_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        // Normalize reminder_time to HH:mm format for the input
        const normalizedTime = data.reminder_time.length > 5 ? data.reminder_time.substring(0, 5) : data.reminder_time;
        
        setPreferences({
          id: data.id,
          is_enabled: data.is_enabled,
          reminder_time: normalizedTime,
          custom_title: data.custom_title,
          custom_message: data.custom_message,
          days_of_week: data.days_of_week,
          timezone: data.timezone || 'Europe/Madrid'
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error(`Error carregant les preferències: ${error.message}`);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Ensure reminder_time is in HH:mm format
      const normalizedTime = preferences.reminder_time.length > 5 ? preferences.reminder_time.substring(0, 5) : preferences.reminder_time;
      
      const { error } = await supabase
        .from('daily_reminder_preferences')
        .upsert({
          user_id: user.id,
          is_enabled: preferences.is_enabled,
          reminder_time: normalizedTime,
          custom_title: preferences.custom_title,
          custom_message: preferences.custom_message,
          days_of_week: preferences.days_of_week,
          timezone: preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid',
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Invalidate the query cache so the visibility hook updates immediately
      await queryClient.invalidateQueries({
        queryKey: ['daily-reminder-preferences', user.id]
      });

      toast.success('Configuració guardada correctament');
      setOpen(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(`Error guardant la configuració: ${error.message || 'Error desconegut'}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const { error } = await supabase.functions.invoke('daily-preparation-reminder', {
        body: { test: true }
      });

      if (error) throw error;
      
      toast.success('Notificació de prova enviada!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Error enviant la notificació de prova');
    }
  };

  const toggleDay = (day: number) => {
    setPreferences(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort()
    }));
  };

  const getActiveText = () => {
    const title = preferences.custom_title || DEFAULT_TITLE;
    const message = preferences.custom_message || DEFAULT_MESSAGE;
    const time = preferences.reminder_time;
    const activeDays = DAYS_OF_WEEK.filter(day => preferences.days_of_week.includes(day.value));
    
    return { title, message, time, activeDays };
  };

  const { title, message, time, activeDays } = getActiveText();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Recordatoris
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configuració de Recordatoris Diaris
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Activar/Desactivar */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Recordatoris actius</Label>
              <p className="text-sm text-muted-foreground">
                Rebre notificacions per preparar el dia següent
              </p>
            </div>
            <Switch
              checked={preferences.is_enabled}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, is_enabled: checked }))
              }
            />
          </div>

          {preferences.is_enabled && (
            <>
              {/* Hora del recordatori */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hora del recordatori
                </Label>
                <Input
                  type="time"
                  value={preferences.reminder_time}
                  onChange={(e) => 
                    setPreferences(prev => ({ ...prev, reminder_time: e.target.value }))
                  }
                  className="w-full"
                />
              </div>

              {/* Dies de la setmana */}
              <div className="space-y-3">
                <Label>Dies de la setmana</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Badge
                      key={day.value}
                      variant={preferences.days_of_week.includes(day.value) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.short}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Actiu: {activeDays.map(d => d.short).join(', ')}
                </p>
              </div>

              {/* Títol personalitzat */}
              <div className="space-y-2">
                <Label>Títol personalitzat (opcional)</Label>
                <Input
                  value={preferences.custom_title || ''}
                  onChange={(e) => 
                    setPreferences(prev => ({ 
                      ...prev, 
                      custom_title: e.target.value || null 
                    }))
                  }
                  placeholder={DEFAULT_TITLE}
                />
              </div>

              {/* Missatge personalitzat */}
              <div className="space-y-2">
                <Label>Missatge personalitzat (opcional)</Label>
                <Textarea
                  value={preferences.custom_message || ''}
                  onChange={(e) => 
                    setPreferences(prev => ({ 
                      ...prev, 
                      custom_message: e.target.value || null 
                    }))
                  }
                  placeholder={DEFAULT_MESSAGE}
                  rows={3}
                />
              </div>

              {/* Vista prèvia */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <Label className="text-sm font-medium">Vista prèvia de la notificació</Label>
                <div className="mt-2 space-y-1">
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-sm text-muted-foreground">{message}</p>
                  <p className="text-xs text-muted-foreground">
                    Hora: {time} • Dies: {activeDays.map(d => d.short).join(', ')}
                  </p>
                </div>
              </div>

              {/* Botó de test */}
              <Button
                variant="outline"
                onClick={sendTestNotification}
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Enviar notificació de prova
              </Button>
            </>
          )}

          {/* Botons d'acció */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={savePreferences}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Guardant...' : 'Guardar configuració'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel·lar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}