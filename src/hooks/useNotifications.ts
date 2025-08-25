import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/lib/toastUtils';
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
  supportsDeclarativeWebPush,
  waitForServiceWorkerReady,
  type WebPushSubscription
} from '@/lib/webPushConfig';
import { useServiceWorkerStatus } from './useServiceWorkerStatus';

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
  const { status: swStatus, isReady: swReady } = useServiceWorkerStatus();
  
  // Estats
  const [isSupported, setIsSupported] = useState(false);
  const [canUse, setCanUse] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [subscriptions, setSubscriptions] = useState<WebPushSubscriptionDB[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [supportsDeclarative, setSupportsDeclarative] = useState(false);

  // Verificar compatibilitat al carregar
  useEffect(() => {
    const supported = isWebPushSupported();
    const usable = canUseWebPush();
    const declarative = supportsDeclarativeWebPush();
    
    setIsSupported(supported);
    setCanUse(usable);
    setSupportsDeclarative(declarative);
    
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    
    console.log('🔍 Web Push Support:', { 
      supported, 
      usable, 
      declarative,
      isSafari: isSafari(), 
      isPWA: isPWA(),
      swStatus: swStatus
    });
  }, [swStatus]);

  /**
   * Inicialitzar notificacions amb detecció Apple/Safari optimitzada
   */
  const initializeNotifications = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🚀 Iniciant sistema de notificacions...');
      console.log('📱 Context:', { 
        isSafari: isSafari(), 
        isPWA: isPWA(), 
        canUse, 
        userAgent: navigator.userAgent 
      });

      if (!canUse) {
        const errorMsg = isSafari() && !isPWA() 
          ? 'Safari requereix que l\'app estigui instal·lada com PWA per utilitzar notificacions' 
          : 'Web Push no és compatible amb aquest navegador';
        
        console.warn('⚠️', errorMsg);
        throw new Error(errorMsg);
      }

      // Sol·licitar permisos
      console.log('🔐 Sol·licitant permisos de notificació...');
      const permission = await requestNotificationPermission();
      setPermissionStatus(permission);
      
      if (permission !== 'granted') {
        throw new Error('Permisos de notificació no concedits');
      }
      console.log('✅ Permisos concedits');

      // Registrar service worker amb retry logic
      console.log('🔧 Registrant Service Worker...');
      const registration = await registerServiceWorker();
      console.log('✅ Service Worker registrat i actiu');
      
      // Verificar subscripció existent
      console.log('🔍 Verificant subscripció existent...');
      let pushSubscription = await getExistingSubscription(registration);
      
      if (!pushSubscription) {
        console.log('🆕 Creant nova subscripció Web Push...');
        pushSubscription = await createPushSubscription(registration);
      } else {
        console.log('♻️ Utilitzant subscripció existent');
      }
      
      setSubscription(pushSubscription);
      setIsSubscribed(true);

      // Guardar subscripció a la BD amb millor logging
      if (user && pushSubscription) {
        console.log('💾 Guardant subscripció a la base de dades...');
        const saved = await saveSubscription(pushSubscription);
        if (saved) {
          console.log('✅ Subscripció guardada correctament');
        } else {
          console.error('❌ Error guardant subscripció');
        }
      }

      setIsInitialized(true);
      console.log('🎉 Sistema de notificacions inicialitzat correctament');
      
      toast({
        title: "✅ Notificacions habilitades",
        description: "Les notificacions push estan configurades correctament",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error inicialitzant notificacions:', error);
      
      // Missatges d'error més específics per Safari/iOS
      let errorMessage = 'No s\'han pogut configurar les notificacions';
      
      if (error instanceof Error) {
        if (error.message.includes('Service Worker')) {
          errorMessage = 'Error amb el Service Worker. Assegura\'t que l\'app estigui instal·lada com PWA en Safari.';
        } else if (error.message.includes('push requires')) {
          errorMessage = 'El Service Worker no està actiu. Torna a intentar-ho en uns segons.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  }, [canUse, user, toast]);

  /**
   * Guardar subscripció a la base de dades amb millor control d'errors
   */
  const saveSubscription = useCallback(async (pushSubscription: PushSubscription): Promise<boolean> => {
    if (!user) {
      console.warn('⚠️ No es pot guardar subscripció sense usuari');
      return false;
    }

    try {
      const subscriptionData = formatSubscriptionForDatabase(pushSubscription);
      const deviceInfo = getDeviceInfo();

      console.log('💾 Intentant guardar subscripció:', {
        endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
        deviceType: deviceInfo.deviceType,
        userId: user.id
      });

      const { data, error } = await supabase
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
        })
        .select();

      if (error) {
        console.error('❌ Error BD guardant subscripció:', error);
        throw error;
      }
      
      console.log('✅ Subscripció guardada/actualitzada:', data);
      await loadSubscriptions(); // Recarregar per verificar
      return true;
    } catch (error) {
      console.error('❌ Error guardant subscripció:', error);
      toast({
        title: "⚠️ Advertència",
        description: "No s'ha pogut guardar la subscripció a la BD",
        variant: 'destructive'
      });
      return false;
    }
  }, [user, toast]);

  /**
   * Carregar subscripcions de l'usuari
   */
  const loadSubscriptions = useCallback(async () => {
    if (!user) {
      console.log('⚠️ loadSubscriptions: no user');
      return;
    }

    try {
      console.log('🔍 Carregant subscripcions per usuari:', user.id);
      const { data, error } = await supabase
        .from('web_push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error carregant subscripcions:', error);
        throw error;
      }
      
      console.log('📋 Subscripcions trobades:', data?.length || 0);
      setSubscriptions(data || []);
      
      if (data && data.length > 0) {
        setIsSubscribed(true);
        console.log('✅ Subscripcions actives carregades');
      } else {
        console.log('⚠️ No hi ha subscripcions actives');
      }
    } catch (error) {
      console.error('❌ Error carregant subscripcions:', error);
      setSubscriptions([]);
    }
  }, [user]);

  /**
   * Carregar preferències de l'usuari
   */
  const loadPreferences = useCallback(async () => {
    if (!user) {
      console.log('⚠️ loadPreferences: no user');
      return;
    }

    try {
      console.log('🔍 Carregant preferències per usuari:', user.id);
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error carregant preferències:', error);
        throw error;
      }
      
      console.log('📋 Preferències trobades:', !!data);
      setPreferences(data);
    } catch (error) {
      console.error('❌ Error carregant preferències:', error);
      setPreferences(null);
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
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('notification_reminders')
        .insert({
          user_id: user.id,
          task_id: taskId,
          title,
          message,
          scheduled_at: scheduledAt.toISOString(),
          notification_type: 'task_reminder',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "✅ Recordatori creat",
        description: "El recordatori s'ha programat correctament",
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error creant recordatori:', error);
      toast({
        title: "❌ Error",
        description: "No s'ha pogut crear el recordatori",
        variant: 'destructive'
      });
      return null;
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
   * Enviar notificació de prova amb millor feedback
   */
  const sendTestNotification = useCallback(async () => {
    if (!user) {
      toast({
        title: "❌ Error",
        description: "Has d'estar autenticat per enviar notificacions",
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('🧪 Enviant notificació de prova...');
      
      // Primer verificar que tenim subscripcions locals
      if (subscriptions.length === 0) {
        await loadSubscriptions();
      }

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

      if (error) {
        console.error('❌ Error invocant send-notification:', error);
        throw error;
      }
      
      console.log('📋 Resposta send-notification:', data);
      
      // Verificar la resposta de l'edge function
      if (data?.success === false) {
        if (data.message?.includes('No active subscriptions')) {
          toast({
            title: "⚠️ Sense subscripcions",
            description: "No s'han trobat subscripcions actives. Prova d'inicialitzar les notificacions primer.",
            variant: 'destructive'
          });
        } else {
          toast({
            title: "⚠️ Test fallit",
            description: data.message || "Error desconegut en l'enviament",
            variant: 'destructive'
          });
        }
        return;
      }
      
      const sentCount = data?.sent || 0;
      const totalCount = data?.total || 0;
      
      if (sentCount > 0) {
        toast({
          title: "✅ Prova enviada",
          description: `Notificació enviada correctament a ${sentCount}/${totalCount} dispositius`,
        });
      } else {
        toast({
          title: "⚠️ Sense enviaments",
          description: `No s'ha enviat a cap dels ${totalCount} dispositius registrats`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Error enviant prova:', error);
      toast({
        title: "❌ Error",
        description: "No s'ha pogut enviar la notificació de prova",
        variant: 'destructive'
      });
    }
  }, [user, toast, subscriptions, loadSubscriptions]);

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
  }, [user]);

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
