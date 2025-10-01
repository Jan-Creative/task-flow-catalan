import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PWADebugInfo {
  isPWA: boolean;
  isStandalone: boolean;
  displayMode: string;
  swStatus: string;
  swRegistered: boolean;
  timestamp: string;
  errors: string[];
}

export const PWADebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<PWADebugInfo>({
    isPWA: false,
    isStandalone: false,
    displayMode: 'browser',
    swStatus: 'unknown',
    swRegistered: false,
    timestamp: new Date().toISOString(),
    errors: []
  });

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    // Detect PWA mode
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes('android-app://');

    const displayMode = window.matchMedia('(display-mode: standalone)').matches ? 'standalone' :
                       window.matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' :
                       window.matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' : 'browser';

    addLog(`PWA Mode: ${isPWA ? 'YES' : 'NO'}`);
    addLog(`Display Mode: ${displayMode}`);

    // Check Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        const swStatus = reg ? (reg.active ? 'active' : reg.installing ? 'installing' : 'waiting') : 'none';
        addLog(`Service Worker: ${swStatus}`);
        
        setDebugInfo(prev => ({
          ...prev,
          isPWA,
          isStandalone: isPWA,
          displayMode,
          swStatus,
          swRegistered: !!reg
        }));
      });
    }

    // Monitor errors
    const errorHandler = (event: ErrorEvent) => {
      const errorMsg = `${event.message} (${event.filename}:${event.lineno})`;
      addLog(`ERROR: ${errorMsg}`);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, errorMsg]
      }));
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  const handleResetSW = async () => {
    addLog('Resetting Service Worker...');
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        addLog('SW unregistered');
      }
    }
    window.location.reload();
  };

  const handleClearCache = async () => {
    addLog('Clearing caches...');
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
      addLog(`Cleared ${names.length} caches`);
    }
    localStorage.clear();
    sessionStorage.clear();
    addLog('Cleared storage');
    window.location.reload();
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          PWA Debug
          <Badge variant={debugInfo.isPWA ? "default" : "secondary"}>
            {debugInfo.isPWA ? 'PWA Mode' : 'Browser'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs space-y-1">
          <div>Display: {debugInfo.displayMode}</div>
          <div>SW Status: {debugInfo.swStatus}</div>
          <div>Errors: {debugInfo.errors.length}</div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleResetSW}>
            Reset SW
          </Button>
          <Button size="sm" variant="outline" onClick={handleClearCache}>
            Clear Cache
          </Button>
        </div>

        <div className="mt-2 max-h-48 overflow-y-auto bg-black/5 dark:bg-white/5 p-2 rounded text-xs font-mono">
          {logs.map((log, i) => (
            <div key={i} className="text-xs">{log}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
