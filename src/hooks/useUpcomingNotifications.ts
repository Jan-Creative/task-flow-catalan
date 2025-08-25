import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UpcomingNotificationItem {
  id: string;
  title: string;
  message: string;
  scheduled_at: string;
  created_at: string;
  status: 'pending' | 'sent' | 'cancelled';
  notification_type: string;
  task_id?: string;
  metadata?: any;
}

export const useUpcomingNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['upcoming-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notification_reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error fetching upcoming notifications:', error);
        throw error;
      }

      return data as UpcomingNotificationItem[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60, // Refetch every minute for real-time countdown
    refetchOnWindowFocus: true,
  });
};