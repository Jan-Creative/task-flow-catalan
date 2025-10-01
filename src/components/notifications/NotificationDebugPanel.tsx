import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { Bell, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const NotificationDebugPanel = () => {
  const {
    isSupported,
    canUse,
    permissionStatus,
    isSubscribed,
    subscriptions,
    preferences,
    isInitialized,
    notificationsReady,
    initializeNotifications,
    refreshData
  } = useNotificationContext();

  const [dbStats, setDbStats] = useState({
    preferences: 0,
    subscriptions: 0,
    reminders: 0
  });

  const loadDbStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const [prefsResult, subsResult, remindersResult] = await Promise.all([
        supabase.from('notification_preferences').select('id', { count: 'exact' }).eq('user_id', user.user.id),
        supabase.from('web_push_subscriptions').select('id', { count: 'exact' }).eq('user_id', user.user.id).eq('is_active', true),
        supabase.from('notification_reminders').select('id', { count: 'exact' }).eq('user_id', user.user.id).eq('status', 'pending')
      ]);

      setDbStats({
        preferences: prefsResult.count || 0,
        subscriptions: subsResult.count || 0,
        reminders: remindersResult.count || 0
      });
    } catch (error) {
      console.error('Error loading DB stats:', error);
    }
  };

  useEffect(() => {
    loadDbStats();
  }, [subscriptions, preferences]);

  const StatusBadge = ({ condition, label }: { condition: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {condition ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Debug del Sistema de Notificacions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Browser Support */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Compatibilitat del Navegador</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatusBadge condition={isSupported} label="Web Push Suportat" />
            <StatusBadge condition={canUse} label="Pot Usar Notificacions" />
          </div>
        </div>

        {/* Permission Status */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Estat de Permisos</h3>
          <Badge variant={permissionStatus === 'granted' ? 'default' : 'secondary'}>
            {permissionStatus || 'no sol·licitat'}
          </Badge>
        </div>

        {/* Subscription Status */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Estat de Subscripció</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatusBadge condition={isSubscribed} label="Subscrit Localment" />
            <StatusBadge condition={subscriptions.length > 0} label={`${subscriptions.length} Subscripcions BD`} />
          </div>
        </div>

        {/* System State */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Estat del Sistema</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatusBadge condition={isInitialized} label="Sistema Inicialitzat" />
            <StatusBadge condition={notificationsReady} label="Notificacions Llestes" />
          </div>
        </div>

        {/* Database Stats */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Estadístiques BD</h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-muted rounded">
              <div className="font-semibold">{dbStats.preferences}</div>
              <div className="text-muted-foreground">Preferències</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="font-semibold">{dbStats.subscriptions}</div>
              <div className="text-muted-foreground">Subscripcions</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="font-semibold">{dbStats.reminders}</div>
              <div className="text-muted-foreground">Recordatoris</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          {!isSubscribed && canUse && (
            <Button onClick={initializeNotifications} size="sm" className="flex-1">
              <Bell className="w-4 h-4 mr-2" />
              Activar Notificacions
            </Button>
          )}
          <Button onClick={() => { refreshData(); loadDbStats(); }} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualitzar
          </Button>
        </div>

        {/* Warnings */}
        {!canUse && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-semibold">No es poden activar notificacions</div>
              <div className="text-xs text-muted-foreground mt-1">
                {isSupported ? 'Safari necessita que l\'app estigui installada com a PWA' : 'El teu navegador no suporta Web Push'}
              </div>
            </div>
          </div>
        )}

        {isSubscribed && subscriptions.length === 0 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-semibold">Desincronització detectada</div>
              <div className="text-xs text-muted-foreground mt-1">
                El navegador està subscrit però no hi ha registres a la BD
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
