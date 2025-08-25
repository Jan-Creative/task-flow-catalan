import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationHistory } from "@/hooks/useNotificationHistory";

export const NotificationHistoryCard = () => {
  const { data: historyNotifications, isLoading, error } = useNotificationHistory();

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
          {isLoading ? (
            Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="p-3 bg-secondary/20 rounded-lg border border-border/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Error carregant l'historial</p>
            </div>
          ) : !historyNotifications?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Encara no tens historial de notificacions</p>
            </div>
          ) : (
            historyNotifications.map(notification => {
              const sentDate = new Date(notification.sent_at);
              const isDelivered = notification.delivery_status === 'delivered' || notification.delivery_status === 'sent';
              const isFailed = notification.delivery_status === 'failed';
              const isCustom = !notification.reminder_id;

              return (
                <div
                  key={notification.id}
                  className="p-3 bg-secondary/20 rounded-lg border border-border/30 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                        {isFailed ? (
                          <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                        ) : isDelivered ? (
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
                        variant={isCustom ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {isCustom ? 'Personal' : 'Recordatori'}
                      </Badge>
                    </div>
                    
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(sentDate)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};