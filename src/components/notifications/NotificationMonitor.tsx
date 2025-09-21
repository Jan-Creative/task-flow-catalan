/**
 * Component de Monitorització del Sistema de Notificacions
 * Dashboard en temps real per debugar i monitoritzar notificacions
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RotateCcw,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { formatDistanceToNow } from 'date-fns';
import { ca } from 'date-fns/locale';

export const NotificationMonitor: React.FC = () => {
  const { 
    state, 
    stats, 
    recentEvents, 
    isHealthy, 
    successRate,
    getQueueContents,
    clearRecentEvents,
    resetStats,
    updateSystemState
  } = useNotificationManager();

  const [showQueue, setShowQueue] = useState(false);
  const queueContents = getQueueContents();

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'queued': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'retry': return <RotateCcw className="h-4 w-4 text-orange-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estat del Sistema
          </CardTitle>
          <CardDescription>
            Monitorització en temps real del gestor de notificacions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Estat</p>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={getStatusColor(isHealthy)}>
                  {isHealthy ? 'Saludable' : 'Problemes'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Cua</p>
              <p className="text-2xl font-bold">{state.queueSize}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Processant</p>
              <p className="text-2xl font-bold">{state.processingCount}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taxa d'èxit</p>
              <div>
                <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
                <Progress value={successRate} className="h-2" />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={updateSystemState}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualitzar
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowQueue(!showQueue)}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                {showQueue ? 'Amagar' : 'Mostrar'} Cua ({queueContents.length})
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Última actualització: {formatDistanceToNow(state.lastUpdate, { locale: ca, addSuffix: true })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estadístiques</CardTitle>
          <CardDescription>Resum d'activitat del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Enviades</span>
              </div>
              <span className="font-bold">{stats.sent}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Fallides</span>
              </div>
              <span className="font-bold">{stats.failed}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">En cua</span>
              </div>
              <span className="font-bold">{stats.queued}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Reintents</span>
              </div>
              <span className="font-bold">{stats.retries}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Cancel·lades</span>
              </div>
              <span className="font-bold">{stats.cancelled}</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={resetStats}>
              <Trash2 className="h-4 w-4 mr-2" />
              Reset estadístiques
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Queue Contents */}
      {showQueue && (
        <Card>
          <CardHeader>
            <CardTitle>Contingut de la Cua</CardTitle>
            <CardDescription>
              Notificacions pendents de processar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queueContents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hi ha notificacions en cua
              </p>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {queueContents.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{item.type}</Badge>
                          <Badge variant="outline">{item.priority}</Badge>
                          {item.retryCount > 0 && (
                            <Badge variant="destructive">Reintent {item.retryCount}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.scheduledAt), { locale: ca, addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Events Recents</CardTitle>
          <CardDescription>
            Històrial d'activitat en temps real
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hi ha events recents
            </p>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {recentEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                    {getStatusIcon(event.type)}
                    <div className="flex-1">
                      <p className="font-medium">{event.payload.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{event.type}</Badge>
                        <span>{event.correlationId}</span>
                        {event.error && (
                          <Badge variant="destructive">{event.error.message}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(event.timestamp, { locale: ca, addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          {recentEvents.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={clearRecentEvents}>
                <Trash2 className="h-4 w-4 mr-2" />
                Netegar historial
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Warnings */}
      {(!isHealthy || state.circuitBreakerOpen) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Avisos del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!state.healthCheck && (
                <p className="text-red-700">⚠️ Problema de connectivitat amb el backend</p>
              )}
              {state.circuitBreakerOpen && (
                <p className="text-red-700">🔴 Circuit breaker activat - massa fallades consecutives</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};