import React, { createContext, useContext, useState, useCallback } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { ID } from '@/types/common';

interface CalendarSelectionContextType {
  selectedEvent: CalendarEvent | null;
  selectedEventId: ID | null;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  selectEventById: (eventId: ID) => void;
  clearSelection: () => void;
  isEventSelected: (eventId: ID) => boolean;
}

const CalendarSelectionContext = createContext<CalendarSelectionContextType | undefined>(undefined);

interface CalendarSelectionProviderProps {
  children: React.ReactNode;
}

export const CalendarSelectionProvider: React.FC<CalendarSelectionProviderProps> = ({ children }) => {
  const [selectedEvent, setSelectedEventState] = useState<CalendarEvent | null>(null);

  const setSelectedEvent = useCallback((event: CalendarEvent | null) => {
    setSelectedEventState(event);
  }, []);

  const selectEventById = useCallback((eventId: ID) => {
    // This will be used when we need to select by ID only
    // For now, we'll just store the ID and let the component handle the full event
    console.log('Selecting event by ID:', eventId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEventState(null);
  }, []);

  const isEventSelected = useCallback((eventId: ID) => {
    return selectedEvent?.id === eventId;
  }, [selectedEvent]);

  const value: CalendarSelectionContextType = {
    selectedEvent,
    selectedEventId: selectedEvent?.id || null,
    setSelectedEvent,
    selectEventById,
    clearSelection,
    isEventSelected
  };

  return (
    <CalendarSelectionContext.Provider value={value}>
      {children}
    </CalendarSelectionContext.Provider>
  );
};

export const useCalendarSelection = () => {
  const context = useContext(CalendarSelectionContext);
  if (context === undefined) {
    throw new Error('useCalendarSelection must be used within a CalendarSelectionProvider');
  }
  return context;
};