import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

export const EmergencyFallback = () => {
  const handleClearAll = async () => {
    try {
      // Clear caches
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force reload from network
      window.location.href = window.location.origin + '?nocache=' + Date.now();
    } catch (error) {
      console.error('Clear all failed:', error);
      window.location.reload();
    }
  };

  const handleOpenInBrowser = () => {
    window.open(window.location.origin, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            Emergency Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            The application is experiencing issues. Try these recovery options:
          </p>

          <div className="space-y-2">
            <Button 
              onClick={handleClearAll} 
              variant="default" 
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear All Data & Restart
            </Button>

            <Button 
              onClick={handleOpenInBrowser} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Browser
            </Button>

            <Button 
              onClick={() => window.location.reload()} 
              variant="secondary" 
              className="w-full"
            >
              Simple Reload
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>If problems persist:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use "Clear All Data" to reset everything</li>
              <li>Open in browser for normal web access</li>
              <li>Check your internet connection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
