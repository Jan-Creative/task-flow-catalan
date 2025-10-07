import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { CalendarEvent } from '@/types/calendar';

interface CreateEventData {
  title: string;
  description?: string;
  start_datetime: Date;
  end_datetime: Date;
  is_all_day?: boolean;
  location?: string;
  location_type?: string;
  color?: string;
  category?: string;
  reminder_time?: number;
  repeat_pattern?: string;
}

interface UpdateEventData {
  title?: string;
  description?: string;
  start_datetime?: Date;
  end_datetime?: Date;
  is_all_day?: boolean;
  location?: string;
  location_type?: string;
  color?: string;
  category?: string;
  reminder_time?: number;
  repeat_pattern?: string;
}

export function useEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch events
  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_datetime', { ascending: true });

      if (error) throw error;

      // Transform database events to CalendarEvent format
      return data.map((event): CalendarEvent => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDateTime: new Date(event.start_datetime),
        endDateTime: new Date(event.end_datetime),
        color: event.color,
        location: event.location,
        category: event.category,
        isAllDay: event.is_all_day,
        created_at: event.created_at,
        updated_at: event.updated_at,
      }));
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes - Events change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refresh when user returns
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            user_id: user.id,
            title: eventData.title,
            description: eventData.description,
            start_datetime: eventData.start_datetime.toISOString(),
            end_datetime: eventData.end_datetime.toISOString(),
            is_all_day: eventData.is_all_day || false,
            location: eventData.location,
            location_type: eventData.location_type || 'none',
            color: eventData.color || '#6366f1',
            category: eventData.category,
            reminder_time: eventData.reminder_time,
            repeat_pattern: eventData.repeat_pattern || 'none',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      toast.success("Esdeveniment creat correctament");
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast.error("No s'ha pogut crear l'esdeveniment");
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateEventData & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const updateData: any = { ...updates };
      
      // Convert dates to ISO strings if present
      if (updates.start_datetime) {
        updateData.start_datetime = updates.start_datetime.toISOString();
      }
      if (updates.end_datetime) {
        updateData.end_datetime = updates.end_datetime.toISOString();
      }

      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      toast.success("Esdeveniment actualitzat correctament");
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast.error("No s'ha pogut actualitzar l'esdeveniment");
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      toast.success("Esdeveniment eliminat correctament");
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast.error("No s'ha pogut eliminar l'esdeveniment");
    },
  });

  // Move event (for drag and drop)
  const moveEvent = async (eventId: string, newStartDateTime: Date, newEndDateTime: Date) => {
    return updateEventMutation.mutateAsync({
      id: eventId,
      start_datetime: newStartDateTime,
      end_datetime: newEndDateTime,
    });
  };

  // Helper functions for calendar integration
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForWeek = (startDate: Date): CalendarEvent[] => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  const getEventsForMonth = (date: Date): CalendarEvent[] => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  };

  return {
    events,
    isLoading,
    error,
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    moveEvent,
    getEventsForDate,
    getEventsForWeek,
    getEventsForMonth,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
}