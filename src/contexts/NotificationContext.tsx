import React, { createContext, useContext, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useOptionalAuth } from '@/hooks/useOptionalAuth';
import { useToast } from '@/lib/toastUtils';
import { logger } from '@/lib/logger';
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
  notificationsReady: boolean;
  
  // Accions
  initializeNotifications: () => Promise<boolean>;
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
  createTaskReminder: (taskId: string, title: string, message: string, scheduledAt: Date) => Promise<void>;
  createCustomNotification: (title: string, message: string, scheduledAt: Date, metadata?: { block_id?: string; notification_type?: string }) => Promise<void>;
  cancelReminder: (reminderId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  runRemindersProcessor: () => Promise<void>;
  sendTestNotification: () => Promise<any>;
  resetSubscription: () => Promise<void>;
  cleanupDuplicateSubscriptions: () => Promise<void>;
  purgeAllSubscriptions: () => Promise<void>;
  getActiveDevices: () => WebPushSubscriptionDB[];
  getTotalDevices: () => number;
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
  const { user } = useOptionalAuth();
  const { toast } = useToast();
  const notifications = useNotifications();

  // Auto-inicialització DESHABILITADA - ara manual
  // useEffect(() => {
  //   if (user && notifications.canUse && !notifications.isInitialized) {
  //     console.log('🔄 Auto-inicialitzant notificacions per usuari autenticat');
  //     notifications.initializeNotifications();
  //   }
  // }, [user, notifications.canUse, notifications.isInitialized]);

  // Wrapper functions with error handling
  const wrappedActions = {
    initializeNotifications: async () => {
      try {
        return await notifications.initializeNotifications();
      } catch (error) {
        logger.error('NotificationContext', 'Error in initializeNotifications', error);
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
        logger.error('NotificationContext', 'Error in updatePreferences', error);
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
        logger.error('NotificationContext', 'Error in createTaskReminder', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut crear el recordatori",
          variant: 'destructive'
        });
      }
    },

    createCustomNotification: async (title: string, message: string, scheduledAt: Date, metadata?: { block_id?: string; notification_type?: string }) => {
      try {
        await notifications.createCustomNotification(title, message, scheduledAt, metadata);
      } catch (error) {
        logger.error('NotificationContext', 'Error in createCustomNotification', error);
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
        logger.error('NotificationContext', 'Error in cancelReminder', error);
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
        logger.error('NotificationContext', 'Error in refreshData', error);
      }
    },

    runRemindersProcessor: async () => {
      try {
        await notifications.runRemindersProcessor();
      } catch (error) {
        logger.error('NotificationContext', 'Error in runRemindersProcessor', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut executar el processador",
          variant: 'destructive'
        });
      }
    },

    sendTestNotification: async () => {
      try {
        return await notifications.sendTestNotification();
      } catch (error) {
        logger.error('NotificationContext', 'Error in sendTestNotification', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut enviar la notificació de prova",
          variant: 'destructive'
        });
      }
    },

    resetSubscription: async () => {
      try {
        await notifications.resetSubscription();
      } catch (error) {
        logger.error('NotificationContext', 'Error in resetSubscription', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut reinicialitzar les subscripcions",
          variant: 'destructive'
        });
      }
    },

    cleanupDuplicateSubscriptions: async () => {
      try {
        await notifications.cleanupDuplicateSubscriptions();
        toast({
          title: "✅ Èxit",
          description: "Subscripcions duplicades netejades",
        });
      } catch (error) {
        logger.error('NotificationContext', 'Error in cleanupDuplicateSubscriptions', error);
        toast({
          title: "❌ Error",
          description: "No s'han pogut netejar les subscripcions",
          variant: 'destructive'
        });
      }
    },

    purgeAllSubscriptions: async () => {
      try {
        await notifications.purgeAllSubscriptions();
        toast({
          title: "✅ Èxit",
          description: "Totes les subscripcions han estat eliminades",
        });
      } catch (error) {
        logger.error('NotificationContext', 'Error in purgeAllSubscriptions', error);
        toast({
          title: "❌ Error",
          description: "No s'han pogut eliminar les subscripcions",
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
    notificationsReady: notifications.isSupported && notifications.canUse && notifications.permissionStatus === 'granted' && (notifications.isSubscribed || !!notifications.subscription),
    
    // Accions amb error handling
    ...wrappedActions,
    
    // Device management
    getActiveDevices: notifications.getActiveDevices,
    getTotalDevices: notifications.getTotalDevices
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};