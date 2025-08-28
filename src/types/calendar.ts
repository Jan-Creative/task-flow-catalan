/**
 * Calendar and Event types for drag-and-drop functionality
 */

import { ID, Timestamp } from './common';

export interface CalendarEvent {
  id: ID;
  title: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  color: string;
  location?: string;
  category?: string;
  isAllDay?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface EventPosition {
  top: string;
  height: string;
  left?: string;
  right?: string;
  width?: string;
}

export interface DropZoneInfo {
  date: Date;
  time?: string;
  isValid: boolean;
  gridColumn?: number;
  gridRow?: number;
}

export interface DragState {
  isDragging: boolean;
  draggedEvent?: CalendarEvent;
  dropZone?: DropZoneInfo;
  originalPosition?: EventPosition;
}

export interface EventDragCallbacks {
  onEventMove: (eventId: ID, newStartDateTime: Date, newEndDateTime: Date) => Promise<void>;
  onEventUpdate: (eventId: ID, updates: Partial<CalendarEvent>) => Promise<void>;
  onEventCreate?: (eventData: Partial<CalendarEvent>) => Promise<void>;
}

export interface CalendarViewport {
  startDate: Date;
  endDate: Date;
  viewType: 'day' | 'week' | 'month';
}

export interface TimeSlot {
  date: Date;
  hour: number;
  minute: number;
  isValid: boolean;
}

export interface CalendarConstraints {
  minHour: number; // Default: 8
  maxHour: number; // Default: 22
  snapToMinutes: number; // Default: 15
  allowWeekends: boolean; // Default: true
}