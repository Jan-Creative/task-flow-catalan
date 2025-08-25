import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bell, Send, Clock } from "lucide-react";
import { toast } from "sonner";

export const CustomNotificationCard = () => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    scheduleTime: "",
    isScheduled: false
  });

  const handleSendNow = () => {
    if (!formData.title || !formData.message) {
      toast.error("Si us plau, omple el títol i el missatge");
      return;
    }
    
    toast.success("Notificació enviada!", {
      description: formData.title
    });
    
    setFormData({
      title: "",
      message: "",
      scheduleTime: "",
      isScheduled: false
    });
  };

  const handleSchedule = () => {
    if (!formData.title || !formData.message || !formData.scheduleTime) {
      toast.error("Si us plau, omple tots els camps per programar");
      return;
    }
    
    toast.success("Notificació programada!", {
      description: `Programada per ${formData.scheduleTime}`
    });
    
    setFormData({
      title: "",
      message: "",
      scheduleTime: "",
      isScheduled: false
    });
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
            className="flex-1 gap-2"
            size="sm"
          >
            <Send className="h-4 w-4" />
            Enviar ara
          </Button>
          
          <Button 
            onClick={handleSchedule}
            variant="outline"
            className="flex-1 gap-2"
            size="sm"
          >
            <Clock className="h-4 w-4" />
            Programar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};