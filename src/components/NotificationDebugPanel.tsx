import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { PurgeSubscriptionsButton } from "@/components/PurgeSubscriptionsButton";
import { Bell, TestTube, Trash2, RefreshCcw, AlertCircle, CheckCircle2, Smartphone, Monitor, Tablet } from "lucide-react";

export const NotificationDebugPanel = () => {
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  
  const {
    isSupported,
    canUse,
    permissionStatus,
    isSubscribed,
    isInitialized,
    subscription,
    subscriptions,
    preferences,
    initializeNotifications,
    sendTestNotification,
    resetSubscription,
    refreshData,
    cleanupDuplicateSubscriptions,
    purgeAllSubscriptions,
    getActiveDevices,
    getTotalDevices
  } = useNotificationContext();

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      await sendTestNotification();
    } finally {
      setIsTestingNotification(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetSubscription();
      await refreshData();
    } finally {
      setIsResetting(false);
    }
  };


  const handleCleanupDuplicates = async () => {
    setIsCleaning(true);
    try {
      await cleanupDuplicateSubscriptions();
      await refreshData();
    } finally {
      setIsCleaning(false);
    }
  };

  const getStatusColor = () => {
    if (!isSupported) return "destructive";
    if (!canUse) return "secondary";
    if (permissionStatus === 'denied') return "destructive";
    if (isSubscribed && isInitialized) return "default";
    return "secondary";
  };

  const getStatusText = () => {
    if (!isSupported) return "No suportat";
    if (!canUse) return "No disponible";
    if (permissionStatus === 'denied') return "Denegat";
    if (isSubscribed && isInitialized) return "Actiu";
    return "Inactiu";
  };

  const notificationsReady = isSupported && canUse && permissionStatus === 'granted' && isSubscribed;
  const activeDevices = getActiveDevices();
  const totalDevices = getTotalDevices();
  const hasMultipleDevices = totalDevices > 1;
  const hasInactiveDevices = totalDevices > activeDevices.length;

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'ios':
        return <Smartphone className="h-4 w-4" />;
      case 'macos':
        return <Monitor className="h-4 w-4" />;
      case 'android':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getDeviceName = (deviceInfo: any) => {
    const platform = deviceInfo?.platform || deviceInfo?.deviceType || 'Desconegut';
    const os = deviceInfo?.os || '';
    return `${platform} ${os}`.trim();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <div>
            <CardTitle>Control de Notificacions</CardTitle>
            <CardDescription>
              Panel de control per gestionar les notificacions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estat general */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="font-medium">Estat general:</span>
          <div className="flex items-center gap-2">
            {notificationsReady ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            )}
            <Badge variant={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
        </div>

        {/* Estados técnicos */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span>Suportat:</span>
            <Badge variant={isSupported ? "default" : "destructive"}>
              {isSupported ? "Sí" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Disponible:</span>
            <Badge variant={canUse ? "default" : "secondary"}>
              {canUse ? "Sí" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Permisos:</span>
            <Badge variant={permissionStatus === 'granted' ? "default" : permissionStatus === 'denied' ? "destructive" : "secondary"}>
              {permissionStatus}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Subscrit:</span>
            <Badge variant={isSubscribed ? "default" : "secondary"}>
              {isSubscribed ? "Sí" : "No"}
            </Badge>
          </div>
        </div>

        {/* Dispositius */}
        {totalDevices > 0 && (
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Dispositius registrats:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{activeDevices.length} actius</Badge>
                  <Badge variant="secondary">{totalDevices} total</Badge>
                </div>
              </div>
              
              {hasMultipleDevices && (
                <p className="text-xs text-muted-foreground mb-2">
                  {hasInactiveDevices ? 
                    "Alguns dispositius estan inactius. Recomano fer una neteja." :
                    "Múltiples dispositius actius - perfecte per rebre notificacions a tots."
                  }
                </p>
              )}
            </div>

            {/* Llista de dispositius */}
            <div className="space-y-2">
              {activeDevices.map((device, index) => (
                <div key={device.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(device.device_type)}
                    <span className="text-sm font-medium">
                      {getDeviceName(device.device_info)}
                    </span>
                  </div>
                  <Badge variant="default" className="bg-green-600">Actiu</Badge>
                </div>
              ))}
              
              {hasInactiveDevices && (
                <p className="text-xs text-muted-foreground">
                  + {totalDevices - activeDevices.length} dispositius inactius
                </p>
              )}
            </div>
          </div>
        )}

        {/* Accions */}
        <div className="space-y-2">
          {!notificationsReady ? (
            <Button 
              onClick={initializeNotifications} 
              className="w-full"
              variant="default"
            >
              <Bell className="h-4 w-4 mr-2" />
              Activar Notificacions
            </Button>
          ) : (
            <Button 
              onClick={handleTestNotification}
              disabled={isTestingNotification}
              className="w-full"
              variant="outline"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTestingNotification ? "Enviant..." : "Prova de Notificació"}
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={refreshData}
              variant="outline"
              size="sm"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Actualitzar
            </Button>
            
            <Button 
              onClick={handleReset}
              disabled={isResetting}
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isResetting ? "Reset..." : "Reset"}
            </Button>
          </div>

          {/* Accions avançades */}
          {totalDevices > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">Gestió avançada:</p>
              <div className="grid grid-cols-1 gap-2">
                {hasInactiveDevices && (
                  <Button 
                    onClick={handleCleanupDuplicates}
                    disabled={isCleaning}
                    variant="outline"
                    size="sm"
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {isCleaning ? "Netejant..." : "Netejar inactius"}
                  </Button>
                )}
                
                <PurgeSubscriptionsButton />
              </div>
            </div>
          )}

          {/* Si no hi ha dispositius, mostrar botó de purga com a opció de troubleshooting */}
          {totalDevices === 0 && permissionStatus === 'granted' && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">Troubleshooting:</p>
              <PurgeSubscriptionsButton />
            </div>
          )}
        </div>

        {/* Endpoint info for debugging */}
        {subscription && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              Informació tècnica
            </summary>
            <div className="mt-2 p-2 bg-muted/30 rounded text-xs break-all">
              <div><strong>Endpoint:</strong> {subscription.endpoint.substring(0, 60)}...</div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};