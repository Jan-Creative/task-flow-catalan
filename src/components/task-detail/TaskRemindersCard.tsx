import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { Bell, Clock, Plus, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";

interface TaskRemindersCardProps {
  taskId: string;
  taskTitle: string;
}

interface NotificationReminder {
  id: string;
  title: string;
  message?: string;
  scheduled_for: string;
  status: 'pending' | 'sent' | 'cancelled';
  created_at: string;
}

const QUICK_REMINDERS = [
  { label: "15 minuts", value: "15m" },
  { label: "30 minuts", value: "30m" },
  { label: "1 hora", value: "1h" },
  { label: "2 hores", value: "2h" },
  { label: "1 dia", value: "1d" },
  { label: "1 setmana", value: "1w" }
];

export const TaskRemindersCard = ({ taskId, taskTitle }: TaskRemindersCardProps) => {
  const [reminders, setReminders] = useState<NotificationReminder[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reminderType, setReminderType] = useState<"quick" | "custom">("quick");
  const [quickReminderValue, setQuickReminderValue] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { 
    createTaskReminder, 
    cancelReminder, 
    isSupported, 
    permissionStatus,
    initializeNotifications,
    fcmToken,
    subscriptions,
    preferences,
    runRemindersProcessor,
    sendTestNotification
  } = useNotificationContext();
  const { toast } = useToast();

  // Carregar recordatoris existents
  const loadReminders = async () => {
    try {
      setLoading(true);
      // Simulem la càrrega des de Supabase
      // TODO: Implementar la consulta real a la base de dades
      setReminders([]); // Temporal fins implementar Supabase
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [taskId]);

  const calculateScheduledDate = (quickValue: string): Date => {
    const now = new Date();
    const [amount, unit] = [parseInt(quickValue), quickValue.slice(-1)];
    
    switch (unit) {
      case 'm':
        return new Date(now.getTime() + amount * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + amount * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + amount * 24 * 60 * 60 * 1000);
      case 'w':
        return new Date(now.getTime() + amount * 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 15 * 60 * 1000);
    }
  };

  const getScheduledDate = (): Date | null => {
    if (reminderType === "quick" && quickReminderValue) {
      return calculateScheduledDate(quickReminderValue);
    }
    
    if (reminderType === "custom" && customDate && customTime) {
      return new Date(`${customDate}T${customTime}:00`);
    }
    
    return null;
  };

  const handleCreateReminder = async () => {
    if (!isSupported) {
      toast({
        title: "Notificacions no suportades",
        description: "El teu navegador no suporta notificacions push.",
        variant: "destructive",
      });
      return;
    }

    if (permissionStatus !== "granted") {
      try {
        await initializeNotifications();
      } catch (error) {
        toast({
          title: "Permisos necessaris",
          description: "Has d'activar els permisos de notificació per crear recordatoris.",
          variant: "destructive",
        });
        return;
      }
    }

    const scheduledDate = getScheduledDate();
    if (!scheduledDate) {
      toast({
        title: "Data no vàlida",
        description: "Selecciona una data i hora vàlides per al recordatori.",
        variant: "destructive",
      });
      return;
    }

    if (scheduledDate <= new Date()) {
      toast({
        title: "Data no vàlida",
        description: "La data del recordatori ha de ser futura.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createTaskReminder(
        taskId,
        taskTitle,
        customMessage || `Recordatori: ${taskTitle}`,
        scheduledDate
      );

      toast({
        title: "Recordatori creat!",
        description: `Rebràs una notificació el ${format(scheduledDate, "d 'de' MMMM 'a les' HH:mm", { locale: ca })}.`,
      });

      // Afegir el nou recordatori a la llista local
      const newReminder: NotificationReminder = {
        id: Date.now().toString(),
        title: taskTitle,
        message: customMessage || `Recordatori: ${taskTitle}`,
        scheduled_for: scheduledDate.toISOString(),
        status: 'pending',
        created_at: new Date().toISOString()
      };
      setReminders(prev => [newReminder, ...prev]);

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut crear el recordatori. Torna-ho a provar.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelReminder = async (reminderId: string) => {
    try {
      await cancelReminder(reminderId);
      setReminders(prev => 
        prev.map(r => r.id === reminderId ? { ...r, status: 'cancelled' as const } : r)
      );
      toast({
        title: "Recordatori cancel·lat",
        description: "El recordatori s'ha cancel·lat correctament.",
      });
    } catch (error) {
      console.error("Error cancelling reminder:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut cancel·lar el recordatori.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setReminderType("quick");
    setQuickReminderValue("");
    setCustomDate("");
    setCustomTime("");
    setCustomMessage("");
  };

  const isFormValid = () => {
    if (reminderType === "quick") {
      return quickReminderValue !== "";
    }
    return customDate !== "" && customTime !== "";
  };

  if (!isSupported) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recordatoris
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Les notificacions no estan suportades en aquest navegador.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recordatoris
        </CardTitle>
        <CardDescription>
          Programa recordatoris per a aquesta tasca
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionStatus !== "granted" && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                {!isSupported 
                  ? "Firebase Messaging no és compatible amb Safari. Utilitza Chrome, Edge, Firefox o Brave per rebre notificacions push."
                  : "Cal activar els permisos de notificació per crear recordatoris."
                }
              </p>
            </div>
            {isSupported && (
              <Button 
                onClick={initializeNotifications}
                size="sm" 
                className="mt-2"
              >
                Activar notificacions
              </Button>
            )}
          </div>
        )}

        {/* Llista de recordatoris existents */}
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        ) : reminders.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recordatoris programats</h4>
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span className="text-sm">
                      {format(new Date(reminder.scheduled_for), "d MMM, HH:mm", { locale: ca })}
                    </span>
                    <Badge variant={reminder.status === 'pending' ? 'default' : 'secondary'}>
                      {reminder.status === 'pending' ? 'Pendent' : 
                       reminder.status === 'sent' ? 'Enviat' : 'Cancel·lat'}
                    </Badge>
                  </div>
                  {reminder.message && reminder.message !== `Recordatori: ${taskTitle}` && (
                    <p className="text-xs text-muted-foreground mt-1">{reminder.message}</p>
                  )}
                </div>
                {reminder.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelReminder(reminder.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hi ha recordatoris programats.</p>
        )}

        {/* Estat del sistema de notificacions */}
        {permissionStatus === "granted" && (
          <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium">Sistema actiu</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-xs text-green-700 dark:text-green-300">
              <div className="flex justify-between">
                <span>Token FCM:</span>
                <span>{fcmToken ? '✓ Registrat' : '✗ No registrat'}</span>
              </div>
              <div className="flex justify-between">
                <span>Subscripcions:</span>
                <span>{subscriptions?.length || 0} actives</span>
              </div>
              <div className="flex justify-between">
                <span>Preferències:</span>
                <span>{preferences?.enabled ? '✓ Habilitades' : '✗ Deshabilitades'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={initializeNotifications}
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
              >
                Reinicia permisos
              </Button>
              <Button
                onClick={runRemindersProcessor}
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
              >
                Executa processador
              </Button>
            </div>
            
            <Button
              onClick={sendTestNotification}
              size="sm"
              variant="outline"
              className="w-full text-xs"
            >
              🧪 Prova ràpida
            </Button>
          </div>
        )}

        {/* Botó per crear nou recordatori */}
        {!showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="w-full"
            disabled={permissionStatus !== "granted"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear recordatori
          </Button>
        )}

        {/* Formulari de creació */}
        {showCreateForm && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Nou recordatori</h4>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tipus de recordatori */}
            <div className="flex gap-2">
              <Button
                variant={reminderType === "quick" ? "default" : "outline"}
                size="sm"
                onClick={() => setReminderType("quick")}
              >
                Ràpid
              </Button>
              <Button
                variant={reminderType === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setReminderType("custom")}
              >
                Personalitzat
              </Button>
            </div>

            {/* Recordatoris ràpids */}
            {reminderType === "quick" && (
              <Select value={quickReminderValue} onValueChange={setQuickReminderValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona quan recordar" />
                </SelectTrigger>
                <SelectContent>
                  {QUICK_REMINDERS.map((reminder) => (
                    <SelectItem key={reminder.value} value={reminder.value}>
                      {reminder.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Data i hora personalitzada */}
            {reminderType === "custom" && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                />
              </div>
            )}

            {/* Missatge personalitzat */}
            <Textarea
              placeholder="Missatge del recordatori (opcional)"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={2}
            />

            {/* Preview */}
            {isFormValid() && getScheduledDate() && (
              <div className="p-2 bg-background border rounded text-sm">
                <strong>Preview:</strong> {format(getScheduledDate()!, "d 'de' MMMM 'a les' HH:mm", { locale: ca })}
              </div>
            )}

            {/* Botons d'acció */}
            <div className="flex gap-2">
              <Button
                onClick={handleCreateReminder}
                disabled={!isFormValid() || isCreating || permissionStatus !== "granted"}
                className="flex-1"
              >
                {isCreating ? "Creant..." : "Crear recordatori"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel·lar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};