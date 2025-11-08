import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bell, Send, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNotificationContext } from "@/contexts/NotificationContextMigrated";

export const CustomNotificationCard = () => {
  const { createCustomNotification, sendTestNotification, notificationsReady } = useNotificationContext();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    scheduleTime: ""
  });
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setFormData({
      title: "",
      message: "",
      scheduleTime: ""
    });
  };

  const handleSendNow = async () => {
    if (!formData.title || !formData.message) {
      toast.error("Si us plau, omple el títol i el missatge");
      return;
    }

    if (!notificationsReady) {
      toast.error("Les notificacions no estan disponibles. Activa-les a la configuració.");
      return;
    }

    setLoading(true);
    try {
      await sendTestNotification();
      toast.success("Notificació enviada!", {
        description: formData.title
      });
      clearForm();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error("Error enviant la notificació");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!formData.title || !formData.message || !formData.scheduleTime) {
      toast.error("Si us plau, omple tots els camps per programar");
      return;
    }

    setLoading(true);
    try {
      const scheduledDate = new Date(formData.scheduleTime);
      if (scheduledDate <= new Date()) {
        toast.error("La data ha de ser futura");
        return;
      }

      await createCustomNotification(formData.title, formData.message, scheduledDate);
      clearForm();
    } catch (error) {
      console.error('Error programant la notificació:', error);
      toast.error("Error programant la notificació");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-fade-in h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          Notificació personalitzada
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="title" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Títol
            </Label>
            <Input
              id="title"
              placeholder="Títol de la notificació..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Missatge
            </Label>
            <Textarea
              id="message"
              placeholder="Contingut de la notificació..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              className="mt-1 resize-none"
            />
          </div>
          
          <div>
            <Label htmlFor="schedule" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Programar (opcional)
            </Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={formData.scheduleTime}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduleTime: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSendNow}
            disabled={loading || !formData.title || !formData.message || !notificationsReady}
            className="flex-1 gap-2"
            size="sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar ara
          </Button>
          
          <Button 
            onClick={handleSchedule}
            variant="outline"
            disabled={loading || !formData.title || !formData.message || !formData.scheduleTime}
            className="flex-1 gap-2"
            size="sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
            Programar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};