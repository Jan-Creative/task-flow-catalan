import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, X, Edit3 } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { toast } from "sonner";

interface UpcomingNotification {
  id: string;
  title: string;
  message: string;
  scheduledAt: Date;
  source: 'custom' | 'block';
  blockName?: string;
  blockId?: string;
}

export const UpcomingNotificationsCard = () => {
  const [upcomingNotifications, setUpcomingNotifications] = useState<UpcomingNotification[]>([
    {
      id: "1",
      title: "Descans",
      message: "Fes una pausa i respira",
      scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // en 3 hores
      source: 'block',
      blockName: 'Dia intens',
      blockId: 'block-1'
    },
    {
      id: "2",
      title: "Final del dia",
      message: "Has treballat dur avui!",
      scheduledAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // en 8 hores
      source: 'block',
      blockName: 'Dia intens',
      blockId: 'block-1'
    },
    {
      id: "3",
      title: "Recordatori personalitzat",
      message: "Revisar informe trimestral",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // demà
      source: 'custom'
    },
    {
      id: "4",
      title: "Exercici matinal",
      message: "Temps d'activitat física",
      scheduledAt: new Date(Date.now() + 36 * 60 * 60 * 1000), // demà matí
      source: 'block',
      blockName: 'Rutina matinal',
      blockId: 'block-2'
    }
  ]);

  const handleCancelNotification = (notificationId: string) => {
    setUpcomingNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    toast.success("Notificació cancel·lada");
  };

  const handleReschedule = (notificationId: string) => {
    // Aquí es podria obrir un modal per reprogramar
    toast.info("Funcionalitat de reprogramació disponible aviat");
  };

  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `En ${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `En ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Demà";
    
    return `En ${diffInDays} dies`;
  };

  const sortedNotifications = upcomingNotifications.sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()
  );

  return (
    <Card className="animate-fade-in h-full" style={{ animationDelay: '0.4s' }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Pròximament
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {sortedNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tens notificacions programades</p>
            </div>
          ) : (
            sortedNotifications.map(notification => (
              <div
                key={notification.id}
                className="p-3 bg-secondary/20 rounded-lg border border-border/30 hover:bg-secondary/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                      <Clock className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handleReschedule(notification.id)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleCancelNotification(notification.id)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={notification.source === 'block' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {notification.source === 'block' ? notification.blockName : 'Personal'}
                  </Badge>
                  
                  <div className="text-xs text-muted-foreground">
                    <div>{getTimeUntil(notification.scheduledAt)}</div>
                    <div className="text-xs opacity-75">
                      {format(notification.scheduledAt, 'HH:mm', { locale: ca })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};