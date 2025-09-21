/**
 * Hook React per integrar amb el NotificationManager
 * Proporciona estat reactiu i mètodes convenients
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationAPI, NotificationTypeEnum, NotificationPriority } from '@/services/NotificationAPI';
import { notificationManager } from '@/services/NotificationManager';
import type { NotificationEvent } from '@/services/NotificationManager';

export interface NotificationManagerState {
  queueSize: number;
  processingCount: number;
  healthCheck: boolean;
  circuitBreakerOpen: boolean;
  lastUpdate: Date;
}

export interface NotificationStats {
  sent: number;
  failed: number;
  queued: number;
  cancelled: number;
  retries: number;
}

export const useNotificationManager = () => {
  const [state, setState] = useState<NotificationManagerState>({
    queueSize: 0,
    processingCount: 0,
    healthCheck: true,
    circuitBreakerOpen: false,
    lastUpdate: new Date()
  });

  const [stats, setStats] = useState<NotificationStats>({
    sent: 0,
    failed: 0,
    queued: 0,
    cancelled: 0,
    retries: 0
  });

  const [recentEvents, setRecentEvents] = useState<NotificationEvent[]>([]);

  // Escoltar events del NotificationManager
  useEffect(() => {
    const unsubscribe = notificationManager.addListener((event: NotificationEvent) => {
      // Actualitzar estadístiques
      setStats(prev => ({
        ...prev,
        [event.type]: prev[event.type] + 1
      }));

      // Mantenir historial d'events recents (últims 20)
      setRecentEvents(prev => [event, ...prev.slice(0, 19)]);

      // Actualitzar estat del sistema
      updateSystemState();
    });

    // Actualització inicial
    updateSystemState();

    // Actualització periòdica
    const interval = setInterval(updateSystemState, 10000); // Every 10 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updateSystemState = useCallback(() => {
    const status = notificationManager.getQueueStatus();
    setState({
      queueSize: status.queueSize,
      processingCount: status.processing,
      healthCheck: status.healthCheck,
      circuitBreakerOpen: status.circuitBreaker.isOpen,
      lastUpdate: new Date()
    });
  }, []);

  // API Methods amb error handling
  const createTaskReminder = useCallback(async (
    taskId: string,
    title: string,
    message: string,
    scheduledAt: Date,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ) => {
    try {
      return await notificationAPI.createTaskReminder(taskId, title, message, scheduledAt, priority);
    } catch (error) {
      console.error('❌ Error creant task reminder:', error);
      throw error;
    }
  }, []);

  const createTimeBlockReminder = useCallback(async (
    blockId: string,
    title: string,
    message: string,
    scheduledAt: Date,
    blockType: 'start' | 'end',
    priority: NotificationPriority = NotificationPriority.NORMAL
  ) => {
    try {
      return await notificationAPI.createTimeBlockReminder(blockId, title, message, scheduledAt, blockType, priority);
    } catch (error) {
      console.error('❌ Error creant time block reminder:', error);
      throw error;
    }
  }, []);

  const createCustomNotification = useCallback(async (
    title: string,
    message: string,
    scheduledAt: Date,
    metadata?: Record<string, any>,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ) => {
    try {
      return await notificationAPI.createCustomNotification(title, message, scheduledAt, metadata, priority);
    } catch (error) {
      console.error('❌ Error creant custom notification:', error);
      throw error;
    }
  }, []);

  const cancelNotification = useCallback(async (correlationId: string) => {
    try {
      return await notificationAPI.cancelNotification(correlationId);
    } catch (error) {
      console.error('❌ Error cancel·lant notification:', error);
      throw error;
    }
  }, []);

  const cancelBlockNotifications = useCallback(async (blockId: string) => {
    try {
      return await notificationAPI.cancelBlockNotifications(blockId);
    } catch (error) {
      console.error('❌ Error cancel·lant block notifications:', error);
      throw error;
    }
  }, []);

  const cancelTaskNotifications = useCallback(async (taskId: string) => {
    try {
      return await notificationAPI.cancelTaskNotifications(taskId);
    } catch (error) {
      console.error('❌ Error cancel·lant task notifications:', error);
      throw error;
    }
  }, []);

  // Batch operations
  const createBatchNotifications = useCallback(async (notifications: Array<{
    title: string;
    message: string;
    scheduledAt: Date;
    metadata?: Record<string, any>;
    priority?: NotificationPriority;
  }>) => {
    try {
      return await notificationAPI.createBatchNotifications(notifications);
    } catch (error) {
      console.error('❌ Error creant batch notifications:', error);
      throw error;
    }
  }, []);

  // Template creation
  const createFromTemplate = useCallback(async (
    templateType: string,
    scheduledAt: Date,
    data: Record<string, any>,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ) => {
    try {
      return await notificationAPI.createFromTemplate(templateType, scheduledAt, data, priority);
    } catch (error) {
      console.error('❌ Error creant notification from template:', error);
      throw error;
    }
  }, []);

  // Queue management
  const getQueueContents = useCallback(() => {
    return notificationManager.getQueueContents();
  }, []);

  const clearRecentEvents = useCallback(() => {
    setRecentEvents([]);
  }, []);

  const resetStats = useCallback(() => {
    setStats({
      sent: 0,
      failed: 0,
      queued: 0,
      cancelled: 0,
      retries: 0
    });
  }, []);

  return {
    // State
    state,
    stats,
    recentEvents,
    
    // Computed values
    isHealthy: state.healthCheck && !state.circuitBreakerOpen,
    successRate: stats.sent + stats.failed > 0 ? (stats.sent / (stats.sent + stats.failed)) * 100 : 0,
    
    // Methods
    createTaskReminder,
    createTimeBlockReminder,
    createCustomNotification,
    createFromTemplate,
    cancelNotification,
    cancelBlockNotifications,
    cancelTaskNotifications,
    createBatchNotifications,
    getQueueContents,
    
    // Utility methods
    clearRecentEvents,
    resetStats,
    updateSystemState,
    
    // Constants
    NotificationTypeEnum,
    NotificationPriority
  };
};