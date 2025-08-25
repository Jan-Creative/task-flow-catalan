import React, { createContext, useContext, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toastUtils';
import type { NotificationPreferences, WebPushSubscriptionDB } from '@/hooks/useNotifications';

// Context Type
interface NotificationContextType {
  // Estats
  isSupported: boolean;
  canUse: boolean;
  permissionStatus: NotificationPermission;
  isSubscribed: boolean;
  preferences: NotificationPreferences | null;
  subscriptions: WebPushSubscriptionDB[];
  isInitialized: boolean;
  subscription: PushSubscription | null;
  
  // Accions
  initializeNotifications: () => Promise<boolean>;
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
  createTaskReminder: (taskId: string, title: string, message: string, scheduledAt: Date) => Promise<void>;
  createCustomNotification: (title: string, message: string, scheduledAt: Date) => Promise<void>;
  cancelReminder: (reminderId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  runRemindersProcessor: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const notifications = useNotifications();

  // Auto-inicialitzar quan l'usuari es conecta
  useEffect(() => {
    if (user && notifications.canUse && !notifications.isInitialized) {
      console.log('🔄 Auto-inicialitzant notificacions per usuari autenticat');
      notifications.initializeNotifications();
    }
  }, [user, notifications.canUse, notifications.isInitialized]);

  // Wrapper functions with error handling
  const wrappedActions = {
    initializeNotifications: async () => {
      try {
        return await notifications.initializeNotifications();
      } catch (error) {
        console.error('Error in initializeNotifications:', error);
        toast({
          title: "❌ Error",
          description: "No s'han pogut inicialitzar les notificacions",
          variant: 'destructive'
        });
        return false;
      }
    },

    updatePreferences: async (updates: Partial<NotificationPreferences>) => {
      try {
        await notifications.updatePreferences(updates);
      } catch (error) {
        console.error('Error in updatePreferences:', error);
        toast({
          title: "❌ Error",
          description: "No s'han pogut actualitzar les preferències",
          variant: 'destructive'
        });
      }
    },

    createTaskReminder: async (taskId: string, title: string, message: string, scheduledAt: Date) => {
      try {
        await notifications.createTaskReminder(taskId, title, message, scheduledAt);
      } catch (error) {
        console.error('Error in createTaskReminder:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut crear el recordatori",
          variant: 'destructive'
        });
      }
    },

    createCustomNotification: async (title: string, message: string, scheduledAt: Date) => {
      try {
        await notifications.createCustomNotification(title, message, scheduledAt);
      } catch (error) {
        console.error('Error in createCustomNotification:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut crear la notificació",
          variant: 'destructive'
        });
      }
    },

    cancelReminder: async (reminderId: string) => {
      try {
        await notifications.cancelReminder(reminderId);
      } catch (error) {
        console.error('Error in cancelReminder:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut cancel·lar el recordatori",
          variant: 'destructive'
        });
      }
    },

    refreshData: async () => {
      try {
        await notifications.refreshData();
      } catch (error) {
        console.error('Error in refreshData:', error);
      }
    },

    runRemindersProcessor: async () => {
      try {
        await notifications.runRemindersProcessor();
      } catch (error) {
        console.error('Error in runRemindersProcessor:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut executar el processador",
          variant: 'destructive'
        });
      }
    },

    sendTestNotification: async () => {
      try {
        await notifications.sendTestNotification();
      } catch (error) {
        console.error('Error in sendTestNotification:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut enviar la notificació de prova",
          variant: 'destructive'
        });
      }
    }
  };

  const contextValue: NotificationContextType = {
    // Estats
    isSupported: notifications.isSupported,
    canUse: notifications.canUse,
    permissionStatus: notifications.permissionStatus,
    isSubscribed: notifications.isSubscribed,
    preferences: notifications.preferences,
    subscriptions: notifications.subscriptions,
    isInitialized: notifications.isInitialized,
    subscription: notifications.subscription,
    
    // Accions amb error handling
    ...wrappedActions
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};