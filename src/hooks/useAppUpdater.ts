import { useState, useEffect, useCallback } from 'react';

interface AppUpdateStatus {
  hasUpdate: boolean;
  isUpdating: boolean;
  lastCheck: Date | null;
  error: string | null;
}

export const useAppUpdater = () => {
  const [status, setStatus] = useState<AppUpdateStatus>({
    hasUpdate: false,
    isUpdating: false,
    lastCheck: null,
    error: null
  });

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw-advanced.js');
      if (registration) {
        await registration.update();
        setStatus(prev => ({ 
          ...prev, 
          lastCheck: new Date(),
          error: null 
        }));
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error checking updates',
        lastCheck: new Date()
      }));
    }
  }, []);

  // Force app update
  const forceUpdate = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    setStatus(prev => ({ ...prev, isUpdating: true }));
    
    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Unregister current SW
      const registration = await navigator.serviceWorker.getRegistration('/sw-advanced.js');
      if (registration) {
        await registration.unregister();
      }
      
      // Force reload
      window.location.reload();
    } catch (error) {
      console.error('Error forcing update:', error);
      setStatus(prev => ({ 
        ...prev, 
        isUpdating: false,
        error: error instanceof Error ? error.message : 'Error updating app'
      }));
    }
  }, []);

  // Auto-check for updates
  useEffect(() => {
    // Initial check
    checkForUpdates();

    // Check every 5 minutes when app is active
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    // Check when app becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdates]);

  // Listen for SW update messages
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_ACTIVATED') {
        setStatus(prev => ({ 
          ...prev, 
          hasUpdate: true,
          lastCheck: new Date()
        }));
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
    status,
    checkForUpdates,
    forceUpdate
  };
};