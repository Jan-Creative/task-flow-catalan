import { useCallback, useMemo } from 'react';
import { useTasksData } from '@/contexts/TasksProvider';
import type { Task, TaskScheduleInfo, TaskTimeSlot } from '@/types';

// ============= TASK TIME BLOCK OPERATIONS =============
export const useTaskTimeBlocks = () => {
  const { tasks: rawTasks } = useTasksData();
  
  // Ensure we're working with the correct Task type
  const tasks = rawTasks as Task[];

  // Get schedule info for a specific task
  const getTaskScheduleInfo = useCallback((task: Task): TaskScheduleInfo => {
    const hasTimeBlock = !!(task.scheduled_start_time && task.scheduled_end_time);
    
    return {
      hasTimeBlock,
      timeBlockId: task.time_block_id,
      scheduledTime: hasTimeBlock ? {
        start: task.scheduled_start_time!,
        end: task.scheduled_end_time!
      } : undefined,
      isScheduledForToday: hasTimeBlock && task.due_date === new Date().toISOString().split('T')[0]
    };
  }, []);

  // Get all tasks scheduled for today
  const getTodayScheduledTasks = useCallback((): TaskTimeSlot[] => {
    const today = new Date().toISOString().split('T')[0];
    
    return tasks
      .filter(task => 
        task.due_date === today && 
        task.scheduled_start_time && 
        task.scheduled_end_time &&
        task.status !== 'completat'
      )
      .map(task => ({
        taskId: task.id,
        startTime: task.scheduled_start_time!,
        endTime: task.scheduled_end_time!,
        title: task.title,
        color: getTaskColor(task)
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [tasks]);

  // Get tasks grouped by time blocks
  const getTasksByTimeBlock = useCallback((timeBlockId: string): Task[] => {
    return tasks.filter(task => task.time_block_id === timeBlockId);
  }, [tasks]);

  // Check if a time slot conflicts with existing tasks
  const hasTimeConflict = useCallback((
    startTime: string, 
    endTime: string, 
    excludeTaskId?: string
  ): boolean => {
    const today = new Date().toISOString().split('T')[0];
    
    return tasks.some(task => {
      if (task.id === excludeTaskId) return false;
      if (task.due_date !== today) return false;
      if (!task.scheduled_start_time || !task.scheduled_end_time) return false;
      if (task.status === 'completat') return false;

      // Check for time overlap
      const taskStart = task.scheduled_start_time;
      const taskEnd = task.scheduled_end_time;
      
      return (
        (startTime >= taskStart && startTime < taskEnd) ||
        (endTime > taskStart && endTime <= taskEnd) ||
        (startTime <= taskStart && endTime >= taskEnd)
      );
    });
  }, [tasks]);

  // Get next available time slot
  const getNextAvailableTimeSlot = useCallback((
    duration: number = 60 // minutes
  ): { start: string; end: string } | null => {
    const scheduledTasks = getTodayScheduledTasks();
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Start from current time or 09:00, whichever is later
    let startHour = Math.max(now.getHours(), 9);
    let startMinute = startHour === now.getHours() ? now.getMinutes() : 0;
    
    // Round to next 15-minute interval
    startMinute = Math.ceil(startMinute / 15) * 15;
    if (startMinute >= 60) {
      startHour++;
      startMinute = 0;
    }
    
    // Find gap in schedule
    for (let hour = startHour; hour < 22; hour++) {
      for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 15) {
        const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinutes = minute + duration;
        const endHour = hour + Math.floor(endMinutes / 60);
        const endMinute = endMinutes % 60;
        
        if (endHour >= 22) break; // Don't schedule past 10 PM
        
        const end = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        if (!hasTimeConflict(start, end)) {
          return { start, end };
        }
      }
    }
    
    return null; // No available slot found
  }, [getTodayScheduledTasks, hasTimeConflict]);

  // Statistics for scheduled tasks
  const scheduleStats = useMemo(() => {
    const scheduledToday = getTodayScheduledTasks();
    const totalScheduled = tasks.filter(task => 
      task.scheduled_start_time && task.scheduled_end_time
    ).length;
    
    return {
      scheduledToday: scheduledToday.length,
      totalScheduled,
      unscheduledToday: tasks.filter(task => 
        task.due_date === new Date().toISOString().split('T')[0] &&
        task.status !== 'completat' &&
        (!task.scheduled_start_time || !task.scheduled_end_time)
      ).length
    };
  }, [tasks, getTodayScheduledTasks]);

  return {
    getTaskScheduleInfo,
    getTodayScheduledTasks,
    getTasksByTimeBlock,
    hasTimeConflict,
    getNextAvailableTimeSlot,
    scheduleStats
  };
};

// Helper function to get task color based on priority
function getTaskColor(task: Task): string {
  switch (task.priority) {
    case 'urgent':
      return '#ef4444'; // red
    case 'alta':
      return '#f97316'; // orange
    case 'mitjana':
      return '#3b82f6'; // blue
    case 'baixa':
      return '#22c55e'; // green
    default:
      return '#6366f1'; // indigo
  }
}