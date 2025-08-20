import React from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { useServiceWorkerStatus } from '@/hooks/useServiceWorkerStatus';
import { Loader2, CheckCircle, Clock, AlertTriangle, RotateCcw } from 'lucide-react';

interface ServiceWorkerStatusProps {
  showDetails?: boolean;
  onForceUpdate?: () => void;
}

export const ServiceWorkerStatus: React.FC<ServiceWorkerStatusProps> = ({ 
  showDetails = false,
  onForceUpdate
}) => {
  const { status, forceUpdate, isReady } = useServiceWorkerStatus();

  if (!showDetails && isReady) {
    return null; // No mostrar res si tot va bé i no volem detalls
  }

  const getStatusBadge = () => {
    if (status.error) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Error SW
        </Badge>
      );
    }

    if (!status.isRegistered) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          No registrat
        </Badge>
      );
    }

    if (status.isInstalling) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Instal·lant
        </Badge>
      );
    }

    if (status.isWaiting) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Esperant
        </Badge>
      );
    }

    if (status.isActive) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Actiu
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Iniciant
      </Badge>
    );
  };

  const handleForceUpdate = () => {
    forceUpdate();
    onForceUpdate?.();
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge()}
      
      {showDetails && (
        <div className="text-xs text-muted-foreground">
          {status.isActive ? 'SW operatiu' : 'SW inicialitzant...'}
        </div>
      )}
      
      {(status.isWaiting || status.error) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForceUpdate}
          className="h-6 px-2"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};