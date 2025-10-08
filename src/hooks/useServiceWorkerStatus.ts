import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

interface ServiceWorkerStatus {
  isRegistered: boolean;
  isActive: boolean;
  isWaiting: boolean;
  isInstalling: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

export const useServiceWorkerStatus = () => {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isRegistered: false,
    isActive: false,
    isWaiting: false,
    isInstalling: false,
    lastUpdate: null,
    error: null
  });

  const updateStatus = useCallback(() => {
    if (!('serviceWorker' in navigator)) {
      setStatus(prev => ({ ...prev, error: 'Service Workers no suportats' }));
      return;
    }

    navigator.serviceWorker.getRegistration()
      .then(registration => {
        if (!registration) {
          setStatus(prev => ({ 
            ...prev, 
            isRegistered: false,
            isActive: false,
            isWaiting: false,
            isInstalling: false,
            error: null
          }));
          return;
        }

        const newStatus: ServiceWorkerStatus = {
          isRegistered: true,
          isActive: registration.active?.state === 'activated',
          isWaiting: !!registration.waiting,
          isInstalling: !!registration.installing,
          lastUpdate: new Date(),
          error: null
        };

        setStatus(newStatus);

        // Escoltar canvis d'estat
        [registration.installing, registration.waiting, registration.active]
          .filter(Boolean)
          .forEach(worker => {
            worker!.addEventListener('statechange', updateStatus);
          });
      })
      .catch(error => {
        logger.error('ServiceWorkerStatus', 'Error getting SW registration', error);
        setStatus(prev => ({ ...prev, error: error.message }));
      });
  }, []);

  const forceUpdate = useCallback(() => {
    navigator.serviceWorker.getRegistration()
      .then(registration => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
  }, []);

  useEffect(() => {
    updateStatus();
    
    // Escoltar esdeveniments del SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', updateStatus);
      
      // Escoltar missatges del SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_ACTIVATED') {
          logger.debug('ServiceWorkerStatus', 'SW activated, updating status', {
            cacheVersion: event.data.cacheVersion,
            buildHash: event.data.buildHash,
            previousVersion: event.data.previousVersion
          });
          setTimeout(updateStatus, 100); // Petit delay per assegurar l'estat
        }
      });
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', updateStatus);
      }
    };
  }, [updateStatus]);

  return {
    status,
    updateStatus,
    forceUpdate,
    isReady: status.isRegistered && status.isActive
  };
};