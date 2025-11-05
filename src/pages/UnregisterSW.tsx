import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const UnregisterSW = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'none'>('loading');
  const [swCount, setSwCount] = useState(0);
  const [cacheCount, setCacheCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  useEffect(() => {
    unregisterServiceWorkers();
  }, []);

  const unregisterServiceWorkers = async () => {
    try {
      addLog('🔍 Buscant Service Workers...');

      if (!('serviceWorker' in navigator)) {
        addLog('ℹ️ Service Workers no suportats en aquest navegador');
        setStatus('none');
        return;
      }

      // Obtenir tots els Service Workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      setSwCount(registrations.length);
      
      if (registrations.length === 0) {
        addLog('✅ No hi ha Service Workers registrats');
        setStatus('success');
        
        // Netejar cache igualment
        await clearCaches();
        return;
      }

      addLog(`📦 Trobats ${registrations.length} Service Workers`);

      // Desregistrar tots els Service Workers
      for (const reg of registrations) {
        const url = reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || 'unknown';
        addLog(`🗑️ Desregistrant: ${url.split('/').pop()}`);
        await reg.unregister();
        addLog(`✅ Desregistrat: ${url.split('/').pop()}`);
      }

      // Netejar totes les caches
      await clearCaches();

      addLog('✅ Tots els Service Workers desregistrats');
      setStatus('success');

      // Redirigir a la home després de 2 segons
      addLog('🔄 Redirigint a la pàgina principal en 2 segons...');
      setTimeout(() => {
        window.location.href = '/?nosw=1';
      }, 2000);

    } catch (error) {
      console.error('❌ Error desregistrant Service Workers:', error);
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('error');
    }
  };

  const clearCaches = async () => {
    try {
      const cacheNames = await caches.keys();
      setCacheCount(cacheNames.length);
      
      if (cacheNames.length === 0) {
        addLog('ℹ️ No hi ha caches per netejar');
        return;
      }

      addLog(`🗑️ Netejant ${cacheNames.length} caches...`);
      
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        addLog(`✅ Cache netejada: ${cacheName}`);
      }
      
      addLog(`✅ Totes les caches netejades`);
    } catch (error) {
      addLog(`⚠️ Error netejant caches: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const forceReload = () => {
    window.location.href = '/?nosw=1';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-2xl w-full p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            🔧 Service Worker Cleanup
          </h1>
          <p className="text-muted-foreground">
            Desregistrant tots els Service Workers i netejant caches
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-4 p-4 rounded-lg border border-border bg-card">
          {status === 'loading' && (
            <>
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-foreground">Processant...</span>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="text-4xl">✅</div>
              <div>
                <div className="text-foreground font-semibold">Neteja completada!</div>
                <div className="text-sm text-muted-foreground">
                  {swCount} Service Workers i {cacheCount} caches eliminats
                </div>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="text-4xl">❌</div>
              <div>
                <div className="text-destructive font-semibold">Error en la neteja</div>
                <div className="text-sm text-muted-foreground">Revisa els logs</div>
              </div>
            </>
          )}
          {status === 'none' && (
            <>
              <div className="text-4xl">ℹ️</div>
              <div className="text-foreground">
                No hi ha Service Workers per desregistrar
              </div>
            </>
          )}
        </div>

        {/* Logs panel */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Registre d'activitat:</h2>
          <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm space-y-1">
            {logs.length === 0 ? (
              <div className="text-muted-foreground italic">Iniciant...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-foreground">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={forceReload}
            variant="default"
          >
            Anar a la pàgina principal
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Tornar a executar neteja
          </Button>
        </div>

        {/* Info card */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm space-y-2">
          <div className="font-semibold text-foreground">ℹ️ Què fa aquesta pàgina?</div>
          <ul className="text-muted-foreground space-y-1 list-disc list-inside">
            <li>Desregistra tots els Service Workers actius</li>
            <li>Elimina totes les caches del navegador</li>
            <li>Et redirigeix automàticament a la home sense Service Worker (?nosw=1)</li>
            <li>Útil per diagnosticar problemes causats per Service Workers</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default UnregisterSW;
