import React, { ReactNode } from 'react';
import { NotificationContext } from '../NotificationContextV2';
import { logger } from '@/lib/logger';

// Empty context value with safe defaults
export const EMPTY_NOTIFICATION_CONTEXT = {
  // States
  isSupported: false,
  canUse: false,
  permissionStatus: 'denied' as NotificationPermission,
  isSubscribed: false,
  preferences: null,
  subscriptions: [],
  isInitialized: false,
  subscription: null,
  notificationsReady: false,

  // No-op functions
  initializeNotifications: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
    return false;
  },
  updatePreferences: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
  },
  createTaskReminder: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
    return null;
  },
  createCustomNotification: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
    return null;
  },
  cancelReminder: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
  },
  refreshData: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
  },
  runRemindersProcessor: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
  },
  sendTestNotification: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
  },
  resetSubscription: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
  },
  cleanupDuplicateSubscriptions: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
  },
  purgeAllSubscriptions: async () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
  },
  getActiveDevices: () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
    return [];
  },
  getTotalDevices: () => {
    logger.warn('EmptyNotificationContext', 'Notification operations unavailable - provider failed');
    return 0;
  },
};

export const EmptyNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <NotificationContext.Provider value={EMPTY_NOTIFICATION_CONTEXT}>
      {children}
    </NotificationContext.Provider>
  );
};
