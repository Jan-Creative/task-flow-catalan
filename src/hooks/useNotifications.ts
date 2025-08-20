import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  isWebPushSupported,
  canUseWebPush,
  isSafari,
  isPWA,
  requestNotificationPermission,
  registerServiceWorker,
  createPushSubscription,
  getExistingSubscription,
  formatSubscriptionForDatabase,
  getDeviceInfo,
  type WebPushSubscription
} from '@/lib/webPushConfig';

// Interfaces
interface NotificationReminder {
  id: string;
  title: string;
  message: string;
  scheduled_at: string;
  notification_type: string;
  status: string;
  task_id?: string;
  metadata?: any;
}

interface NotificationPreferences {
  id: string;
  user_id: string;
  enabled: boolean;
  task_reminders: boolean;
  deadline_alerts: boolean;
  custom_notifications: boolean;
  notification_sound: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

interface WebPushSubscriptionDB {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  device_info: any;
  device_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estats
  const [isSupported, setIsSupported] = useState(false);
  const [canUse, setCanUse] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [subscriptions, setSubscriptions] = useState<WebPushSubscriptionDB[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Verificar compatibilitat al carregar
  useEffect(() => {
    const supported = isWebPushSupported();
    const usable = canUseWebPush();
    
    setIsSupported(supported);
    setCanUse(usable);
    
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    
    console.log('🔍 Web Push Support:', { supported, usable, isSafari: isSafari(), isPWA: isPWA() });
  }, []);

  /**
   * Inicialitzar notificacions
   */
  const initializeNotifications = useCallback(async (): Promise<boolean> => {
    try {
      if (!canUse) {
        throw new Error(
          isSafari() && !isPWA() 
            ? 'Safari requereix que l\'app estigui instal·lada com PWA' 
            : 'Web Push no és compatible amb aquest navegador'
        );
      }

      // Sol·licitar permisos
      const permission = await requestNotificationPermission();
      setPermissionStatus(permission);
      
      if (permission !== 'granted') {
        throw new Error('Permisos de notificació no concedits');
      }

      // Registrar service worker
      const registration = await registerServiceWorker();
      
      // Verificar subscripció existent
      let pushSubscription = await getExistingSubscription(registration);
      
      if (!pushSubscription) {
        // Crear nova subscripció
        pushSubscription = await createPushSubscription(registration);
      }
      
      setSubscription(pushSubscription);
      setIsSubscribed(true);

      // Guardar subscripció a la BD
      if (user && pushSubscription) {
        await saveSubscription(pushSubscription);
      }

      setIsInitialized(true);
      
      toast({
        title: "✅ Notificacions habilitades",
        description: "Les notificacions push estan configurades correctament",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error inicialitzant notificacions:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : 'No s\'han pogut configurar les notificacions',
        variant: 'destructive'
      });
      return false;
    }
  }, [canUse, user, toast]);

  /**
   * Guardar subscripció a la base de dades
   */
  const saveSubscription = useCallback(async (pushSubscription: PushSubscription) => {
    if (!user) return;

    try {
      const subscriptionData = formatSubscriptionForDatabase(pushSubscription);
      const deviceInfo = getDeviceInfo();

      const { error } = await supabase
        .from('web_push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh_key: subscriptionData.keys.p256dh,
          auth_key: subscriptionData.keys.auth,
          device_info: deviceInfo,
          device_type: deviceInfo.deviceType,
          is_active: true
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) throw error;
      
      console.log('✅ Subscripció guardada a la BD');
      await loadSubscriptions();
    } catch (error) {
      console.error('❌ Error guardant subscripció:', error);
    }
  }, [user]);

  /**
   * Carregar subscripcions de l'usuari
   */
  const loadSubscriptions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('web_push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('❌ Error carregant subscripcions:', error);
    }
  }, [user]);

