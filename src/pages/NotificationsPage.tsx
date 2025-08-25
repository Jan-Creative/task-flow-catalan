import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, ArrowLeft, Plus, Clock, CheckCircle, Circle, Calendar, Send } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FloatingBackgroundButton } from "@/components/backgrounds/FloatingBackgroundButton";
import BottomNavigation from "@/components/BottomNavigation";
import "@/styles/background-effects.css";

const NotificationsPage = () => {
  const navigate = useNavigate();
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
    <div className="relative w-full min-h-screen bg-transparent text-foreground overflow-hidden">
      
      {/* Header with back button */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-md border-b border-border/30">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tornar
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Notificacions</h1>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="relative z-20 p-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Mobile/Tablet Layout - Stack vertical */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Statistics & Create Card */}
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Resum</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Circle className="h-4 w-4 text-orange-500" />
                      {mockNotifications.filter(n => n.status === 'pending').length} pendents
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{mockNotifications.length}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-500">
                        {mockNotifications.filter(n => n.status === 'sent').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Enviades</div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {showCreateForm ? "Veure llista" : "Crear notificació"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Card */}
            <div className="lg:col-span-1 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    {!showCreateForm ? "Notificacions pendents" : "Nova notificació"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showCreateForm ? (
                    // Notifications List
                    <div className="space-y-3">
                      {mockNotifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No hi ha notificacions</p>
                        </div>
                      ) : (
                        mockNotifications.map((notification) => (
                          <div key={notification.id} className="p-4 bg-background/50 rounded-lg border border-border/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium mb-1">{notification.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(notification.scheduledAt)}
                                </div>
                              </div>
                              <div className="ml-3 flex items-center">
                                {notification.status === 'pending' ? (
                                  <Circle className="h-4 w-4 text-orange-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    // Create Form
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Títol</label>
                        <Input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                          placeholder="Introdueix el títol"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Missatge</label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                          placeholder="Introdueix el missatge"
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Data i hora
                        </label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduledAt}
                          onChange={(e) => setFormData(prev => ({...prev, scheduledAt: e.target.value}))}
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCreateForm(false)}
                          className="flex-1"
                        >
                          Cancel·lar
                        </Button>
                        <Button 
                          onClick={handleCreateNotification}
                          className="flex-1 gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Programar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Background Configuration Button */}
      <FloatingBackgroundButton />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="notificacions"
        onTabChange={(tab) => {
          if (tab === "avui") {
            navigate("/");
          } else if (tab === "carpetes") {
            navigate("/?tab=carpetes");
          } else if (tab === "configuracio") {
            navigate("/?tab=configuracio");
          }
        }}
        onCreateTask={() => setShowCreateForm(true)}
      />
    </div>
  );
};

export default NotificationsPage;