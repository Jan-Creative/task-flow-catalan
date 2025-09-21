/**
 * Context Actualitzat per usar el NotificationManager centralitzat
 * Manté compatibilitat amb l'API existent mentre migra al nou sistema
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toastUtils';
import type { NotificationPreferences, WebPushSubscriptionDB } from '@/hooks/useNotifications';

// Context Type - mantenim la mateixa interfície per compatibilitat
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
  
  // Accions - ara usen el NotificationManager
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
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Hook original per subscripcions i configuració
  const originalNotifications = useNotifications();
  
  // Nou hook per gestió centralitzada
  const {
    createTaskReminder: createTaskReminderCentralized,
    createCustomNotification: createCustomNotificationCentralized,
    cancelBlockNotifications,
    NotificationPriority
  } = useNotificationManager();

  // Wrapper functions amb migració progressiva al nou sistema
  const wrappedActions = {
    // Mantenim funcions originals per configuració
    initializeNotifications: async () => {
      try {
        return await originalNotifications.initializeNotifications();
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
        await originalNotifications.updatePreferences(updates);
      } catch (error) {
        console.error('Error in updatePreferences:', error);
        toast({
          title: "❌ Error",
          description: "No s'han pogut actualitzar les preferències",
          variant: 'destructive'
        });
      }
    },

    // MIGRAT: Usar el nou sistema centralitzat
    createTaskReminder: async (taskId: string, title: string, message: string, scheduledAt: Date) => {
      try {
        await createTaskReminderCentralized(taskId, title, message, scheduledAt, NotificationPriority.NORMAL);
        console.log('🔄 Task reminder creat via NotificationManager centralitzat');
      } catch (error) {
        console.error('Error in createTaskReminder:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut crear el recordatori",
          variant: 'destructive'
        });
      }
    },

    // MIGRAT: Usar el nou sistema centralitzat
    createCustomNotification: async (
      title: string, 
      message: string, 
      scheduledAt: Date, 
      metadata?: { block_id?: string; notification_type?: string }
    ) => {
      try {
        await createCustomNotificationCentralized(
          title, 
          message, 
          scheduledAt, 
          metadata, 
          NotificationPriority.NORMAL
        );
        console.log('🔄 Custom notification creada via NotificationManager centralitzat');
      } catch (error) {
        console.error('Error in createCustomNotification:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut crear la notificació",
          variant: 'destructive'
        });
      }
    },

    // MIGRAT: Usar cancel·lació centralitzada
    cancelReminder: async (reminderId: string) => {
      try {
        // Si és un blockId, usar la nova funció
        if (reminderId.includes('block') || reminderId.length > 20) {
          await cancelBlockNotifications(reminderId);
          console.log('🔄 Reminders cancel·lats via NotificationManager centralitzat');
        } else {
          // Fallback al sistema original
          await originalNotifications.cancelReminder(reminderId);
        }
      } catch (error) {
        console.error('Error in cancelReminder:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut cancel·lar el recordatori",
          variant: 'destructive'
        });
      }
    },

    // Mantenim funcions originals per altres operacions
    refreshData: async () => {
      try {
        await originalNotifications.refreshData();
      } catch (error) {
        console.error('Error in refreshData:', error);
        toast({
          title: "❌ Error",
          description: "No s'han pogut actualitzar les dades",
          variant: 'destructive'
        });
      }
    },

    runRemindersProcessor: async () => {
      try {
        await originalNotifications.runRemindersProcessor();
      } catch (error) {
        console.error('Error in runRemindersProcessor:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut executar el processador de recordatoris",
          variant: 'destructive'
        });
      }
    },

    sendTestNotification: async () => {
      try {
        return await originalNotifications.sendTestNotification();
      } catch (error) {
        console.error('Error in sendTestNotification:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut enviar la notificació de prova",
          variant: 'destructive'
        });
      }
    },

    resetSubscription: async () => {
      try {
        await originalNotifications.resetSubscription();
      } catch (error) {
        console.error('Error in resetSubscription:', error);
        toast({
          title: "❌ Error",
          description: "No s'ha pogut reiniciar la subscripció",
          variant: 'destructive'
        });
      }
    },

    cleanupDuplicateSubscriptions: async () => {
      try {
        await originalNotifications.cleanupDuplicateSubscriptions();
      } catch (error) {
        console.error('Error in cleanupDuplicateSubscriptions:', error);
        toast({
          title: "❌ Error",
          description: "No s'han pogut netejar les subscripcions duplicades",
          variant: 'destructive'
        });
      }
    },

    purgeAllSubscriptions: async () => {
      try {
        await originalNotifications.purgeAllSubscriptions();
      } catch (error) {
        console.error('Error in purgeAllSubscriptions:', error);
        toast({
          title: "❌ Error",
          description: "No s'han pogut eliminar totes les subscripcions",
          variant: 'destructive'
        });
      }
    },

    getActiveDevices: () => originalNotifications.getActiveDevices(),
    getTotalDevices: () => originalNotifications.getTotalDevices()
  };

  const contextValue: NotificationContextType = {
    // Estat del hook original
    isSupported: originalNotifications.isSupported,
    canUse: originalNotifications.canUse,
    permissionStatus: originalNotifications.permissionStatus,
    isSubscribed: originalNotifications.isSubscribed,
    preferences: originalNotifications.preferences,
    subscriptions: originalNotifications.subscriptions,
    isInitialized: originalNotifications.isInitialized,
    subscription: originalNotifications.subscription,
    notificationsReady: Boolean(originalNotifications.notificationsReady),
    
    // Accions actualitzades
    ...wrappedActions
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};