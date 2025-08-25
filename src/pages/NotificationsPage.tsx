import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Bell, 
  Clock, 
  Calendar,
  Send,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const NotificationsPage = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    scheduledAt: ""
  });

  // Temporarily comment out the context usage to test if this is the issue
  // const { createCustomNotification } = useNotificationContext();

  const handleCreateNotification = async () => {
    if (!formData.title || !formData.message || !formData.scheduledAt) {
      toast.error("Tots els camps són obligatoris");
      return;
    }

    try {
      // Temporarily disabled for testing
      // await createCustomNotification(
      //   formData.title,
      //   formData.message,
      //   new Date(formData.scheduledAt)
      // );
      
      setFormData({ title: "", message: "", scheduledAt: "" });
      setShowCreateForm(false);
      toast.success("Notificació programada correctament");
    } catch (error) {
      toast.error("Error al programar la notificació");
    }
  };

  const mockNotifications = [
    {
      id: 1,
      title: "Recordatori de tasca",
      message: "No oblidis completar el projecte",
      scheduledAt: "2024-01-15T14:30:00",
      status: "pending"
    },
    {
      id: 2,
      title: "Reunió important",
      message: "Reunió amb el client a les 10:00",
      scheduledAt: "2024-01-16T09:45:00",
      status: "pending"
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full min-h-screen bg-black">
      {/* Top Block - Stats & Create Button */}
      <div className="bg-secondary rounded-b-[28px] px-4 pt-12 pb-6 mb-2">
        <div className="max-w-md mx-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-secondary-foreground">Notificacions</h2>
              </div>
              <Button
                size="sm"
                onClick={() => setShowCreateForm(true)}
                className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/20 rounded-full h-8 w-8 p-0"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/10 rounded-xl p-3 border border-background/20">
                <div className="text-2xl font-bold text-secondary-foreground">12</div>
                <div className="text-xs text-muted-foreground">Enviades</div>
              </div>
              <div className="bg-background/10 rounded-xl p-3 border border-background/20">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-xs text-muted-foreground">Pendents</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Block - History/Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-secondary rounded-t-[28px] px-4 pt-6 pb-28">
        <div className="max-w-md mx-auto h-full">
          <div className="h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {!showCreateForm ? (
              /* History Mode */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-secondary-foreground">Notificacions pendents</h3>
                  <Badge variant="outline" className="text-xs border-secondary-foreground/20 text-secondary-foreground">
                    {mockNotifications.length}
                  </Badge>
                </div>
                
                <div className="space-y-3 mb-6">
                  {mockNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="bg-background/10 rounded-xl p-3 border border-background/20 hover:bg-background/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-secondary-foreground truncate">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.scheduledAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {notification.status === 'pending' ? (
                            <AlertCircle className="h-4 w-4 text-warning" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="w-full bg-primary hover:bg-primary-glow text-primary-foreground rounded-xl h-12 font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nova Notificació
                </Button>
              </div>
            ) : (
              /* Form Mode */
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-md font-medium text-secondary-foreground">Nova notificació</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCreateForm(false)}
                    className="h-8 w-8 p-0 hover:bg-background/10 text-secondary-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-secondary-foreground mb-2 block">
                      Títol
                    </label>
                    <Input
                      placeholder="Títol de la notificació"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-background/10 border-background/20 rounded-xl text-secondary-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-secondary-foreground mb-2 block">
                      Missatge
                    </label>
                    <Textarea
                      placeholder="Escriu el contingut de la notificació..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-background/10 border-background/20 rounded-xl min-h-[80px] resize-none text-secondary-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-secondary-foreground mb-2 block">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Data i hora
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      className="bg-background/10 border-background/20 rounded-xl text-secondary-foreground"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 border-background/20 hover:bg-background/10 rounded-xl text-secondary-foreground"
                  >
                    Cancel·lar
                  </Button>
                  <Button
                    onClick={handleCreateNotification}
                    className="flex-1 bg-primary hover:bg-primary-glow text-primary-foreground rounded-xl"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Programar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;