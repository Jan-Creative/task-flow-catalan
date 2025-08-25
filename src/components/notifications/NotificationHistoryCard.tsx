import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";

interface HistoryNotification {
  id: string;
  title: string;
  message: string;
  sentAt: Date;
  status: 'sent' | 'read';
  source: 'custom' | 'block';
  blockName?: string;
}

export const NotificationHistoryCard = () => {
  const historyNotifications: HistoryNotification[] = [
    {
      id: "1",
      title: "Bon dia!",
      message: "Comença el dia amb energia",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // fa 2 hores
      status: 'read',
      source: 'block',
      blockName: 'Dia intens'
    },
    {
      id: "2",
      title: "Recordatori personalitzat",
      message: "Revisar documents importants",
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // fa 5 hores
      status: 'sent',
      source: 'custom'
    },
    {
      id: "3",
      title: "Exercici",
      message: "Temps d'activitat física",
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // ahir
      status: 'read',
      source: 'block',
      blockName: 'Rutina matinal'
    },
    {
      id: "4",
      title: "Final del dia",
      message: "Has treballat dur avui!",
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // fa 2 dies
      status: 'read',
      source: 'block',
      blockName: 'Dia intens'
    },
    {
      id: "5",
      title: "Pausa",
      message: "Fes una pausa i respira",
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // fa 3 dies
      status: 'sent',
      source: 'custom'
    }
  ];

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Ara mateix";
    if (diffInHours < 24) return `Fa ${diffInHours}h`;
    if (diffInHours < 48) return "Ahir";
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Fa ${diffInDays} dies`;
  };

  return (
    <Card className="animate-fade-in h-full" style={{ animationDelay: '0.3s' }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Historial
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {historyNotifications.map(notification => (
            <div
              key={notification.id}
              className="p-3 bg-secondary/20 rounded-lg border border-border/30 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                    {notification.status === 'read' ? (
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <Clock className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {notification.message}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={notification.source === 'block' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {notification.source === 'block' ? notification.blockName : 'Personal'}
                  </Badge>
                </div>
                
                <span className="text-xs text-muted-foreground">
                  {getRelativeTime(notification.sentAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};