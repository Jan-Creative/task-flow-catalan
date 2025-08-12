import { useEffect, useState } from 'react';
import { notificationService, AppNotification } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

export const NotificationDisplay = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      // Mostrar la notificació utilitzant el sistema de toast de shadcn
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });

      // Actualitzar la llista local de notificacions
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Mantenir només les últimes 5
    });

    return unsubscribe;
  }, [toast]);

  // Aquest component no renderitza res visualment
  // Les notificacions es mostren mitjançant el sistema de toast
  return null;
};