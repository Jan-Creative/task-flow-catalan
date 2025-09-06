/**
 * Offline Indicator Component
 * Shows connection status and sync progress
 */

import React from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { useOfflineContext } from '@/contexts/OfflineContext';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Cloud,
  CloudOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OfflineIndicator = ({ 
  className, 
  showDetails = false,
  size = 'md'
}: OfflineIndicatorProps) => {
  const {
    isOnline,
    isOfflineMode,
    isSyncing,
    lastSyncTime,
    pendingMutations,
    forcSync
  } = useOfflineContext();

  // Determine status and icon
  const getStatus = () => {
    if (isSyncing) {
      return {
        icon: RefreshCw,
        label: 'Sincronitzant...',
        variant: 'secondary' as const,
        color: 'text-blue-500',
        animate: true
      };
    }

    if (!isOnline) {
      return {
        icon: WifiOff,
        label: 'Sense connexió',
        variant: 'destructive' as const,
        color: 'text-red-500',
        animate: false
      };
    }

    if (isOfflineMode) {
      return {
        icon: CloudOff,
        label: 'Mode offline',
        variant: 'outline' as const,
        color: 'text-orange-500',
        animate: false
      };
    }

    if (pendingMutations > 0) {
      return {
        icon: Clock,
        label: `${pendingMutations} canvis pendents`,
        variant: 'secondary' as const,
        color: 'text-yellow-500',
        animate: false
      };
    }

    return {
      icon: CheckCircle,
      label: 'Sincronitzat',
      variant: 'outline' as const,
      color: 'text-green-500',
      animate: false
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  // Format last sync time
  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Mai';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Ara mateix';
    if (diff < 3600000) return `Fa ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Fa ${Math.floor(diff / 3600000)} h`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleSync = async () => {
    if (isOnline && !isSyncing) {
      await forcSync();
    }
  };

  if (!showDetails) {
    // Compact indicator
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={status.variant}
              className={cn(
                'flex items-center gap-1.5 cursor-help',
                size === 'sm' && 'px-2 py-1 text-xs',
                size === 'lg' && 'px-3 py-2 text-sm',
                className
              )}
            >
              <StatusIcon 
                className={cn(
                  'h-3 w-3',
                  status.color,
                  status.animate && 'animate-spin'
                )}
              />
              {size !== 'sm' && status.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{status.label}</p>
              {lastSyncTime && (
                <p className="text-xs text-muted-foreground">
                  Última sync: {formatLastSync(lastSyncTime)}
                </p>
              )}
              {pendingMutations > 0 && (
                <p className="text-xs text-muted-foreground">
                  {pendingMutations} operacions pendents
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed indicator
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg border', className)}>
      <div className="flex items-center gap-2">
        <StatusIcon 
          className={cn(
            'h-4 w-4',
            status.color,
            status.animate && 'animate-spin'
          )}
        />
        <div>
          <p className="text-sm font-medium">{status.label}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {lastSyncTime && (
              <span>Última sync: {formatLastSync(lastSyncTime)}</span>
            )}
            {pendingMutations > 0 && (
              <span>• {pendingMutations} pendents</span>
            )}
          </div>
        </div>
      </div>

      {isOnline && pendingMutations > 0 && !isSyncing && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          className="ml-auto"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Sincronitzar
        </Button>
      )}
    </div>
  );
};

// Connection status indicator for header/navigation
export const ConnectionStatus = () => {
  const { isOnline, isOfflineMode } = useOfflineContext();

  if (isOnline && !isOfflineMode) {
    return (
      <div className="flex items-center gap-1 text-green-500">
        <Wifi className="h-3 w-3" />
        <span className="text-xs">Online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-red-500">
      <WifiOff className="h-3 w-3" />
      <span className="text-xs">Offline</span>
    </div>
  );
};

// Sync progress indicator for data operations
export const SyncProgress = () => {
  const { isSyncing, pendingMutations } = useOfflineContext();

  if (!isSyncing && pendingMutations === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isSyncing && (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span>Sincronitzant...</span>
        </>
      )}
      {!isSyncing && pendingMutations > 0 && (
        <>
          <Clock className="h-3 w-3" />
          <span>{pendingMutations} canvis pendents</span>
        </>
      )}
    </div>
  );
};