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
        }, 3000); // 3 segons timeout per audits

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
      // Silently handle WebSocket errors during audits/restricted environments
      return false;
    }
  }, []);

  const checkRealtimeAvailability = useCallback(async () => {
    try {
      const isAvailable = await testRealtimeConnection();
      
      setState(prev => ({
        ...prev,
        isRealtimeAvailable: isAvailable,
        error: isAvailable ? null : null, // Don't store error message to avoid console pollution
        retryCount: isAvailable ? 0 : prev.retryCount + 1
      }));

      return isAvailable;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRealtimeAvailable: false,
        error: null, // Silently degrade
        retryCount: prev.retryCount + 1
      }));

      return false;
    }
  }, [testRealtimeConnection]);

  const retryConnection = useCallback(async () => {
    if (state.retryCount < 2) { // Màxim 2 intents per evitar delays en audits
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
          // Silently handle subscription errors - graceful degradation
          setState(prev => ({
            ...prev,
            isRealtimeAvailable: false,
            error: null
          }));
        }
      });

      return channel;
    } catch (error) {
      // Silently handle subscription creation errors
      setState(prev => ({
        ...prev,
        isRealtimeAvailable: false,
        error: null
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