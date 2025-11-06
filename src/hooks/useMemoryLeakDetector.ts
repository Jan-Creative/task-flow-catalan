/**
 * FASE 5: MODE DIAGNÒSTIC ?leakcheck=1
 * Hook per detectar memory leaks en temps real
 * Monitora: Supabase channels, event listeners, timers/intervals
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MemoryLeakStats {
  realtimeChannels: number;
  activeTimers: number;
  activeIntervals: number;
  eventListeners: {
    window: number;
    document: number;
    visualViewport: number;
  };
  timestamp: Date;
  warnings: string[];
}

export interface MemoryLeakThresholds {
  maxChannels: number;
  maxTimers: number;
  maxIntervals: number;
  maxEventListeners: number;
}

const DEFAULT_THRESHOLDS: MemoryLeakThresholds = {
  maxChannels: 20,
  maxTimers: 50,
  maxIntervals: 10,
  maxEventListeners: 30
};

export const useMemoryLeakDetector = (enabled: boolean = false) => {
  const [stats, setStats] = useState<MemoryLeakStats>({
    realtimeChannels: 0,
    activeTimers: 0,
    activeIntervals: 0,
    eventListeners: {
      window: 0,
      document: 0,
      visualViewport: 0
    },
    timestamp: new Date(),
    warnings: []
  });

  const [isEnabled, setIsEnabled] = useState(enabled);
  const intervalRef = useRef<number | null>(null);
  const statsHistoryRef = useRef<MemoryLeakStats[]>([]);

  // Detectar mode ?leakcheck=1 a la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const leakCheckMode = urlParams.get('leakcheck') === '1';
    
    if (leakCheckMode) {
      console.log('🔍 MEMORY LEAK DETECTOR ACTIVE - Mode ?leakcheck=1');
      setIsEnabled(true);
    }
  }, []);

  // Funció per contar canals Supabase actius
  const countSupabaseChannels = (): number => {
    try {
      // Accedir a l'estructura interna de Supabase per comptar canals
      const client = supabase as any;
      
      // Intentar accedir a realtime channels
      if (client.realtime?.channels) {
        const channels = Array.from(client.realtime.channels.values());
        const activeChannels = channels.filter((ch: any) => 
          ch.state === 'joined' || ch.state === 'joining'
        );
        return activeChannels.length;
      }
      
      // Fallback: comptar tots els canals
      if (client.realtime?.channels) {
        return client.realtime.channels.size || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Error counting Supabase channels:', error);
      return 0;
    }
  };

  // Funció per estimar timers/intervals actius
  const estimateActiveTimers = (): { timers: number; intervals: number } => {
    try {
      // Usar internals de Node.js/Browser per comptar timers
      // Això és una aproximació ja que no hi ha API estàndard
      
      const timers = (window as any).__activeTimers || 0;
      const intervals = (window as any).__activeIntervals || 0;
      
      // Si no tenim accés als internals, retornar 0
      return { timers, intervals };
    } catch (error) {
      return { timers: 0, intervals: 0 };
    }
  };

  // Funció per comptar event listeners (aproximació)
  const countEventListeners = (): { window: number; document: number; visualViewport: number } => {
    try {
      // Accedir a getEventListeners (només disponible en DevTools)
      const getEventListeners = (window as any).getEventListeners;
      
      if (getEventListeners) {
        const windowListeners = getEventListeners(window) || {};
        const documentListeners = getEventListeners(document) || {};
        const visualViewportListeners = window.visualViewport 
          ? (getEventListeners(window.visualViewport) || {})
          : {};

        const countListeners = (listeners: any): number => {
          const values = Object.values(listeners) as any[];
          return values.reduce((acc: number, arr: any) => {
            return acc + (Array.isArray(arr) ? arr.length : 0);
          }, 0) as number;
        };

        return {
          window: countListeners(windowListeners),
          document: countListeners(documentListeners),
          visualViewport: countListeners(visualViewportListeners)
        };
      }
      
      // Fallback: no podem comptar sense DevTools
      return {
        window: 0,
        document: 0,
        visualViewport: 0
      };
    } catch (error) {
      return {
        window: 0,
        document: 0,
        visualViewport: 0
      };
    }
  };

  // Funció per generar warnings basats en thresholds
  const generateWarnings = (
    channels: number,
    timers: number,
    intervals: number,
    listeners: { window: number; document: number; visualViewport: number },
    thresholds: MemoryLeakThresholds
  ): string[] => {
    const warnings: string[] = [];

    if (channels > thresholds.maxChannels) {
      warnings.push(`❌ CRITICAL: ${channels} Supabase channels actius (limit: ${thresholds.maxChannels})`);
    }

    if (timers > thresholds.maxTimers) {
      warnings.push(`⚠️ WARNING: ${timers} timers actius (limit: ${thresholds.maxTimers})`);
    }

    if (intervals > thresholds.maxIntervals) {
      warnings.push(`⚠️ WARNING: ${intervals} intervals actius (limit: ${thresholds.maxIntervals})`);
    }

    const totalListeners = listeners.window + listeners.document + listeners.visualViewport;
    if (totalListeners > thresholds.maxEventListeners) {
      warnings.push(`⚠️ WARNING: ${totalListeners} event listeners actius (limit: ${thresholds.maxEventListeners})`);
    }

    return warnings;
  };

  // Funció per actualitzar estadístiques
  const updateStats = (thresholds: MemoryLeakThresholds = DEFAULT_THRESHOLDS) => {
    const channels = countSupabaseChannels();
    const { timers, intervals } = estimateActiveTimers();
    const listeners = countEventListeners();
    const warnings = generateWarnings(channels, timers, intervals, listeners, thresholds);

    const newStats: MemoryLeakStats = {
      realtimeChannels: channels,
      activeTimers: timers,
      activeIntervals: intervals,
      eventListeners: listeners,
      timestamp: new Date(),
      warnings
    };

    setStats(newStats);
    
    // Guardar a l'historial (màxim 100 entrades)
    statsHistoryRef.current = [...statsHistoryRef.current, newStats].slice(-100);

    // Log a consola amb format de taula
    console.log('🔍 [Memory Leak Detector]', new Date().toISOString());
    console.table({
      'Supabase Channels': channels,
      'Active Timers': timers,
      'Active Intervals': intervals,
      'Window Listeners': listeners.window,
      'Document Listeners': listeners.document,
      'VisualViewport Listeners': listeners.visualViewport,
      'Total Listeners': listeners.window + listeners.document + listeners.visualViewport
    });

    // Log warnings
    if (warnings.length > 0) {
      console.warn('🚨 [Memory Leak Warnings]');
      warnings.forEach(warning => console.warn(warning));
    } else {
      console.log('✅ All metrics within normal range');
    }
  };

  // Polling cada 5 segons quan està actiu
  useEffect(() => {
    if (!isEnabled) {
      // Cleanup si es desactiva
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log('🔍 Memory Leak Detector ENABLED - Starting monitoring...');
    
    // Primera actualització immediata
    updateStats();

    // Polling cada 5 segons
    intervalRef.current = window.setInterval(() => {
      updateStats();
    }, 5000);

    return () => {
      console.log('🧹 Memory Leak Detector cleanup');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isEnabled]);

  return {
    stats,
    isEnabled,
    enable: () => setIsEnabled(true),
    disable: () => setIsEnabled(false),
    toggle: () => setIsEnabled(prev => !prev),
    updateStats: () => updateStats(),
    getHistory: () => statsHistoryRef.current,
    clearHistory: () => { statsHistoryRef.current = []; }
  };
};
