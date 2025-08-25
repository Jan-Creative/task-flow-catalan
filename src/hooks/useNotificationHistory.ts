import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  sent_at: string;
  created_at: string;
  delivery_status: 'sent' | 'delivered' | 'failed';
  reminder_id?: string;
  fcm_response?: any;
}

export const useNotificationHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notification-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notification history:', error);
        throw error;
      }

      return data as NotificationHistoryItem[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};