import { useState, useCallback, useMemo } from 'react';
import { CalendarEvent, EventDragCallbacks, CalendarConstraints } from '@/types/calendar';
import { ID } from '@/types/common';
import { toast } from '@/lib/toastUtils';

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fullConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };
  
  // Get events for a specific date or date range
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    // For now, return mock events - later this would fetch from database
    return generateMockEvents(date);
  }, []);
  
  const getEventsForWeek = useCallback((startDate: Date): CalendarEvent[] => {
    const weekEvents: CalendarEvent[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekEvents.push(...getEventsForDate(date));
    }
    return weekEvents;
  }, [getEventsForDate]);
  
  const getEventsForMonth = useCallback((date: Date): CalendarEvent[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const monthEvents: CalendarEvent[] = [];
    for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
      const currentDate = new Date(year, month, d);
      monthEvents.push(...getEventsForDate(currentDate));
    }
    return monthEvents;
  }, [getEventsForDate]);
  
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
  
  // Event operations
  const moveEvent = useCallback(async (eventId: ID, newStartDateTime: Date, newEndDateTime: Date): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📅 Moving event:', { eventId, newStartDateTime, newEndDateTime });
      
      // Validate the new time slot
      if (!isValidTimeSlot(newStartDateTime, newStartDateTime.getHours(), newStartDateTime.getMinutes())) {
        throw new Error('Hora no vàlida per aquest esdeveniment');
      }
      
      // Update event in state (optimistic update)
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, startDateTime: newStartDateTime, endDateTime: newEndDateTime }
            : event
        )
      );
      
      // TODO: Here would be the actual API call to update the database
      // await updateEventInDatabase(eventId, { startDateTime: newStartDateTime, endDateTime: newEndDateTime });
      
      toast.success('Esdeveniment mogut correctament');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error movent l\'esdeveniment';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Revert optimistic update on error
      // You'd fetch the original state here
    } finally {
      setLoading(false);
    }
  }, [isValidTimeSlot]);
  
  const updateEvent = useCallback(async (eventId: ID, updates: Partial<CalendarEvent>): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📅 Updating event:', { eventId, updates });
      
      // Update event in state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, ...updates }
            : event
        )
      );
      
      // TODO: API call
      toast.success('Esdeveniment actualitzat');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualitzant l\'esdeveniment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createEvent = useCallback(async (eventData: Partial<CalendarEvent>): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📅 Creating event:', eventData);
      
      const newEvent: CalendarEvent = {
        id: `temp-${Date.now()}`,
        title: eventData.title || 'Nou esdeveniment',
        startDateTime: eventData.startDateTime || new Date(),
        endDateTime: eventData.endDateTime || new Date(),
        color: eventData.color || 'bg-primary',
        ...eventData
      };
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      // TODO: API call
      toast.success('Esdeveniment creat');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creant l\'esdeveniment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
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
    loading,
    error,
    constraints: fullConstraints
  };
};