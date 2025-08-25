
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Bug, Wifi, Bell, Database, Smartphone, RefreshCw, Zap } from 'lucide-react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useServiceWorkerStatus } from '@/hooks/useServiceWorkerStatus';
import { useAuth } from '@/hooks/useAuth';
import { isSafari, isPWA, canUseWebPush, isWebPushSupported, getVapidFingerprint, loadVapidPublicKey, getPlatformType, getPlatformNotificationConfig, isIPad, isMacOS, requiresPWAForWebPush } from '@/lib/webPushConfig';
import { toast } from 'sonner';

export const NotificationDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const { user } = useAuth();
  const { status: swStatus, isReady: swReady } = useServiceWorkerStatus();
  const {
    isSupported,
    canUse,
    permissionStatus,
    isSubscribed,
    preferences,
    subscriptions,
    isInitialized,
    subscription,
    initializeNotifications,
    sendTestNotification,
    resetSubscription,
    refreshData
  } = useNotificationContext();

  const handleReloadVapid = async () => {
    setIsReloading(true);
    try {
      await loadVapidPublicKey();
      toast.success('VAPID key recarregada correctament');
    } catch (error) {
      toast.error('Error recarregant VAPID key');
      console.error('Error reloading VAPID:', error);
    } finally {
      setIsReloading(false);
    }
  };

  const handleTestWithDiagnostics = async () => {
    try {
      const result = await sendTestNotification();
      if (result && typeof result === 'object') {
        setLastTestResult(result);
        // The toast is already shown by sendTestNotification
      }
    } catch (error) {
      console.error('Test error:', error);
      setLastTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sent: 0,
        total: 0
      });
    }
  };

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'bg-green-500' : 'bg-red-500';
    }
    if (status === 'granted') return 'bg-green-500';
    if (status === 'denied') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getStatusText = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'Actiu' : 'Inactiu';
    }
    return status;
  };

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                <div>
                  <CardTitle className="text-lg">Panell de Debug - Notificacions</CardTitle>
                  <CardDescription>
                    Informació tècnica del sistema de notificacions
                  </CardDescription>
                </div>
              </div>
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Estat general */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Navegador compatible</div>
                <Badge variant="outline" className={getStatusColor(isSupported)}>
                  {getStatusText(isSupported)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Pot usar Web Push</div>
                <Badge variant="outline" className={getStatusColor(canUse)}>
                  {getStatusText(canUse)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Permisos</div>
                <Badge variant="outline" className={getStatusColor(permissionStatus)}>
                  {permissionStatus}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Inicialitzat</div>
                <Badge variant="outline" className={getStatusColor(isInitialized)}>
                  {getStatusText(isInitialized)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">VAPID Client</div>
                <Badge variant="outline" className="font-mono text-xs">
                  {getVapidFingerprint() || "No carregat"}
                </Badge>
              </div>
            </div>

            {/* Service Worker */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <h4 className="font-semibold">Service Worker</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Registrat</div>
                  <Badge variant="outline" className={getStatusColor(swStatus.isRegistered)}>
                    {getStatusText(swStatus.isRegistered)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Actiu</div>
                  <Badge variant="outline" className={getStatusColor(swStatus.isActive)}>
                    {getStatusText(swStatus.isActive)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Context del dispositiu */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <h4 className="font-semibold">Context del Dispositiu</h4>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Plataforma</div>
                  <Badge variant="outline" className="text-xs">
                    {getPlatformType()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Safari</div>
                  <Badge variant="outline" className={getStatusColor(isSafari())}>
                    {getStatusText(isSafari())}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">PWA</div>
                  <Badge variant="outline" className={getStatusColor(isPWA())}>
                    {getStatusText(isPWA())}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">iPad</div>
                  <Badge variant="outline" className={getStatusColor(isIPad())}>
                    {getStatusText(isIPad())}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">macOS</div>
                  <Badge variant="outline" className={getStatusColor(isMacOS())}>
                    {getStatusText(isMacOS())}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Requereix PWA</div>
                  <Badge variant="outline" className={getStatusColor(requiresPWAForWebPush())}>
                    {getStatusText(requiresPWAForWebPush())}
                  </Badge>
                </div>
              </div>
              
              {/* Configuració de plataforma */}
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Configuració de notificacions</div>
                <div className="text-xs bg-muted p-3 rounded-lg space-y-1">
                  {(() => {
                    const config = getPlatformNotificationConfig();
                    return (
                      <>
                        <div><strong>Desktop:</strong> {config.isDesktop ? 'Sí' : 'No'}</div>
                        <div><strong>Suporta accions:</strong> {config.supportsActions ? 'Sí' : 'No'}</div>
                        <div><strong>Títol màx:</strong> {config.maxTitleLength} caràcters</div>
                        <div><strong>Cos màx:</strong> {config.maxBodyLength} caràcters</div>
                        <div><strong>TTL recomanat:</strong> {Math.round(config.recommendedTTL / (60 * 60 * 24))} dies</div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Subscripcions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <h4 className="font-semibold">Subscripcions Web Push</h4>
                </div>
                <Badge variant="outline">
                  {subscriptions.length} total
                </Badge>
              </div>
              {subscriptions.length > 0 ? (
                <div className="space-y-2">
                  {subscriptions.map((sub, index) => (
                    <div key={sub.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={sub.is_active ? "default" : "secondary"}>
                          {sub.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                        <div className="text-xs text-muted-foreground text-right">
                          <div>{sub.device_type}</div>
                          {(sub as any).device_os && <div>{(sub as any).device_os}</div>}
                        </div>
                      </div>
                      <div className="text-xs font-mono bg-background p-2 rounded border">
                        {sub.endpoint.substring(0, 80)}...
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                        <div>Creat: {new Date(sub.created_at).toLocaleString()}</div>
                        {(sub as any).user_agent && (
                          <div className="truncate">UA: {(sub as any).user_agent.substring(0, 50)}...</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No hi ha subscripcions guardades
                </div>
              )}
            </div>

            {/* Preferències */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <h4 className="font-semibold">Preferències</h4>
              </div>
              {preferences ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Habilitades</div>
                    <Badge variant="outline" className={getStatusColor(preferences.enabled)}>
                      {getStatusText(preferences.enabled)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Recordatoris de tasques</div>
                    <Badge variant="outline" className={getStatusColor(preferences.task_reminders)}>
                      {getStatusText(preferences.task_reminders)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No hi ha preferències configurades
                </div>
              )}
            </div>

            {/* Informació tècnica */}
            <div className="space-y-3">
              <h4 className="font-semibold">Informació tècnica</h4>
              <div className="space-y-2 text-sm">
                <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                <div><strong>Usuari ID:</strong> {user?.id || 'No autenticat'}</div>
                {subscription && (
                  <div><strong>Endpoint:</strong> {subscription.endpoint.substring(0, 100)}...</div>
                )}
              </div>
            </div>

            {/* Últim resultat de test */}
            {lastTestResult && (
              <div className="space-y-3">
                <h4 className="font-semibold">Últim test de notificació</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Resultat</div>
                      <Badge variant={lastTestResult.success ? "default" : "destructive"}>
                        {lastTestResult.success ? 'Èxit' : 'Error'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Enviats</div>
                      <Badge variant="outline">
                        {lastTestResult.sent}/{lastTestResult.total}
                      </Badge>
                    </div>
                  </div>
                  {lastTestResult.diagnostics && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Diagnòstics del servidor</div>
                      <div className="text-xs space-y-1">
                        <div><strong>VAPID Server:</strong> {lastTestResult.diagnostics.serverVapidFingerprint}</div>
                        <div><strong>VAPID Subject:</strong> {lastTestResult.diagnostics.vapidSubject}</div>
                        <div><strong>Timestamp:</strong> {new Date(lastTestResult.diagnostics.timestamp).toLocaleString()}</div>
                        <div><strong>Keys disponibles:</strong> Public: {lastTestResult.diagnostics.hasVapidKeys.publicKey ? '✅' : '❌'}, Private: {lastTestResult.diagnostics.hasVapidKeys.privateKey ? '✅' : '❌'}</div>
                      </div>
                      
                      {/* Mostrar resultats per plataforma */}
                      {lastTestResult.results && lastTestResult.results.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium mb-2">Resultats per dispositiu</div>
                          <div className="space-y-1">
                            {lastTestResult.results.map((result: any, index: number) => (
                              <div key={index} className="text-xs p-2 bg-background rounded border">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{result.platform}</span>
                                  <Badge variant={result.success ? "default" : "destructive"} className="text-xs">
                                    {result.success ? '✅' : '❌'}
                                  </Badge>
                                </div>
                                {result.success && (
                                  <div className="text-muted-foreground mt-1">
                                    TTL: {result.ttl}s, Payload: {result.payloadLength}b
                                  </div>
                                )}
                                {!result.success && result.error && (
                                  <div className="text-destructive mt-1">
                                    Error: {result.error}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Accions de debug */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button 
                onClick={initializeNotifications} 
                variant="outline" 
                size="sm"
                disabled={!canUse || !user}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reinicialitzar
              </Button>
              <Button 
                onClick={handleReloadVapid} 
                variant="outline" 
                size="sm"
                disabled={isReloading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isReloading ? 'animate-spin' : ''}`} />
                Recarregar VAPID
              </Button>
              <Button 
                onClick={handleTestWithDiagnostics} 
                variant="outline" 
                size="sm"
                disabled={!isInitialized || permissionStatus !== 'granted'}
              >
                <Zap className="h-4 w-4 mr-1" />
                Test amb diagnòstics
              </Button>
              <Button 
                onClick={refreshData} 
                variant="outline" 
                size="sm"
                disabled={!user}
              >
                <Database className="h-4 w-4 mr-1" />
                Actualitzar dades
              </Button>
              <Button 
                onClick={resetSubscription} 
                variant="destructive" 
                size="sm"
                disabled={!user}
              >
                🔄 Reinicialitzar
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
