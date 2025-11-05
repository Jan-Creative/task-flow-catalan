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

  const updateProviderStatus = useCallback((name: string, statusUpdate: Partial<ProviderStatus>) => {
    // FASE 1: Detectar spam d'updates (més de 10 updates per segon = problema)
    const now = Date.now();
    const lastUpdate = lastUpdateTime.current[name] || 0;
    
    if (now - lastUpdate < 100) {
      logger.warn('ProviderStatus', `⚠️ SPAM WARNING: "${name}" updated twice in <100ms`, {
        lastUpdate,
        now,
        delta: now - lastUpdate
      });
    }
    
    lastUpdateTime.current[name] = now;
    
    setProviders(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(name);
      
      // FASE 1: Skip si no hi ha canvis reals (evitar re-renders innecessaris)
      if (existing) {
        const hasChanges = 
          statusUpdate.phase !== undefined && statusUpdate.phase !== existing.phase ||
          statusUpdate.status !== undefined && statusUpdate.status !== existing.status ||
          statusUpdate.mountTime !== undefined && statusUpdate.mountTime !== existing.mountTime ||
          statusUpdate.error !== undefined;
        
        if (!hasChanges) {
          logger.debug('ProviderStatus', `Skip redundant update for "${name}"`);
          return prev; // No canvis, retornar mateix Map (evita re-render)
        }
      }
      
      const updated: ProviderStatus = {
        name,
        phase: statusUpdate.phase ?? existing?.phase ?? 0,
        status: statusUpdate.status ?? existing?.status ?? 'loading',
        mountTime: statusUpdate.mountTime ?? existing?.mountTime,
        error: statusUpdate.error ?? existing?.error,
        timestamp: Date.now(),
      };
      
      newMap.set(name, updated);
      
      logger.debug('ProviderStatus', `Provider "${name}" status updated`, updated);
      
      return newMap;
    });
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
