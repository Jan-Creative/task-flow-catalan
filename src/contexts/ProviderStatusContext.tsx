/**
 * PHASE 6: Provider Status Monitoring Context
 * Tracks the status of all providers in real-time
 */

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { logger } from '@/lib/logger';

export interface ProviderStatus {
  name: string;
  phase: number;
  status: 'loading' | 'mounted' | 'failed' | 'disabled';
  mountTime?: number;
  error?: Error;
  timestamp: number;
}

interface ProviderStatusContextValue {
  providers: Map<string, ProviderStatus>;
  updateProviderStatus: (name: string, status: Partial<ProviderStatus>) => void;
  getProviderStatus: (name: string) => ProviderStatus | undefined;
  getMountedProviders: () => string[];
  getFailedProviders: () => string[];
  getLoadingProviders: () => string[];
  getDisabledProviders: () => string[];
  getAllStatuses: () => ProviderStatus[];
}

const ProviderStatusContext = createContext<ProviderStatusContextValue | null>(null);

export const ProviderStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [providers, setProviders] = useState<Map<string, ProviderStatus>>(new Map());
  
  // FASE 1: useRef per mantenir referència estable a providers (evitar re-creació de callbacks)
  const providersRef = useRef(providers);
  providersRef.current = providers;
  
  // FASE 1: useRef per detectar spam d'updates
  const lastUpdateTime = useRef<Record<string, number>>({});

  // FASE 2: useRef per pending updates (batch updates)
  const pendingUpdatesRef = useRef<Map<string, Partial<ProviderStatus>>>(new Map());
  const batchTimeoutRef = useRef<number | null>(null);

  const updateProviderStatus = useCallback((name: string, statusUpdate: Partial<ProviderStatus>) => {
    // FASE 2: Detectar spam d'updates (més de 10 updates per segon = problema)
    const now = Date.now();
    const lastUpdate = lastUpdateTime.current[name] || 0;
    
    // FASE 2: DEBOUNCE - Ignorar updates massa ràpids (excepte errors crítics)
    if (lastUpdate && (now - lastUpdate) < 100 && statusUpdate.status !== 'failed') {
      logger.debug('ProviderStatus', `🔇 Debounced update for "${name}" (${now - lastUpdate}ms since last update)`);
      return; // ✅ CANCEL·LAR update massa ràpid
    }
    
    if (now - lastUpdate < 100) {
      logger.warn('ProviderStatus', `⚠️ SPAM WARNING: "${name}" updated twice in <100ms (allowing because status=${statusUpdate.status})`, {
        lastUpdate,
        now,
        delta: now - lastUpdate
      });
    }
    
    lastUpdateTime.current[name] = now;
    
    // FASE 2: BATCH UPDATES - Acumular updates i processar-los junts
    pendingUpdatesRef.current.set(name, {
      ...(pendingUpdatesRef.current.get(name) || {}),
      ...statusUpdate
    });
    
    // Cancel·lar batch anterior
    if (batchTimeoutRef.current !== null) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    // FASE 2: Processar batch després de 16ms (1 frame) - permet agrupar múltiples updates
    batchTimeoutRef.current = window.setTimeout(() => {
      const updates = Array.from(pendingUpdatesRef.current.entries());
      pendingUpdatesRef.current.clear();
      batchTimeoutRef.current = null;
      
      if (updates.length === 0) return;
      
      logger.debug('ProviderStatus', `📦 Processing batched updates for ${updates.length} provider(s)`);
      
      setProviders(prev => {
        const newMap = new Map(prev);
        let hasAnyChanges = false;
        
        updates.forEach(([providerName, update]) => {
          const existing = newMap.get(providerName);
          
          // FASE 1: Skip si no hi ha canvis reals (evitar re-renders innecessaris)
          if (existing) {
            const hasChanges = 
              update.phase !== undefined && update.phase !== existing.phase ||
              update.status !== undefined && update.status !== existing.status ||
              update.mountTime !== undefined && update.mountTime !== existing.mountTime ||
              update.error !== undefined;
            
            if (!hasChanges) {
              logger.debug('ProviderStatus', `Skip redundant update for "${providerName}"`);
              return; // Skip aquest provider
            }
          }
          
          const updated: ProviderStatus = {
            name: providerName,
            phase: update.phase ?? existing?.phase ?? 0,
            status: update.status ?? existing?.status ?? 'loading',
            mountTime: update.mountTime ?? existing?.mountTime,
            error: update.error ?? existing?.error,
            timestamp: Date.now(),
          };
          
          newMap.set(providerName, updated);
          hasAnyChanges = true;
          
          logger.debug('ProviderStatus', `Provider "${providerName}" status updated`, updated);
        });
        
        // FASE 2: Si no hi ha cap canvi real, retornar el mateix Map (evita re-render)
        return hasAnyChanges ? newMap : prev;
      });
    }, 16); // ✅ 16ms = 1 frame @ 60fps
  }, []); // FASE 1: Empty deps - estable per sempre

  // FASE 1: Usar providersRef.current en lloc de providers com a dependència
  const getProviderStatus = useCallback((name: string) => {
    return providersRef.current.get(name);
  }, []); // FASE 1: Empty deps

  const getMountedProviders = useCallback(() => {
    return Array.from(providersRef.current.values())
      .filter(p => p.status === 'mounted')
      .map(p => p.name);
  }, []); // FASE 1: Empty deps

  const getFailedProviders = useCallback(() => {
    return Array.from(providersRef.current.values())
      .filter(p => p.status === 'failed')
      .map(p => p.name);
  }, []); // FASE 1: Empty deps

  const getLoadingProviders = useCallback(() => {
    return Array.from(providersRef.current.values())
      .filter(p => p.status === 'loading')
      .map(p => p.name);
  }, []); // FASE 1: Empty deps

  const getDisabledProviders = useCallback(() => {
    return Array.from(providersRef.current.values())
      .filter(p => p.status === 'disabled')
      .map(p => p.name);
  }, []); // FASE 1: Empty deps

  const getAllStatuses = useCallback(() => {
    return Array.from(providersRef.current.values()).sort((a, b) => a.phase - b.phase);
  }, []); // FASE 1: Empty deps

  const value: ProviderStatusContextValue = {
    providers,
    updateProviderStatus,
    getProviderStatus,
    getMountedProviders,
    getFailedProviders,
    getLoadingProviders,
    getDisabledProviders,
    getAllStatuses,
  };

  return (
    <ProviderStatusContext.Provider value={value}>
      {children}
    </ProviderStatusContext.Provider>
  );
};

export const useProviderStatus = () => {
  const context = useContext(ProviderStatusContext);
  if (!context) {
    // PHASE 6: Graceful degradation if monitoring is not available
    logger.warn('useProviderStatus', 'Provider status monitoring not available');
    return {
      providers: new Map(),
      updateProviderStatus: () => {},
      getProviderStatus: () => undefined,
      getMountedProviders: () => [],
      getFailedProviders: () => [],
      getLoadingProviders: () => [],
      getDisabledProviders: () => [],
      getAllStatuses: () => [],
    };
  }
  return context;
};
