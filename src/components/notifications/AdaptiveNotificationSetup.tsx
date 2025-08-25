import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Bell,
  Settings,
  Wifi
} from 'lucide-react';
import { 
  getPlatformType, 
  isPWA, 
  isSafari, 
  requiresPWAForWebPush,
  getPlatformNotificationConfig
} from '@/lib/webPushConfig';
import { useNotificationContext } from '@/contexts/NotificationContext';

interface AdaptiveNotificationSetupProps {
  onSetupComplete?: () => void;
  compact?: boolean;
}

export const AdaptiveNotificationSetup = ({ onSetupComplete, compact = false }: AdaptiveNotificationSetupProps) => {
  const [platform, setPlatform] = useState<string>('web');
  const [showInstructions, setShowInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const { 
    isSupported, 
    permissionStatus, 
    isSubscribed, 
    initializeNotifications 
  } = useNotificationContext();

  useEffect(() => {
    setPlatform(getPlatformType());

    // Listener per prompt d'instal·lació automàtic
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios-iphone':
        return <Smartphone className="h-5 w-5" />;
      case 'ios-ipad':
        return <Tablet className="h-5 w-5" />;
      case 'macos-safari':
      case 'macos-pwa':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPlatformTitle = () => {
    switch (platform) {
      case 'ios-iphone':
        return 'Notificacions iPhone';
      case 'ios-ipad':
        return 'Notificacions iPad';
      case 'macos-safari':
        return 'Notificacions macOS Safari';
      case 'macos-pwa':
        return 'Notificacions macOS';
      default:
        return 'Notificacions Web';
    }
  };

  const getPlatformMessage = () => {
    const config = getPlatformNotificationConfig();
    
    switch (platform) {
      case 'ios-iphone':
        return isPWA() 
          ? 'Perfect! L\'iPhone amb PWA suporta notificacions push natives.'
          : 'Per rebre notificacions a l\'iPhone, cal instal·lar l\'app a la pantalla d\'inici.';
      
      case 'ios-ipad':
        return isPWA()
          ? 'Excellent! L\'iPad amb PWA permet notificacions push optimitzades per pantalla gran.'
          : 'Per aprofitar les notificacions a l\'iPad, instal·la l\'app com PWA per una experiència desktop.';
      
      case 'macos-safari':
        return 'Safari a macOS suporta notificacions web directament, sense necessitat d\'instal·lar PWA.';
      
      case 'macos-pwa':
        return 'PWA a macOS ofereix la millor experiència amb notificacions natives i funcionalitat offline.';
      
      default:
        return 'Configura les notificacions per mantenir-te al dia amb les teves tasques.';
    }
  };

  const getSetupSteps = () => {
    switch (platform) {
      case 'ios-iphone':
        return isPWA() ? [
          'Toca "Permitir notificacions" quan aparegui el diàleg',
          'Les notificacions apareixeran com missatges d\'iPhone natius',
          'Pots gestionar-les des de Configuració > Notificacions'
        ] : [
          'Toca el botó Compartir (quadrat amb fletxa)',
          'Selecciona "Afegir a la pantalla d\'inici"',
          'Obre l\'app des de la pantalla d\'inici',
          'Activa les notificacions quan se t\'ofereixi'
        ];
      
      case 'ios-ipad':
        return isPWA() ? [
          'Activa les notificacions des del diàleg del navegador',
          'Les notificacions apareixeran com banners d\'iPadOS',
          'Perfecte per productivitat amb pantalla gran'
        ] : [
          'Toca Compartir i "Afegir a la pantalla d\'inici"',
          'L\'app oferirà experiència similar a desktop',
          'Idealment, obre des d\'Split View o Stage Manager'
        ];
      
      case 'macos-safari':
        return [
          'Safari mostrarà un diàleg de permisos automàticament',
          'Les notificacions apareixeran com banners de macOS',
          'No cal instal·lar PWA - funciona directament al navegador'
        ];
      
      case 'macos-pwa':
        return [
          'Perfecte! PWA a macOS ofereix experiència nativa',
          'Notificacions integrades amb el Centre de Notificacions',
          'Funciona offline i amb accesos directes de teclat'
        ];
      
      default:
        return [
          'Clica "Permitir" quan aparegui el diàleg de permisos',
          'Les notificacions apareixeran segons el teu navegador',
          'Pots gestionar-les des de la configuració del navegador'
        ];
    }
  };

  const handleSetupClick = async () => {
    if (requiresPWAForWebPush() && !isPWA()) {
      // Dispositius iOS necessiten PWA primer
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } else {
        setShowInstructions(true);
      }
    } else {
      // Dispositius que suporten notificacions directament
      try {
        await initializeNotifications();
        onSetupComplete?.();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    }
  };

  // Si ja està tot configurat
  if (isSupported && permissionStatus === 'granted' && isSubscribed) {
    return compact ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Notificacions actives
      </Badge>
    ) : (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Perfect!</strong> Les notificacions estan configurades i actives per {getPlatformTitle().toLowerCase()}.
        </AlertDescription>
      </Alert>
    );
  }

  // Si no està suportat
  if (!isSupported) {
    return compact ? (
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        No suportat
      </Badge>
    ) : (
      <Alert className="border-gray-200 bg-gray-50">
        <AlertCircle className="h-4 w-4 text-gray-600" />
        <AlertDescription>
          Aquest dispositiu o navegador no suporta notificacions push.
        </AlertDescription>
      </Alert>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Bell className="h-3 w-3 mr-1" />
          Setup necessari
        </Badge>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSetupClick}
          className="h-6 px-2 text-xs"
        >
          Configura
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          {getPlatformIcon()}
          {getPlatformTitle()}
          <Badge variant="outline" className="text-xs">
            {platform.includes('ios') ? 'iOS' : platform.includes('macos') ? 'macOS' : 'Web'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          {getPlatformMessage()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {permissionStatus === 'denied' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Les notificacions estan bloquejades. Pots desbloquejar-les des de la configuració del navegador.
            </AlertDescription>
          </Alert>
        )}

        {!showInstructions ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleSetupClick}
              className="flex-1"
              disabled={permissionStatus === 'denied'}
            >
              {requiresPWAForWebPush() && !isPWA() ? (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {deferredPrompt ? 'Instal·la app' : 'Mostra instruccions'}
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Activar notificacions
                </>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowInstructions(true)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">
                {requiresPWAForWebPush() && !isPWA() ? 'Instruccions d\'instal·lació' : 'Instruccions de configuració'}
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowInstructions(false)}
              >
                Oculta
              </Button>
            </div>
            
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <ol className="space-y-1 list-decimal list-inside pl-2">
                {getSetupSteps().map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {requiresPWAForWebPush() && !isPWA() 
                  ? 'Després d\'instal·lar, recarrega per activar les notificacions.'
                  : 'Un cop activades, podràs crear recordatoris per les teves tasques.'
                }
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Beneficis específics per plataforma */}
        <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
          <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            {platform.includes('ios') ? 'Beneficis iOS:' : platform.includes('macos') ? 'Beneficis macOS:' : 'Beneficis:'}
          </h5>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            {platform === 'ios-iphone' && [
              '• Notificacions natives d\'iPhone',
              '• Integració amb Lock Screen',
              '• Funciona en segon pla',
              '• Sincronització amb altres dispositius Apple'
            ]}
            {platform === 'ios-ipad' && [
              '• Notificacions optimitzades per pantalla gran',
              '• Compatible amb multitasking d\'iPadOS',
              '• Perfecte per productivitat',
              '• Funciona amb Stage Manager'
            ]}
            {(platform === 'macos-safari' || platform === 'macos-pwa') && [
              '• Integració amb Centre de Notificacions',
              '• Compatible amb Focus modes',
              '• Notificacions persistents a desktop',
              '• Accesos directes de teclat'
            ]}
            {!platform.includes('ios') && !platform.includes('macos') && [
              '• Notificacions push natives',
              '• Funciona sense connexió',
              '• Experiència d\'app nativa',
              '• Accés ràpid des del navegador'
            ]}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};