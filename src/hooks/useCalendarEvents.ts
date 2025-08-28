import { useCallback, useMemo } from 'react';
import { CalendarEvent, EventDragCallbacks, CalendarConstraints } from '@/types/calendar';
import { ID } from '@/types/common';
import { useEvents } from './useEvents';

const DEFAULT_CONSTRAINTS: CalendarConstraints = {
  minHour: 8,
  maxHour: 22,
  snapToMinutes: 15,
  allowWeekends: true
};

// Mock events generator
const generateMockEvents = (date: Date): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const dayIndex = date.getDay();
  
  // Monday events
  if (dayIndex === 1) {
    events.push({
      id: "1",
      title: "Reunió d'equip",
      description: "Revisió del sprint actual",
      startDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0),
      endDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 30),
      color: "bg-primary",
      location: "Sala A"
    });
    events.push({
      id: "2",
      title: "Revisió de projecte",
      startDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 14, 0),
      endDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 0),
      color: "bg-success"
    });
  }
  
  // Wednesday events
  if (dayIndex === 3) {
    events.push({
      id: "3",
      title: "Presentació client",
      startDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11, 0),
      endDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 30),
      color: "bg-warning",
      location: "Online"
    });
  }
  
  // Friday events
  if (dayIndex === 5) {
    events.push({
      id: "4",
      title: "Sessió de brainstorming",
      startDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0),
      endDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11, 0),
      color: "bg-secondary"
    });
    events.push({
      id: "5",
      title: "Retrospectiva setmanal",
      startDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 16, 0),
      endDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 0),
      color: "bg-primary"
    });
  }
  
  return events;
};

export const useCalendarEvents = (constraints: Partial<CalendarConstraints> = {}) => {
  const { 
    events, 
    isLoading, 
    error: eventsError, 
    getEventsForDate: getEventsForDateFromHook,
    getEventsForWeek: getEventsForWeekFromHook,
    getEventsForMonth: getEventsForMonthFromHook,
    moveEvent: moveEventFromHook,
    updateEvent: updateEventFromHook,
    createEvent: createEventFromHook
  } = useEvents();
  
  const fullConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };
  
  // Get events for specific date (use hook data or fallback to mock)
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    if (events.length > 0) {
      return getEventsForDateFromHook(date);
    }
    // Fallback to mock data for development
    return generateMockEvents(date);
  }, [events, getEventsForDateFromHook]);

  // Get events for a week starting from startDate
  const getEventsForWeek = useCallback((startDate: Date): CalendarEvent[] => {
    if (events.length > 0) {
      return getEventsForWeekFromHook(startDate);
    }
    // Fallback to mock data for development
    const mockEvents: CalendarEvent[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      mockEvents.push(...generateMockEvents(date));
    }
    return mockEvents;
  }, [events, getEventsForWeekFromHook]);

  // Get events for a specific month
  const getEventsForMonth = useCallback((date: Date): CalendarEvent[] => {
    if (events.length > 0) {
      return getEventsForMonthFromHook(date);
    }
    // Fallback to mock data for development
    const mockEvents: CalendarEvent[] = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      mockEvents.push(...generateMockEvents(new Date(d)));
    }
    return mockEvents;
  }, [events, getEventsForMonthFromHook]);
  
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
      
      console.log(`Event ${eventId} moved to ${newStartDateTime.toISOString()}`);
    } catch (err) {
      console.error('Error moving event:', err);
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
      
      console.log(`Event ${eventId} updated:`, updates);
    } catch (err) {
      console.error('Error updating event:', err);
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
      
      console.log('Event created:', createData);
    } catch (err) {
      console.error('Error creating event:', err);
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