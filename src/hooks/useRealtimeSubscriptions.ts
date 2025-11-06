import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionConfig {
  table: string;
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  invalidateQueries: string[][];
}

// ============= CENTRALIZED REALTIME SUBSCRIPTIONS =============
// FASE 1: GUARDS PER SUPABASE REALTIME - Eliminar memory leaks
export const useRealtimeSubscriptions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelsRef = useRef<Map<string, any>>(new Map());
  const subscribedRef = useRef(false); // ✅ GUARD CONTRA DOUBLE MOUNTING (StrictMode)

  const setupSubscriptions = useCallback((configs: SubscriptionConfig[]) => {
    // ✅ GUARD: Skip si ja està subscrit (prevé duplicats en StrictMode)
    if (subscribedRef.current) {
      console.warn('⚠️ useRealtimeSubscriptions: Already subscribed, skipping duplicate setup');
      return;
    }
    
    if (!user) return;

    subscribedRef.current = true;
    console.log('🔌 Setting up realtime subscriptions:', configs.length, 'channels for user:', user.id);

    // Cleanup anterior amb logging detallat
    const oldChannelCount = channelsRef.current.size;
    if (oldChannelCount > 0) {
      console.log(`🧹 Cleaning up ${oldChannelCount} existing channels before setup`);
      cleanupSubscriptions();
    }

    configs.forEach((config, index) => {
      try {
        // ✅ MILLOR NAMING: Incloure userId per evitar conflictes
        const channelName = `realtime-${user.id}-${config.table}-${index}`;
        console.log(`📡 Creating channel: ${channelName}`);
        
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
            (payload) => {
              console.log(`🔔 Realtime update on ${config.table}:`, payload);
              // Invalidate all related queries
              config.invalidateQueries.forEach(queryKey => {
                queryClient.invalidateQueries({ queryKey });
              });
            }
          )
          .subscribe((status) => {
            console.log(`📊 Channel ${channelName} status:`, status);
            
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn(`⚠️ Channel ${channelName} failed with status: ${status}`);
              // ✅ CLEANUP: Eliminar canal fallit del tracking
              channelsRef.current.delete(channelName);
            } else if (status === 'SUBSCRIBED') {
              console.log(`✅ Channel ${channelName} subscribed successfully`);
            }
          });

        channelsRef.current.set(channelName, channel);
      } catch (error) {
        console.error(`❌ Error creating channel for ${config.table}:`, error);
      }
    });

    console.log(`✅ Created ${channelsRef.current.size} realtime channels`);
  }, [user, queryClient]);

  const cleanupSubscriptions = useCallback(() => {
    const channelCount = channelsRef.current.size;
    console.log(`🧹 Cleaning up ${channelCount} Supabase channels...`);
    
    channelsRef.current.forEach((channel, name) => {
      try {
        supabase.removeChannel(channel);
        console.log(`✅ Removed channel: ${name}`);
      } catch (error) {
        console.error(`❌ Error removing channel ${name}:`, error);
      }
    });
    
    channelsRef.current.clear();
    subscribedRef.current = false;
    console.log('✅ All Supabase channels cleaned up');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🔴 useRealtimeSubscriptions unmounting, cleaning up...');
      cleanupSubscriptions();
    };
  }, [cleanupSubscriptions]);

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