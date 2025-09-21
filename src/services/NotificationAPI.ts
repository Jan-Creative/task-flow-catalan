/**
 * API Centralitzada per Notificacions
 * Interfície simplificada per components i hooks
 */

import { 
  notificationManager, 
  NotificationPayload, 
  NotificationTypeEnum, 
  NotificationPriority 
} from './NotificationManager';

// Interfície simplificada per components
export interface CreateNotificationParams {
  title: string;
  message: string;
  scheduledAt: Date;
  type?: NotificationTypeEnum;
  priority?: NotificationPriority;
  taskId?: string;
  blockId?: string;
  metadata?: Record<string, any>;
}

// API Class amb mètodes convenients
export class NotificationAPI {
  private static instance: NotificationAPI;

  private constructor() {}

  public static getInstance(): NotificationAPI {
    if (!NotificationAPI.instance) {
      NotificationAPI.instance = new NotificationAPI();
    }
    return NotificationAPI.instance;
  }

  // Mètodes principals
  async createTaskReminder(
    taskId: string, 
    title: string, 
    message: string, 
    scheduledAt: Date,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ): Promise<string> {
    const payload: NotificationPayload = {
      title,
      message,
      scheduledAt,
      type: NotificationTypeEnum.TASK_REMINDER,
      priority,
      taskId,
      metadata: { source: 'task_reminder_api' }
    };

    return notificationManager.scheduleNotification(payload);
  }

  async createTimeBlockReminder(
    blockId: string,
    title: string,
    message: string,
    scheduledAt: Date,
    blockType: 'start' | 'end',
    priority: NotificationPriority = NotificationPriority.NORMAL
  ): Promise<string> {
    const payload: NotificationPayload = {
      title,
      message,
      scheduledAt,
      type: blockType === 'start' ? NotificationTypeEnum.TIME_BLOCK_START : NotificationTypeEnum.TIME_BLOCK_END,
      priority,
      blockId,
      metadata: { 
        source: 'time_block_api',
        block_type: blockType 
      }
    };

    return notificationManager.scheduleNotification(payload);
  }

  async createCustomNotification(
    title: string,
    message: string,
    scheduledAt: Date,
    metadata?: Record<string, any>,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ): Promise<string> {
    const payload: NotificationPayload = {
      title,
      message,
      scheduledAt,
      type: NotificationTypeEnum.CUSTOM,
      priority,
      metadata: { 
        ...metadata,
        source: 'custom_api' 
      }
    };

    return notificationManager.scheduleNotification(payload);
  }

  async createDeadlineAlert(
    taskId: string,
    title: string,
    message: string,
    scheduledAt: Date
  ): Promise<string> {
    const payload: NotificationPayload = {
      title,
      message,
      scheduledAt,
      type: NotificationTypeEnum.DEADLINE_ALERT,
      priority: NotificationPriority.HIGH,
      taskId,
      metadata: { source: 'deadline_alert_api' }
    };

    return notificationManager.scheduleNotification(payload);
  }

  // Mètodes de cancel·lació
  async cancelNotification(correlationId: string): Promise<boolean> {
    return notificationManager.cancelNotification(correlationId);
  }

  async cancelTaskNotifications(taskId: string): Promise<void> {
    // Implementar cancel·lació per taskId
    const queueContents = notificationManager.getQueueContents();
    const taskNotifications = queueContents.filter(item => 
      item.title.includes(taskId) || // Simple check, might need improvement
      item.type === NotificationTypeEnum.TASK_REMINDER
    );

    for (const notification of taskNotifications) {
      await notificationManager.cancelNotification(notification.id);
    }
  }

  async cancelBlockNotifications(blockId: string): Promise<number> {
    return notificationManager.cancelNotificationsByBlockId(blockId);
  }

  // Mètodes d'estat i debugging
  getSystemStatus() {
    return notificationManager.getQueueStatus();
  }

  getQueueContents() {
    return notificationManager.getQueueContents();
  }

  // Event listener wrapper
  addNotificationListener(callback: (event: any) => void): () => void {
    return notificationManager.addListener(callback);
  }

  // Batch operations
  async createBatchNotifications(notifications: CreateNotificationParams[]): Promise<string[]> {
    const results = await Promise.allSettled(
      notifications.map(notif => this.createCustomNotification(
        notif.title,
        notif.message,
        notif.scheduledAt,
        notif.metadata,
        notif.priority
      ))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  // Smart scheduling - evitar horaris problemàtics
  adjustScheduleTime(scheduledAt: Date): Date {
    const hour = scheduledAt.getHours();
    
    // Evitar horaris molt matineres (00:00-06:00) o molt tardans (23:00-24:00)
    if (hour >= 0 && hour < 6) {
      scheduledAt.setHours(9, 0, 0, 0); // Moure a les 9 AM
    } else if (hour >= 23) {
      scheduledAt.setHours(21, 0, 0, 0); // Moure a les 9 PM
    }
    
    return scheduledAt;
  }

  // Template system
  private getNotificationTemplate(type: string, data: Record<string, any>): { title: string; message: string } {
    const templates = {
      task_due_soon: {
        title: `⏰ Tasca pendent`,
        message: `La tasca "${data.taskTitle}" veu demà ${data.dueDate}`
      },
      time_block_starting: {
        title: `🚀 Bloc de temps`,
        message: `"${data.blockTitle}" començarà en ${data.minutes} minuts`
      },
      time_block_ending: {
        title: `⏰ Bloc acabant`,
        message: `"${data.blockTitle}" acabarà en ${data.minutes} minuts`
      },
      daily_preparation: {
        title: `🌅 Hora de preparar demà`,
        message: `És hora de revisar i planificar les tasques per demà`
      }
    };

    return templates[type] || { title: data.title, message: data.message };
  }

  async createFromTemplate(
    templateType: string,
    scheduledAt: Date,
    data: Record<string, any>,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ): Promise<string> {
    const template = this.getNotificationTemplate(templateType, data);
    
    return this.createCustomNotification(
      template.title,
      template.message,
      this.adjustScheduleTime(scheduledAt),
      { ...data, template_type: templateType },
      priority
    );
  }
}

// Export singleton instance
export const notificationAPI = NotificationAPI.getInstance();

// Export convenience types
export { NotificationTypeEnum, NotificationPriority } from './NotificationManager';