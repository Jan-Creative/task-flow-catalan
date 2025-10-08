/**
 * PHASE 6: Provider Status Dashboard
 * Visual debug panel for monitoring provider status
 */

import React, { useState, useEffect } from 'react';
import { useProviderStatus } from '@/contexts/ProviderStatusContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Ban, 
  Clock,
  AlertTriangle,
  RefreshCw,
  Activity
} from 'lucide-react';
import { logger } from '@/lib/logger';

export const ProviderStatusDashboard: React.FC = () => {
  const {
    getAllStatuses,
    getMountedProviders,
    getFailedProviders,
    getLoadingProviders,
    getDisabledProviders,
  } = useProviderStatus();

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const allStatuses = getAllStatuses();
  const mounted = getMountedProviders();
  const failed = getFailedProviders();
  const loading = getLoadingProviders();
  const disabled = getDisabledProviders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mounted':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'disabled':
        return <Ban className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      mounted: 'default',
      failed: 'destructive',
      loading: 'secondary',
      disabled: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const handleReload = () => {
    logger.info('ProviderStatusDashboard', 'Reloading application');
    window.location.reload();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Provider Status Monitor
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time monitoring of application providers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReload}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload App
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Mounted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mounted.length}</div>
            <p className="text-xs text-muted-foreground">Providers active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-primary" />
              Loading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading.length}</div>
            <p className="text-xs text-muted-foreground">Providers loading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failed.length}</div>
            <p className="text-xs text-muted-foreground">Providers failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ban className="h-4 w-4 text-muted-foreground" />
              Disabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disabled.length}</div>
            <p className="text-xs text-muted-foreground">Providers disabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Failed Providers Alert */}
      {failed.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {failed.length} provider{failed.length > 1 ? 's' : ''} failed to initialize. 
            Some features may be unavailable. Check details below.
          </AlertDescription>
        </Alert>
      )}

      {/* Provider Details */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Details</CardTitle>
          <CardDescription>
            Status and performance metrics for each provider (Phase 1-4)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allStatuses.map((provider) => (
              <div
                key={provider.name}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(provider.status)}
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Phase {provider.phase}</span>
                      {provider.mountTime && (
                        <>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{provider.mountTime.toFixed(2)}ms</span>
                        </>
                      )}
                    </div>
                    {provider.error && (
                      <p className="text-xs text-destructive mt-1">
                        Error: {provider.error.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(provider.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Update:</span>
              <span>{new Date(lastUpdate).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Providers:</span>
              <span>{allStatuses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Success Rate:</span>
              <span>
                {allStatuses.length > 0 
                  ? `${((mounted.length / allStatuses.length) * 100).toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
