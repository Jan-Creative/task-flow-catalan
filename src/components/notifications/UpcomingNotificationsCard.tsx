import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, X, Edit3, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { toast } from "sonner";
import { useUpcomingNotifications } from "@/hooks/useUpcomingNotifications";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { RescheduleNotificationDialog } from "./RescheduleNotificationDialog";
import { supabase } from "@/integrations/supabase/client";

export const UpcomingNotificationsCard = () => {
  const { data: upcomingNotifications, isLoading, error, refetch } = useUpcomingNotifications();
  const { cancelReminder } = useNotificationContext();
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    open: boolean;
    notification?: any;
  }>({ open: false });
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const handleCancelNotification = async (notificationId: string) => {
    setLoadingActions(prev => ({ ...prev, [notificationId]: true }));
    try {
      await cancelReminder(notificationId);
      await refetch(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling notification:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleReschedule = (notification: any) => {
    setRescheduleDialog({
      open: true,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        scheduled_at: notification.scheduled_at
      }
    });
  };

  const handleRescheduleConfirm = async (notificationId: string, newDateTime: string) => {
    try {
      const { error } = await supabase
        .from('notification_reminders')
        .update({ 
          scheduled_at: newDateTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      toast.success("Notificació reprogramada correctament");
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error rescheduling notification:', error);
      toast.error("Error reprogramant la notificació");
    }
  };

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Ara mateix";
    if (diffInMinutes < 60) return `En ${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `En ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Demà";
    
    return `En ${diffInDays} dies`;
  };

  // Real-time countdown update
  const [, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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
          {isLoading ? (
            Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="p-3 bg-secondary/20 rounded-lg border border-border/30">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-6" />
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
              <p>Error carregant notificacions</p>
            </div>
          ) : !upcomingNotifications?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tens notificacions programades</p>
            </div>
          ) : (
            upcomingNotifications.map(notification => {
              const isCustom = notification.notification_type === 'custom' || !notification.task_id;
              const isLoading = loadingActions[notification.id];

              return (
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
                        onClick={() => handleReschedule(notification)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        disabled={isLoading}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleCancelNotification(notification.id)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={isCustom ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {isCustom ? 'Personal' : 'Recordatori'}
                    </Badge>
                    
                    <div className="text-xs text-muted-foreground text-right">
                      <div>{getTimeUntil(notification.scheduled_at)}</div>
                      <div className="text-xs opacity-75">
                        {format(new Date(notification.scheduled_at), 'HH:mm', { locale: ca })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
      
      <RescheduleNotificationDialog
        open={rescheduleDialog.open}
        onOpenChange={(open) => setRescheduleDialog({ open, notification: open ? rescheduleDialog.notification : undefined })}
        notification={rescheduleDialog.notification}
        onReschedule={handleRescheduleConfirm}
      />
    </Card>
  );
};