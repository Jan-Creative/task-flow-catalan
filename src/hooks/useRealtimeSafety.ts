import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeSafetyState {
  isRealtimeAvailable: boolean;
  error: string | null;
  retryCount: number;
}

/**
 * Hook per gestionar la seguretat de les connexions realtime de Supabase
 * Detecta quan WebSocket no està disponible i proporciona fallbacks
 */
export const useRealtimeSafety = () => {
  const [state, setState] = useState<RealtimeSafetyState>({
    isRealtimeAvailable: true,
    error: null,
    retryCount: 0
  });

  const testRealtimeConnection = useCallback(async () => {
    try {
      // Intentem crear un canal de test per verificar si WebSocket funciona
      const testChannel = supabase.channel('realtime-test');
      
      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          supabase.removeChannel(testChannel);
          resolve(false);
        }, 5000); // 5 segons timeout

        testChannel
          .on('presence', { event: 'sync' }, () => {
            clearTimeout(timeout);
            supabase.removeChannel(testChannel);
            resolve(true);
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              clearTimeout(timeout);
              supabase.removeChannel(testChannel);
              resolve(true);
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              clearTimeout(timeout);
              supabase.removeChannel(testChannel);
              resolve(false);
            }
          });
      });
    } catch (error) {
      console.warn('WebSocket not available:', error);
      return false;
    }
  }, []);

  const checkRealtimeAvailability = useCallback(async () => {
    try {
      const isAvailable = await testRealtimeConnection();
      
      setState(prev => ({
        ...prev,
        isRealtimeAvailable: isAvailable,
        error: isAvailable ? null : 'WebSocket not available - operating in polling mode',
        retryCount: isAvailable ? 0 : prev.retryCount + 1
      }));

      return isAvailable;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown WebSocket error';
      
      setState(prev => ({
        ...prev,
        isRealtimeAvailable: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      return false;
    }
  }, [testRealtimeConnection]);

  const retryConnection = useCallback(async () => {
    if (state.retryCount < 3) { // Màxim 3 intents
      console.log(`Intentant reconnexió realtime (intent ${state.retryCount + 1}/3)...`);
      return await checkRealtimeAvailability();
    }
    return false;
  }, [checkRealtimeAvailability, state.retryCount]);

  // Comprova la disponibilitat al inicialitzar
  useEffect(() => {
    checkRealtimeAvailability();
  }, [checkRealtimeAvailability]);

  // Funció helper per crear subscripcions segures
  const createSafeSubscription = useCallback((
    channelName: string,
    config: {
      event: string;
      schema: string;
      table: string;
      filter?: string;
    },
    callback: () => void
  ) => {
    if (!state.isRealtimeAvailable) {
      console.log(`Realtime not available - skipping subscription for ${channelName}`);
      return null;
    }

    try {
      const channel = supabase.channel(channelName);
      
      const subscription = channel.on(
        'postgres_changes',
        {
          event: config.event as any,
          schema: config.schema,
          table: config.table,
          ...(config.filter && { filter: config.filter })
        },
        callback
      );

      subscription.subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`Subscription error for ${channelName}:`, status);
          setState(prev => ({
            ...prev,
            isRealtimeAvailable: false,
            error: `Subscription failed: ${status}`
          }));
        }
      });

      return channel;
    } catch (error) {
      console.warn(`Failed to create subscription for ${channelName}:`, error);
      setState(prev => ({
        ...prev,
        isRealtimeAvailable: false,
        error: 'Failed to create subscription'
      }));
      return null;
    }
  }, [state.isRealtimeAvailable]);

  return {
    ...state,
    checkRealtimeAvailability,
    retryConnection,
    createSafeSubscription
  };
};