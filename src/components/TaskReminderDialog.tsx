import { useState } from "react";
import { Clock, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { format, addMinutes, addHours, addDays } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TaskReminderDialogProps {
  taskId: string;
  taskTitle: string;
  children?: React.ReactNode;
}

const QUICK_REMINDERS = [
  { label: "En 15 minuts", value: "15m" },
  { label: "En 30 minuts", value: "30m" },
  { label: "En 1 hora", value: "1h" },
  { label: "En 2 hores", value: "2h" },
  { label: "Demà", value: "1d" },
  { label: "En 3 dies", value: "3d" },
  { label: "En 1 setmana", value: "7d" },
];

export const TaskReminderDialog = ({ taskId, taskTitle, children }: TaskReminderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedQuickReminder, setSelectedQuickReminder] = useState<string>("");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const { createTaskReminder, isSupported, permissionStatus, isSubscribed } = useNotificationContext();

  const calculateScheduledDate = (quickValue: string): Date => {
    const now = new Date();
    
    switch (quickValue) {
      case "15m":
        return addMinutes(now, 15);
      case "30m":
        return addMinutes(now, 30);
      case "1h":
        return addHours(now, 1);
      case "2h":
        return addHours(now, 2);
      case "1d":
        return addDays(now, 1);
      case "3d":
        return addDays(now, 3);
      case "7d":
        return addDays(now, 7);
      default:
        return now;
    }
  };

  const getScheduledDate = (): Date | null => {
    if (selectedQuickReminder) {
      return calculateScheduledDate(selectedQuickReminder);
    }
    
    if (customDate && customTime) {
      const datetime = new Date(`${customDate}T${customTime}`);
      if (datetime > new Date()) {
        return datetime;
      }
    }
    
    return null;
  };

  const handleCreateReminder = async () => {
    const scheduledDate = getScheduledDate();
    
    if (!scheduledDate) {
      return;
    }

    setIsCreating(true);
    
    try {
      const message = reminderMessage || `Recordatori: ${taskTitle}`;
      await createTaskReminder(taskId, taskTitle, message, scheduledDate);
      
      // Reset form
      setSelectedQuickReminder("");
      setCustomDate("");
      setCustomTime("");
      setReminderMessage("");
      setOpen(false);
    } catch (error) {
      console.error("Error creating reminder:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedQuickReminder("");
    setCustomDate("");
    setCustomTime("");
    setReminderMessage("");
  };

  if (!isSupported) {
    return null;
  }

  const scheduledDate = getScheduledDate();
  const isFormValid = scheduledDate && scheduledDate > new Date();

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Recordatori
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Crear recordatori
          </DialogTitle>
          <DialogDescription>
            Programa un recordatori per la tasca "{taskTitle}"
          </DialogDescription>
        </DialogHeader>

        {(!isSupported || permissionStatus !== 'granted' || !isSubscribed) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Per crear recordatoris necessites activar les notificacions a la pàgina de{" "}
              <a href="/?tab=configuracio" className="underline font-medium">
                Configuració
              </a>
              .
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          {/* Recordatoris ràpids */}
          <div className="space-y-2">
            <Label htmlFor="quick-reminder">Recordatori ràpid</Label>
            <Select 
              value={selectedQuickReminder} 
              onValueChange={(value) => {
                setSelectedQuickReminder(value);
                setCustomDate("");
                setCustomTime("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un temps" />
              </SelectTrigger>
              <SelectContent>
                {QUICK_REMINDERS.map((reminder) => (
                  <SelectItem key={reminder.value} value={reminder.value}>
                    {reminder.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Separador */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-sm text-gray-500">o</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Data i hora personalitzada */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="custom-date">Data personalitzada</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="custom-date"
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setSelectedQuickReminder("");
                  }}
                  className="pl-10"
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-time">Hora</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="custom-time"
                  type="time"
                  value={customTime}
                  onChange={(e) => {
                    setCustomTime(e.target.value);
                    setSelectedQuickReminder("");
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Missatge personalitzat */}
          <div className="space-y-2">
            <Label htmlFor="reminder-message">Missatge del recordatori (opcional)</Label>
            <Textarea
              id="reminder-message"
              placeholder={`Recordatori: ${taskTitle}`}
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              rows={2}
            />
          </div>

          {/* Preview del recordatori */}
          {scheduledDate && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                📅 <strong>Recordatori programat per:</strong><br />
                {scheduledDate.toLocaleDateString('ca-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel·lar
          </Button>
          <Button 
            onClick={handleCreateReminder}
            disabled={!isFormValid || isCreating || permissionStatus !== 'granted' || !isSubscribed}
          >
            {isCreating ? "Creant..." : "Crear recordatori"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};