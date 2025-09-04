import { useCallback } from 'react';
import { addDays, parse, addMinutes, format } from 'date-fns';
import { useNotificationContext } from '@/contexts/NotificationContext';
import type { TimeBlock } from '@/types/timeblock';

export const useTimeBlockNotifications = (baseDate?: Date) => {
  const { createCustomNotification, cancelReminder } = useNotificationContext();

  const scheduleBlockNotification = useCallback(async (
    block: TimeBlock, 
    type: 'start' | 'end'
  ) => {
    if (!block.notifications?.[type] || !block.reminderMinutes?.[type]) {
      return;
    }

    // Use baseDate if provided, otherwise default to tomorrow
    const targetDate = baseDate || addDays(new Date(), 1);
    const timeString = type === 'start' ? block.startTime : block.endTime;
    
    // Parse time and combine with target date
    const blockDateTime = parse(timeString, 'HH:mm', targetDate);
    
    // Subtract reminder minutes
    let reminderDateTime = addMinutes(blockDateTime, -block.reminderMinutes[type]);
    
    // If the reminder time has already passed and we're scheduling for today, 
    // add a 60-second buffer to ensure it gets scheduled
    const now = new Date();
    if (reminderDateTime <= now && baseDate && 
        format(baseDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
      reminderDateTime = addMinutes(now, 1); // Schedule 1 minute from now
      console.log(`⏰ Bloc "${block.title}" (${type}) ja ha passat l'hora original, programant en 1 minut`);
    } else if (reminderDateTime <= now) {
      return; // Skip if it's for a future date and time has passed
    }

    const title = type === 'start' 
      ? `🚀 Bloc de temps a punt de començar`
      : `⏰ Bloc de temps a punt de finalitzar`;
      
    const message = type === 'start'
      ? `"${block.title}" començarà en ${block.reminderMinutes[type]} minuts (${timeString})`
      : `"${block.title}" acabarà en ${block.reminderMinutes[type]} minuts (${timeString})`;

    try {
      await createCustomNotification(title, message, reminderDateTime, {
        block_id: block.id,
        notification_type: 'time_block_reminder'
      });
      console.log(`✅ Notificació programada per ${block.title} (${type}) a ${format(reminderDateTime, 'dd/MM/yyyy HH:mm')} (target date: ${format(targetDate, 'dd/MM/yyyy')})`);
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