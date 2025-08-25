import { useEffect, useState } from 'react';
import { notificationService, AppNotification } from '@/services/notificationService';
import { toast } from 'sonner';

export const NotificationDisplay = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      // Mostrar la notificació utilitzant Sonner
      if (notification.type === 'error') {
        toast.error(notification.title, {
          description: notification.message,
        });
      } else if (notification.type === 'success') {
        toast.success(notification.title, {
          description: notification.message,
        });
      } else {
        toast(notification.title, {
          description: notification.message,
        });
      }

      // Actualitzar la llista local de notificacions
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Mantenir només les últimes 5
    });

    return unsubscribe;
  }, []);

  // Aquest component no renderitza res visualment
  // Les notificacions es mostren mitjançant el sistema de toast
  return null;
};