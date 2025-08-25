import { useState } from "react";
import { Bell, Smartphone, Monitor, Tablet, AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { getPlatformType, isSafari, isPWA, requiresPWAForWebPush } from "@/lib/webPushConfig";

export const NotificationSetupCard = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const {
    isSupported,
    permissionStatus,
    isSubscribed,
    isInitialized,
    initializeNotifications,
    subscriptions,
    resetSubscription
  } = useNotificationContext();

  const platform = getPlatformType();
  const safariDetected = isSafari();
  const pwaInstalled = isPWA();
  const needsPWA = requiresPWAForWebPush();

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios-iphone':
        return Smartphone;
      case 'ios-ipad':
        return Tablet;
      case 'macos-safari':
      case 'macos-pwa':
        return Monitor;
      default:
        return Bell;
    }
  };

  const getPlatformTitle = () => {
    switch (platform) {
      case 'ios-iphone':
        return 'iPhone (Safari)';
      case 'ios-ipad':
        return 'iPad (Safari)';
      case 'macos-safari':
        return 'Mac (Safari)';
      case 'macos-pwa':
        return 'Mac (PWA)';
      default:
        return 'Navegador Web';
    }
  };

  const getPlatformMessage = () => {
    switch (platform) {
      case 'ios-iphone':
        return 'Per rebre notificacions a l\'iPhone, cal instal·lar l\'app com a PWA des del menú de Safari.';
      case 'ios-ipad':
        return 'Per rebre notificacions a l\'iPad, cal instal·lar l\'app com a PWA des del menú de Safari.';
      case 'macos-safari':
        return 'Safari al Mac suporta notificacions web directament sense necessitat d\'instal·lar com a PWA.';
      case 'macos-pwa':
        return 'L\'app està instal·lada com a PWA al Mac. Les notificacions haurien de funcionar correctament.';
      default:
        return 'El teu navegador suporta notificacions web.';
    }
  };

  const getSetupSteps = () => {
    switch (platform) {
      case 'ios-iphone':
      case 'ios-ipad':
        if (pwaInstalled) {
          return [
            "✅ L'app ja està instal·lada com a PWA",
            "🔔 Prem 'Activar notificacions' per habilitar-les"
          ];
        }
        return [
          "📱 Prem el botó de compartir a Safari",
          "📲 Selecciona 'Afegir a la pantalla d'inici'",
          "🏠 Obre l'app des de la pantalla d'inici",
          "🔔 Activa les notificacions dins l'app"
        ];
      case 'macos-safari':
        return [
          "🔔 Prem 'Activar notificacions' aquí baix",
          "⚡ Safari demanarà permisos automàticament"
        ];
      case 'macos-pwa':
        return [
          "🔔 Prem 'Activar notificacions' per habilitar-les",
          "⚙️ Si no funciona, revisa les preferències del sistema"
        ];
      default:
        return [
          "🔔 Prem 'Activar notificacions'",
          "✅ Accepta els permisos del navegador"
        ];
    }
  };

  const handleSetupClick = async () => {
    if ((platform === 'ios-iphone' || platform === 'ios-ipad') && !pwaInstalled) {
      setShowInstructions(true);
      return;
    }

    setIsInitializing(true);
    try {
      await initializeNotifications();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const IconComponent = getPlatformIcon();

  // Si les notificacions ja estan actives
  if (isSupported && permissionStatus === 'granted' && isSubscribed && isInitialized) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-800">Notificacions Actives</CardTitle>
              <CardDescription className="text-green-600">
                {getPlatformTitle()} - Tot configurat correctament
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Funcionant
            </Badge>
            <span className="text-sm text-green-700">
              Ja pots crear recordatoris de tasques
            </span>
          </div>
          
          {(subscriptions && subscriptions.length > 1) && (
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-sm text-amber-800">
                {subscriptions.length} subscripcions actives detectades
              </div>
              <Button 
                onClick={resetSubscription}
                variant="outline"
                size="sm"
                className="text-amber-700 border-amber-300"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Netejar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Si no està suportat
  if (!isSupported) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Les notificacions no estan disponibles en aquest navegador.
        </AlertDescription>
      </Alert>
    );
  }

  // Si ha estat denegat
  if (permissionStatus === 'denied') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Les notificacions han estat denegades. Per habilitar-les, cal canviar la configuració del navegador.
        </AlertDescription>
      </Alert>
    );
  }

  // Targeta principal de configuració
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <IconComponent className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-blue-800">
              Configurar Notificacions
            </CardTitle>
            <CardDescription className="text-blue-600">
              {getPlatformTitle()} - {getPlatformMessage()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estat actual */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Plataforma: {platform}
          </Badge>
          {safariDetected && (
            <Badge variant="outline" className="text-xs">
              Safari
            </Badge>
          )}
          {pwaInstalled && (
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
              PWA Instal·lada
            </Badge>
          )}
          {needsPWA && !pwaInstalled && (
            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
              PWA Requerida
            </Badge>
          )}
        </div>

        {/* Instruccions */}
        {showInstructions ? (
          <div className="space-y-3 p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-blue-800">Passos per configurar:</h4>
            <ol className="space-y-2">
              {getSetupSteps().map((step, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="font-medium text-blue-600">{index + 1}.</span>
                  <span>{step.replace(/^[^\s]+\s/, '')}</span>
                </li>
              ))}
            </ol>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowInstructions(false)}
              className="mt-3"
            >
              Amagar instruccions
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-blue-700">
              <strong>Beneficis de les notificacions:</strong>
              <ul className="mt-2 space-y-1 ml-4">
                <li>• Recordatoris automàtics de tasques</li>
                <li>• No et perdràs cap tasca important</li>
                <li>• Funciona fins i tot amb l'app tancada</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleSetupClick}
              className="w-full"
              disabled={permissionStatus === 'denied' as NotificationPermission || isInitializing}
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Configurant...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  {needsPWA && !pwaInstalled ? 'Veure instruccions' : 'Activar notificacions'}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};