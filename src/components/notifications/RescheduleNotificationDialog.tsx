import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";

interface RescheduleNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification?: {
    id: string;
    title: string;
    message: string;
    scheduled_at: string;
  };
  onReschedule: (notificationId: string, newDateTime: string) => Promise<void>;
  loading?: boolean;
}

export const RescheduleNotificationDialog = ({
  open,
  onOpenChange,
  notification,
  onReschedule,
  loading = false
}: RescheduleNotificationDialogProps) => {
  const [newDateTime, setNewDateTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notification || !newDateTime) return;

    await onReschedule(notification.id, newDateTime);
    onOpenChange(false);
    setNewDateTime("");
  };

  // Set initial datetime when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && notification) {
      // Convert to local datetime-local format
      const date = new Date(notification.scheduled_at);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      setNewDateTime(localDate.toISOString().slice(0, 16));
    } else {
      setNewDateTime("");
    }
    onOpenChange(newOpen);
  };

  if (!notification) return null;

  const currentDate = new Date(notification.scheduled_at);
  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 5); // Minimum 5 minutes from now

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reprogramar notificació</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Títol</Label>
            <Input value={notification.title} disabled />
          </div>
          
          <div className="space-y-2">
            <Label>Missatge</Label>
            <Textarea value={notification.message} disabled rows={2} />
          </div>
          
          <div className="space-y-2">
            <Label>Programada actualment per</Label>
            <Input 
              value={format(currentDate, "PPP 'a les' HH:mm", { locale: ca })} 
              disabled 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newDateTime">Nova data i hora</Label>
            <Input
              id="newDateTime"
              type="datetime-local"
              value={newDateTime}
              onChange={(e) => setNewDateTime(e.target.value)}
              min={minDateTime.toISOString().slice(0, 16)}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel·lar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !newDateTime}
              className="flex-1"
            >
              {loading ? "Reprogramant..." : "Reprogramar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};