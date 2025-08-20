import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Download, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { getUsageRecommendation, isPWA, isSafari } from '@/lib/webPushConfig';

interface PWAInstallPromptProps {
  onInstallComplete?: () => void;
}

export const PWAInstallPrompt = ({ onInstallComplete }: PWAInstallPromptProps) => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isAlreadyPWA, setIsAlreadyPWA] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Verificar estat actual
    setIsAlreadyPWA(isPWA());
    setRecommendation(getUsageRecommendation());

    // Listener per prompt d'instal·lació automàtic (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('💡 PWA install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome/Edge: usar prompt automàtic
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ PWA instal·lada amb èxit');
        setDeferredPrompt(null);
        onInstallComplete?.();
      }
    } else if (isSafari()) {
      // Safari: mostrar instruccions manuals
      setShowInstructions(true);
    } else {
      // Altres navegadors: instruccions generals
      setShowInstructions(true);
    }
  };

  if (isAlreadyPWA) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Perfect!</strong> L'app ja està instal·lada com PWA. Les notificacions push estan disponibles.
        </AlertDescription>
      </Alert>
    );
  }

  if (!recommendation) return null;

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Smartphone className="h-5 w-5" />
          Instal·la com App
          <Badge variant="outline" className="text-xs">
            {isSafari() ? 'Safari' : 'PWA'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          {recommendation.message}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {recommendation.type === 'warning' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Per rebre notificacions push en Safari, cal instal·lar l'app a la pantalla d'inici.
            </AlertDescription>
          </Alert>
        )}

        {!showInstructions ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleInstallClick}
              className="flex-1"
              variant={recommendation.type === 'success' ? 'default' : 'outline'}
            >
              <Download className="h-4 w-4 mr-2" />
              {deferredPrompt ? 'Instal·la ara' : 'Mostra instruccions'}
            </Button>
            
            {recommendation.type === 'warning' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowInstructions(true)}
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-amber-800 dark:text-amber-200">
                Instruccions d'instal·lació
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowInstructions(false)}
              >
                Oculta
              </Button>
            </div>
            
            {isSafari() ? (
              <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium">Per Safari (iOS/macOS):</p>
                <ol className="space-y-1 list-decimal list-inside pl-2">
                  <li>Toca el botó de <strong>Compartir</strong> (quadrat amb fletxa)</li>
                  <li>Desplaça't avall i toca <strong>"Afegir a la pantalla d'inici"</strong></li>
                  <li>Toca <strong>"Afegir"</strong> per confirmar</li>
                  <li>L'app apareixerà a la pantalla d'inici</li>
                  <li><strong>Obra l'app des de la pantalla d'inici</strong> per activar PWA</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium">Per Chrome/Edge/Firefox:</p>
                <ol className="space-y-1 list-decimal list-inside pl-2">
                  <li>Cerca la icona <strong>"Instal·la"</strong> a la barra d'adreces</li>
                  <li>O usa el menú del navegador → <strong>"Instal·la app"</strong></li>
                  <li>Confirma la instal·lació</li>
                  <li>L'app s'obrirà com a aplicació independent</li>
                </ol>
              </div>
            )}
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Després d'instal·lar, recarrega aquesta pàgina per activar les notificacions.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Informació adicional sobre beneficis */}
        <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
          <h5 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
            Beneficis de la PWA:
          </h5>
          <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <li>• Notificacions push natives</li>
            <li>• Funciona sense connexió</li>
            <li>• Experiència d'app nativa</li>
            <li>• Accés ràpid des de la pantalla d'inici</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};