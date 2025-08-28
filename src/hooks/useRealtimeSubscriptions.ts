import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRealtimeSafety } from './useRealtimeSafety';

interface SubscriptionConfig {
  table: string;
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  invalidateQueries: string[][];
}

// ============= CENTRALIZED REALTIME SUBSCRIPTIONS =============
export const useRealtimeSubscriptions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isRealtimeAvailable, createSafeSubscription } = useRealtimeSafety();
  const channelsRef = useRef<Map<string, any>>(new Map());

  const setupSubscriptions = (configs: SubscriptionConfig[]) => {
    if (!user) return;

    // Cleanup existing channels
    cleanupSubscriptions();

    configs.forEach((config, index) => {
      const channelName = `realtime-${index}-${config.table}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          {
            event: config.event,
            schema: 'public',
            table: config.table,
            ...(config.filter && { filter: config.filter })
          },
          () => {
            // Invalidate all related queries
            config.invalidateQueries.forEach(queryKey => {
              queryClient.invalidateQueries({ queryKey });
            });
          }
        )
        .subscribe();

      channelsRef.current.set(channelName, channel);
    });
  };

  const cleanupSubscriptions = () => {
    channelsRef.current.forEach(channel => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        // Silent cleanup
      }
    });
    channelsRef.current.clear();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupSubscriptions();
  }, []);

  return {
    setupSubscriptions,
    cleanupSubscriptions
  };
};

// ============= PROPERTY-SPECIFIC SUBSCRIPTIONS =============
export const usePropertyRealtimeSubscriptions = () => {
  const { user } = useAuth();
  const { setupSubscriptions } = useRealtimeSubscriptions();

  useEffect(() => {
    if (!user) return;

    const subscriptions: SubscriptionConfig[] = [
      {
        table: 'property_definitions',
        event: '*',
        invalidateQueries: [
          ['unified-properties', user.id],
          ['properties']
        ]
      },
      {
        table: 'property_options',
        event: '*',
        invalidateQueries: [
          ['unified-properties', user.id],
          ['properties']
        ]
      }
    ];

    setupSubscriptions(subscriptions);
  }, [user?.id, setupSubscriptions]);
};

// ============= TASK-SPECIFIC SUBSCRIPTIONS =============
export const useTaskRealtimeSubscriptions = (taskId?: string) => {
  const { setupSubscriptions } = useRealtimeSubscriptions();

  useEffect(() => {
    if (!taskId) return;

    const subscriptions: SubscriptionConfig[] = [
      {
        table: 'task_properties',
        event: '*',
        filter: `task_id=eq.${taskId}`,
        invalidateQueries: [
          ['task-properties', taskId]
        ]
      },
      {
        table: 'property_options',
        event: '*',
        invalidateQueries: [
          ['task-properties', taskId],
          ['unified-properties']
        ]
      },
      {
        table: 'property_definitions',
        event: 'UPDATE',
        invalidateQueries: [
          ['task-properties', taskId],
          ['unified-properties']
        ]
      }
    ];

    setupSubscriptions(subscriptions);
  }, [taskId, setupSubscriptions]);
};