  /**
   * Carregar preferències de l'usuari
   */
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('❌ Error carregant preferències:', error);
    }
  }, [user]);

  /**
   * Actualitzar preferències
   */
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updates
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
      
      toast({
        title: "✅ Preferències actualitzades",
        description: "Les teves preferències de notificació s'han guardat",
      });
    } catch (error) {
      console.error('❌ Error actualitzant preferències:', error);
      toast({
        title: "❌ Error",
        description: "No s'han pogut actualitzar les preferències",
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  /**
   * Crear recordatori de tasca
   */
  const createTaskReminder = useCallback(async (
    taskId: string,
    title: string,
    message: string,
    scheduledAt: Date
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_reminders')
        .insert({
          user_id: user.id,
          task_id: taskId,
          title,
          message,
          scheduled_at: scheduledAt.toISOString(),
          notification_type: 'task_reminder',
          status: 'pending'
        });

      if (error) throw error;
      
      toast({
        title: "✅ Recordatori creat",
        description: "El recordatori s'ha programat correctament",
      });
    } catch (error) {
      console.error('❌ Error creant recordatori:', error);
      toast({
        title: "❌ Error",
        description: "No s'ha pogut crear el recordatori",
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  /**
   * Crear notificació personalitzada
   */
  const createCustomNotification = useCallback(async (
    title: string,
    message: string,
    scheduledAt: Date
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_reminders')
        .insert({
          user_id: user.id,
          title,
          message,
          scheduled_at: scheduledAt.toISOString(),
          notification_type: 'custom',
          status: 'pending'
        });

      if (error) throw error;
      
      toast({
        title: "✅ Notificació creada",
        description: "La notificació s'ha programat correctament",
      });
    } catch (error) {
      console.error('❌ Error creant notificació:', error);
      toast({
        title: "❌ Error",
        description: "No s'ha pogut crear la notificació",
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  /**
   * Cancel·lar recordatori
   */
  const cancelReminder = useCallback(async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('notification_reminders')
        .update({ 
          status: 'cancelled',
          metadata: { 
            cancelled_at: new Date().toISOString(),
            cancelled_reason: 'User cancellation'
          }
        })
        .eq('id', reminderId);

      if (error) throw error;
      
      toast({
        title: "✅ Recordatori cancel·lat",
        description: "El recordatori s'ha cancel·lat correctament",
      });
    } catch (error) {
      console.error('❌ Error cancel·lant recordatori:', error);
      toast({
        title: "❌ Error",
        description: "No s'ha pogut cancel·lar el recordatori",
        variant: 'destructive'
      });
    }
  }, [toast]);

  /**
   * Executar processador de recordatoris
   */
  const runRemindersProcessor = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('process-reminders');
      
      if (error) throw error;
      
      console.log('✅ Processador executat:', data);
      toast({
        title: "✅ Processador executat",
        description: `Processats: ${data?.processed || 0}, Enviats: ${data?.sent || 0}`,
      });
    } catch (error) {
      console.error('❌ Error executant processador:', error);
      toast({
        title: "❌ Error",
        description: "No s'ha pogut executar el processador",
        variant: 'destructive'
      });
    }
  }, [toast]);

  /**
   * Enviar notificació de prova
   */
  const sendTestNotification = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          userId: user.id,
          title: 'Prova de notificació',
          body: 'Aquesta és una notificació de prova del sistema Web Push natiu',
          data: {
            type: 'test',
            timestamp: Date.now()
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "✅ Prova enviada",
        description: "La notificació de prova s'ha enviat correctament",
      });
    } catch (error) {
      console.error('❌ Error enviant prova:', error);
      toast({
        title: "❌ Error",
        description: "No s'ha pogut enviar la notificació de prova",
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  /**
   * Refrescar dades
   */
  const refreshData = useCallback(async () => {
    if (user) {
      await Promise.all([
        loadPreferences(),
        loadSubscriptions()
      ]);
    }
  }, [user, loadPreferences, loadSubscriptions]);

  // Carregar dades quan l'usuari canvia
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  return {
    // Estats
    isSupported,
    canUse,
    permissionStatus,
    isSubscribed,
    preferences,
    subscriptions,
    isInitialized,
    subscription,
    
    // Accions
    initializeNotifications,
    updatePreferences,
    createTaskReminder,
    createCustomNotification,
    cancelReminder,
    refreshData,
    runRemindersProcessor,
    sendTestNotification
  };
};

// Export types for external use
export type { NotificationPreferences, NotificationReminder, WebPushSubscriptionDB };