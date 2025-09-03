// ============= TimeBlock Types =============
export interface TimeBlockNotifications {
  start: boolean;
  end: boolean;
}

export interface TimeBlockReminderSettings {
  start: number; // minutes before start time
  end: number;   // minutes before end time
}

export interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  color: string;
  notifications?: TimeBlockNotifications;
  reminderMinutes?: TimeBlockReminderSettings;
}

export interface TimeBlockNotificationConfig {
  enableGlobal: boolean;
  defaultStartReminder: number;
  defaultEndReminder: number;
  defaultStartEnabled: boolean;
  defaultEndEnabled: boolean;
}