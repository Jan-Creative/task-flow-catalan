/**
 * LEGACY MIGRATION LAYER - Use NotificationContext.tsx instead
 * 
 * Aquest fitxer era una capa de transició cap al NotificationManager centralitzat.
 * Actualment s'utilitza com a context principal de notificacions a l'aplicació.
 * 
 * ESTAT ACTUAL:
 * - Aquest fitxer: Context principal usat en provider registry
 * - NotificationContext.tsx: Context original amb hook useNotifications
 * 
 * FUNCIONALITAT:
 * - Wrapper sobre useNotifications que migra progressivament cap a NotificationManager
 * - Manté compatibilitat amb API existent mentre centralitza la gestió
 * 
 * Context Actualitzat per usar el NotificationManager centralitzat
 * Manté compatibilitat amb l'API existent mentre migra al nou sistema
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationManager } from '@/hooks/useNotificationManager';
// PHASE 3: Use optional auth to break circular dependencies
import { useOptionalAuth } from '@/hooks/useOptionalAuth';
import { useToast } from '@/lib/toastUtils';
import { logger } from '@/lib/logger';
import type { NotificationPreferences, WebPushSubscriptionDB } from '@/hooks/useNotifications';
import { EMPTY_NOTIFICATION_CONTEXT } from './fallbacks/EmptyNotificationContext';

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

export const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // PHASE 2 IMPROVEMENT: Return empty context instead of throwing
    // This prevents cascading failures when provider is unavailable
    console.warn('useNotificationContext used outside provider, returning empty context');
    return EMPTY_NOTIFICATION_CONTEXT;
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // PHASE 3: Use optional auth to break circular dependencies
  const { user } = useOptionalAuth();
  
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
        logger.error('NotificationContextV2', 'Error initializing notifications', error);
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
        logger.error('NotificationContextV2', 'Error updating preferences', error);
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
        logger.info('NotificationContextV2', 'Task reminder created via centralized NotificationManager', { taskId, scheduledAt });
      } catch (error) {
        logger.error('NotificationContextV2', 'Error creating task reminder', error);
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
        logger.info('NotificationContextV2', 'Custom notification created via centralized NotificationManager', { title, scheduledAt });
      } catch (error) {
        logger.error('NotificationContextV2', 'Error creating custom notification', error);
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
          logger.info('NotificationContextV2', 'Reminders cancelled via centralized NotificationManager', { reminderId });
        } else {
          // Fallback al sistema original
          await originalNotifications.cancelReminder(reminderId);
        }
      } catch (error) {
        logger.error('NotificationContextV2', 'Error cancelling reminder', error);
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
        logger.error('NotificationContextV2', 'Error refreshing data', error);
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
        logger.error('NotificationContextV2', 'Error running reminders processor', error);
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
        logger.error('NotificationContextV2', 'Error sending test notification', error);
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
        logger.error('NotificationContextV2', 'Error resetting subscription', error);
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
        logger.error('NotificationContextV2', 'Error cleaning up duplicate subscriptions', error);
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
        logger.error('NotificationContextV2', 'Error purging all subscriptions', error);
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