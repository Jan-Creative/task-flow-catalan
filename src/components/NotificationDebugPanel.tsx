
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Bug, Wifi, Bell, Database, Smartphone } from 'lucide-react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useServiceWorkerStatus } from '@/hooks/useServiceWorkerStatus';
import { useAuth } from '@/hooks/useAuth';
import { isSafari, isPWA, canUseWebPush, isWebPushSupported, getVapidFingerprint } from '@/lib/webPushConfig';

export const NotificationDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    sendTestNotification
  } = useNotificationContext();

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
              <div className="grid grid-cols-2 gap-4">
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
                        <span className="text-xs text-muted-foreground">
                          {sub.device_type}
                        </span>
                      </div>
                      <div className="text-xs font-mono bg-background p-2 rounded border">
                        {sub.endpoint.substring(0, 80)}...
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Creat: {new Date(sub.created_at).toLocaleString()}
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

            {/* Accions de debug */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button 
                onClick={initializeNotifications} 
                variant="outline" 
                size="sm"
                disabled={!canUse || !user}
              >
                Reinicialitzar
              </Button>
              <Button 
                onClick={sendTestNotification} 
                variant="outline" 
                size="sm"
                disabled={!isInitialized || permissionStatus !== 'granted'}
              >
                Enviar prova
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
