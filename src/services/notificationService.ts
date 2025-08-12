/**
 * Servei de notificacions internes per l'aplicació
 * Gestiona notificacions de finalització de sessions Pomodoro
 */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
  duration?: number;
}

type NotificationCallback = (notification: AppNotification) => void;

class NotificationService {
  private listeners: Set<NotificationCallback> = new Set();
  private notifications: AppNotification[] = [];

  constructor() {
    // Demanar permisos de notificació del navegador
    this.requestPermission();
  }

  private async requestPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  public subscribe(callback: NotificationCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public notify(notification: Omit<AppNotification, 'id' | 'timestamp'>): string {
    const fullNotification: AppNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    this.notifications.push(fullNotification);
    
    // Notificar tots els listeners
    this.listeners.forEach(listener => listener(fullNotification));

    // Mostrar notificació del navegador si té permisos
    this.showBrowserNotification(fullNotification);

    // Auto-eliminar després de la duració especificada
    if (notification.duration) {
      setTimeout(() => {
        this.dismiss(fullNotification.id);
      }, notification.duration);
    }

    return fullNotification.id;
  }

  private showBrowserNotification(notification: AppNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });

      // Auto-tancar després de 5 segons
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }

  public dismiss(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public clear(): void {
    this.notifications = [];
  }

  // Mètodes específics per Pomodoro
  public notifyWorkCompleted(): void {
    this.notify({
      title: 'Sessió de treball completada! 🎯',
      message: 'És hora de fer un descans.',
      type: 'success',
      duration: 8000
    });
  }

  public notifyBreakCompleted(): void {
    this.notify({
      title: 'Descans completat! ⚡',
      message: 'És hora de tornar a treballar.',
      type: 'info',
      duration: 8000
    });
  }

  public notifySessionStarted(type: 'work' | 'break'): void {
    this.notify({
      title: type === 'work' ? 'Sessió de treball iniciada 🚀' : 'Descans iniciat 😌',
      message: type === 'work' ? 'Concentra\'t en la teva tasca.' : 'Relaxa\'t i recarrega energia.',
      type: 'info',
      duration: 3000
    });
  }
}

// Instància singleton
export const notificationService = new NotificationService();