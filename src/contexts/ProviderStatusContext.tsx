/**
 * PHASE 6: Provider Status Monitoring Context
 * Tracks the status of all providers in real-time
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

  const updateProviderStatus = useCallback((name: string, statusUpdate: Partial<ProviderStatus>) => {
    setProviders(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(name);
      
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
  }, []);

  const getProviderStatus = useCallback((name: string) => {
    return providers.get(name);
  }, [providers]);

  const getMountedProviders = useCallback(() => {
    return Array.from(providers.values())
      .filter(p => p.status === 'mounted')
      .map(p => p.name);
  }, [providers]);

  const getFailedProviders = useCallback(() => {
    return Array.from(providers.values())
      .filter(p => p.status === 'failed')
      .map(p => p.name);
  }, [providers]);

  const getLoadingProviders = useCallback(() => {
    return Array.from(providers.values())
      .filter(p => p.status === 'loading')
      .map(p => p.name);
  }, [providers]);

  const getDisabledProviders = useCallback(() => {
    return Array.from(providers.values())
      .filter(p => p.status === 'disabled')
      .map(p => p.name);
  }, [providers]);

  const getAllStatuses = useCallback(() => {
    return Array.from(providers.values()).sort((a, b) => a.phase - b.phase);
  }, [providers]);

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
