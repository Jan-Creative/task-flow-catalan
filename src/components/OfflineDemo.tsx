/**
 * Offline Demo Component
 * Demonstrates offline functionality with indicators and controls
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OfflineIndicator, ConnectionStatus, SyncProgress } from '@/components/ui/offline-indicator';
import { useOfflineContext } from '@/contexts/OfflineContext';
import { useOfflineTasks } from '@/hooks/useOfflineTasks';
import { 
  Cloud, 
  CloudOff, 
  Plus, 
  RefreshCw, 
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';

export const OfflineDemo = () => {
  const {
    isOnline,
    isOfflineMode,
    isSyncing,
    pendingMutations,
    enableOfflineMode,
    disableOfflineMode,
    forcSync,
    clearMutations
  } = useOfflineContext();

  const {
    tasks,
    createTask,
    updateTaskStatus,
    taskStats,
    isOfflineMode: usingOfflineData,
    lastUpdated
  } = useOfflineTasks();

  const handleCreateTestTask = async () => {
    try {
      await createTask({
        title: `Tasca offline ${new Date().toLocaleTimeString()}`,
        description: 'Aquesta tasca s\'ha creat en mode offline',
        status: 'pendent',
        priority: 'mitjana'
      });
    } catch (error) {
      console.error('Error creating test task:', error);
    }
  };

  const handleToggleFirstTask = async () => {
    const firstTask = tasks[0];
    if (firstTask) {
      const newStatus = firstTask.status === 'completat' ? 'pendent' : 'completat';
      try {
        await updateTaskStatus(firstTask.id, newStatus);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Sistema Offline Demo</h2>
        <p className="text-muted-foreground">
          Prova la funcionalitat offline de l'aplicació
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connection Status */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connexió</CardTitle>
            {isOnline ? (
              <Wifi className="h-4 w-4 ml-auto text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 ml-auto text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOnline ? 'Connectat al servidor' : 'Sense connexió'}
            </p>
            <div className="mt-2">
              <ConnectionStatus />
            </div>
          </CardContent>
        </Card>

        {/* Data Mode */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mode de Dades</CardTitle>
            {usingOfflineData ? (
              <Database className="h-4 w-4 ml-auto text-orange-500" />
            ) : (
              <Cloud className="h-4 w-4 ml-auto text-blue-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usingOfflineData ? 'Local' : 'Servidor'}
            </div>
            <p className="text-xs text-muted-foreground">
              {usingOfflineData ? 'Dades locals (IndexedDB)' : 'Dades del servidor'}
            </p>
          </CardContent>
        </Card>

        {/* Sync Status */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sincronització</CardTitle>
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 ml-auto animate-spin text-blue-500" />
            ) : (
              <RefreshCw className="h-4 w-4 ml-auto text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMutations}</div>
            <p className="text-xs text-muted-foreground">
              Operacions pendents
            </p>
            <div className="mt-2">
              <SyncProgress />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offline Indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Indicador d'Estat</CardTitle>
          <CardDescription>
            Indicador visual de l'estat de connexió i sincronització
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm">Compacte:</span>
            <OfflineIndicator size="sm" />
            <OfflineIndicator size="md" />
            <OfflineIndicator size="lg" />
          </div>
          <div>
            <span className="text-sm">Detallat:</span>
            <OfflineIndicator showDetails className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Controls de Test</CardTitle>
          <CardDescription>
            Prova les funcionalitats offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              onClick={enableOfflineMode}
              disabled={isOfflineMode}
              className="flex items-center gap-2"
            >
              <CloudOff className="h-4 w-4" />
              Mode Offline
            </Button>
            
            <Button
              variant="outline"
              onClick={disableOfflineMode}
              disabled={!isOfflineMode || !isOnline}
              className="flex items-center gap-2"
            >
              <Cloud className="h-4 w-4" />
              Mode Online
            </Button>
            
            <Button
              onClick={handleCreateTestTask}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear Tasca
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleToggleFirstTask}
              disabled={tasks.length === 0}
              className="flex items-center gap-2"
            >
              Canviar Estat
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={forcSync}
              disabled={!isOnline || isSyncing || pendingMutations === 0}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Forçar Sync
            </Button>
            
            <Button
              variant="destructive"
              onClick={clearMutations}
              disabled={pendingMutations === 0}
              className="flex items-center gap-2"
            >
              Netejar Cua
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estadístiques de Tasques</CardTitle>
          <CardDescription>
            Resum de les tasques disponibles {usingOfflineData ? '(offline)' : '(online)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{taskStats.completades}</div>
              <p className="text-xs text-muted-foreground">Completades</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{taskStats.enProces}</div>
              <p className="text-xs text-muted-foreground">En Procés</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{taskStats.pendents}</div>
              <p className="text-xs text-muted-foreground">Pendents</p>
            </div>
          </div>
          
          {usingOfflineData && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Utilitzant dades locals
                </span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Última actualització: {new Date(lastUpdated).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tasks Preview */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tasques Recents</CardTitle>
            <CardDescription>
              Últimes {Math.min(5, tasks.length)} tasques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.description || 'Sense descripció'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      task.status === 'completat' ? 'default' :
                      task.status === 'en_proces' ? 'secondary' : 'outline'
                    }>
                      {task.status}
                    </Badge>
                    {task.id.startsWith('temp_') && (
                      <Badge variant="secondary" className="text-xs">
                        Temporal
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};