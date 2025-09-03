import { useCallback } from 'react';
import { addDays, parse, addMinutes, format } from 'date-fns';
import { useNotificationContext } from '@/contexts/NotificationContext';
import type { TimeBlock } from '@/types/timeblock';

export const useTimeBlockNotifications = () => {
  const { createCustomNotification, cancelReminder } = useNotificationContext();

  const scheduleBlockNotification = useCallback(async (
    block: TimeBlock, 
    type: 'start' | 'end'
  ) => {
    if (!block.notifications?.[type] || !block.reminderMinutes?.[type]) {
      return;
    }

    const tomorrow = addDays(new Date(), 1);
    const timeString = type === 'start' ? block.startTime : block.endTime;
    
    // Parse time and combine with tomorrow's date
    const blockDateTime = parse(timeString, 'HH:mm', tomorrow);
    
    // Subtract reminder minutes
    const reminderDateTime = addMinutes(blockDateTime, -block.reminderMinutes[type]);
    
    // Don't schedule if the reminder time has already passed
    if (reminderDateTime <= new Date()) {
      return;
    }

    const title = type === 'start' 
      ? `🚀 Bloc de temps a punt de començar`
      : `⏰ Bloc de temps a punt de finalitzar`;
      
    const message = type === 'start'
      ? `"${block.title}" començarà en ${block.reminderMinutes[type]} minuts (${timeString})`
      : `"${block.title}" acabarà en ${block.reminderMinutes[type]} minuts (${timeString})`;

    try {
      await createCustomNotification(title, message, reminderDateTime);
      console.log(`✅ Notificació programada per ${block.title} (${type}) a ${format(reminderDateTime, 'HH:mm')}`);
    } catch (error) {
      console.error(`❌ Error programant notificació per ${block.title}:`, error);
    }
  }, [createCustomNotification]);

  const updateBlockNotifications = useCallback(async (
    newBlock: TimeBlock,
    oldBlock?: TimeBlock
  ) => {
    // Schedule new notifications
    if (newBlock.notifications?.start) {
      await scheduleBlockNotification(newBlock, 'start');
    }
    if (newBlock.notifications?.end) {
      await scheduleBlockNotification(newBlock, 'end');
    }
  }, [scheduleBlockNotification]);

  const cancelBlockNotifications = useCallback(async (blockId: string) => {
    // Note: In a real implementation, we'd need to store notification IDs
    // For now, this is a placeholder for the cancellation logic
    console.log(`Cancelling notifications for block: ${blockId}`);
  }, []);

  return {
    scheduleBlockNotification,
    updateBlockNotifications,
    cancelBlockNotifications
  };
};