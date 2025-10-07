import { useCallback, useMemo } from 'react';
import { CalendarEvent, EventDragCallbacks, CalendarConstraints } from '@/types/calendar';
import { ID } from '@/types/common';
import { useEvents } from './useEvents';
import { isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { logger } from '@/lib/logger';

const DEFAULT_CONSTRAINTS: CalendarConstraints = {
  minHour: 8,
  maxHour: 22,
  snapToMinutes: 15,
  allowWeekends: true
};

export const useCalendarEvents = (constraints: Partial<CalendarConstraints> = {}) => {
  const { 
    events, 
    isLoading, 
    error: eventsError, 
    moveEvent: moveEventFromHook,
    updateEvent: updateEventFromHook,
    createEvent: createEventFromHook
  } = useEvents();
  
  const fullConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };
  
  // Get events for specific date
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return events.filter(event => 
      isSameDay(event.startDateTime, date)
    );
  }, [events]);

  // Get events for a week starting from startDate
  const getEventsForWeek = useCallback((startDate: Date): CalendarEvent[] => {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(startDate, { weekStartsOn: 1 });
    
    return events.filter(event => 
      isWithinInterval(event.startDateTime, { start: weekStart, end: weekEnd })
    );
  }, [events]);

  // Get events for a specific month
  const getEventsForMonth = useCallback((date: Date): CalendarEvent[] => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    return events.filter(event => 
      isWithinInterval(event.startDateTime, { start: monthStart, end: monthEnd })
    );
  }, [events]);
  
  // Validate if a time slot is valid for dropping
  const isValidTimeSlot = useCallback((date: Date, hour: number, minute: number): boolean => {
    // Check hour constraints
    if (hour < fullConstraints.minHour || hour > fullConstraints.maxHour) {
      return false;
    }
    
    // Check weekend constraints
    if (!fullConstraints.allowWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
      return false;
    }
    
    // Check minute snapping
    if (minute % fullConstraints.snapToMinutes !== 0) {
      return false;
    }
    
    return true;
  }, [fullConstraints]);
  
  // Snap time to nearest valid slot
  const snapToValidTime = useCallback((date: Date, hour: number, minute: number): Date => {
    const snappedMinute = Math.round(minute / fullConstraints.snapToMinutes) * fullConstraints.snapToMinutes;
    const constrainedHour = Math.max(fullConstraints.minHour, Math.min(fullConstraints.maxHour, hour));
    
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), constrainedHour, snappedMinute);
  }, [fullConstraints]);
  
  // Move event to new time slot
  const moveEvent = useCallback(async (eventId: ID, newStartDateTime: Date, newEndDateTime: Date): Promise<void> => {
    try {
      // Validate the new time slot
      const newStartHour = newStartDateTime.getHours();
      const newStartMinute = newStartDateTime.getMinutes();
      
      if (!isValidTimeSlot(newStartDateTime, newStartHour, newStartMinute)) {
        throw new Error('Invalid time slot for event placement');
      }

      // Use the hook's moveEvent function
      await moveEventFromHook(eventId.toString(), newStartDateTime, newEndDateTime);
      
      logger.debug('useCalendarEvents', `Event ${eventId} moved to ${newStartDateTime.toISOString()}`);
    } catch (err) {
      logger.error('useCalendarEvents', 'Error moving event', err);
      throw err;
    }
  }, [isValidTimeSlot, moveEventFromHook]);

  // Update event properties
  const updateEvent = useCallback(async (eventId: ID, updates: Partial<CalendarEvent>): Promise<void> => {
    try {
      const updateData: any = { ...updates };
      
      // Convert CalendarEvent format to database format
      if (updates.startDateTime) updateData.start_datetime = updates.startDateTime;
      if (updates.endDateTime) updateData.end_datetime = updates.endDateTime;
      if (updates.isAllDay !== undefined) updateData.is_all_day = updates.isAllDay;
      
      await updateEventFromHook({ id: eventId.toString(), ...updateData });
      
      logger.debug('useCalendarEvents', `Event ${eventId} updated`, updates);
    } catch (err) {
      logger.error('useCalendarEvents', 'Error updating event', err);
      throw err;
    }
  }, [updateEventFromHook]);

  // Create new event
  const createEvent = useCallback(async (eventData: Partial<CalendarEvent>): Promise<void> => {
    try {
      const createData = {
        title: eventData.title || 'Nou esdeveniment',
        description: eventData.description,
        start_datetime: eventData.startDateTime || new Date(),
        end_datetime: eventData.endDateTime || new Date(),
        color: eventData.color || '#6366f1',
        location: eventData.location,
        category: eventData.category,
        is_all_day: eventData.isAllDay || false,
      };

      await createEventFromHook(createData);
      
      logger.debug('useCalendarEvents', 'Event created', createData);
    } catch (err) {
      logger.error('useCalendarEvents', 'Error creating event', err);
      throw err;
    }
  }, [createEventFromHook]);
  
  const callbacks: EventDragCallbacks = useMemo(() => ({
    onEventMove: moveEvent,
    onEventUpdate: updateEvent,
    onEventCreate: createEvent
  }), [moveEvent, updateEvent, createEvent]);
  
  return {
    // Event data
    getEventsForDate,
    getEventsForWeek,
    getEventsForMonth,
    
    // Validation helpers
    isValidTimeSlot,
    snapToValidTime,
    
    // Event operations
    callbacks,
    
    // State
    loading: isLoading,
    error: eventsError?.message || null,
    constraints: fullConstraints
  };
};