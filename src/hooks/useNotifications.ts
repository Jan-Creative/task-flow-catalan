import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/lib/toastUtils';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
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

  // Verificar compatibilitat al carregar + detecció de subscripcions existents
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
    
    // Verificar si existeix subscripció activa (per detectar estats inconsistents)
    if (user && supported && usable) {
      checkExistingSubscription();
    }
    
    logger.debug('useNotifications', 'Web Push Support', { 
      supported, 
      usable, 
      declarative,
      isSafari: isSafari(), 
      isPWA: isPWA(),
      swStatus: swStatus
    });
  }, [swStatus, user]);

  /**
   * Verificar si hi ha subscripció activa
   */
  const checkExistingSubscription = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) {
            logger.info('useNotifications', 'Existing Web Push subscription detected');
            setSubscription(existingSubscription);
            setIsSubscribed(true);
            
            // Forçar permisos com 'granted' si tenim subscripció
            if (Notification.permission === 'granted') {
              setPermissionStatus('granted');
              setIsInitialized(true);
            }
          }
        }
      }
    } catch (error) {
      logger.error('useNotifications', 'Error checking existing subscription', error);
    }
  }, []);

  /**
   * Carregar subscripcions de l'usuari
   */
  const loadSubscriptions = useCallback(async () => {
    if (!user) {
      logger.debug('useNotifications', 'loadSubscriptions: no user');
      return;
    }

    try {
      logger.debug('useNotifications', 'Loading subscriptions for user', { userId: user.id });
      const { data, error } = await supabase
        .from('web_push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        logger.error('useNotifications', 'Error loading subscriptions', error);
        throw error;
      }
      
      logger.debug('useNotifications', 'Subscriptions loaded', { count: data?.length || 0 });
      setSubscriptions(data || []);
      
      if (data && data.length > 0) {
        setIsSubscribed(true);
        logger.info('useNotifications', 'Active subscriptions loaded');
      } else {
        logger.debug('useNotifications', 'No active subscriptions found');
      }
    } catch (error) {
      logger.error('useNotifications', 'Error loading subscriptions', error);
      setSubscriptions([]);
    }
  }, [user]);

  /**
   * Carregar preferències de l'usuari
   */
  const loadPreferences = useCallback(async () => {
    if (!user) {
      logger.debug('useNotifications', 'loadPreferences: no user');
      return;
    }

    try {
      logger.debug('useNotifications', 'Loading preferences for user', { userId: user.id });
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('useNotifications', 'Error loading preferences', error);
        throw error;
      }
      
      logger.debug('useNotifications', 'Preferences loaded', { hasPreferences: !!data });
      setPreferences(data);
    } catch (error) {
      logger.error('useNotifications', 'Error loading preferences', error);
      setPreferences(null);
    }
  }, [user]);

  // Carregar dades quan l'usuari canvia
  useEffect(() => {
    if (user) {
      loadPreferences();
      loadSubscriptions();
    }
  }, [user, loadPreferences, loadSubscriptions]);

  /**
   * Inicialitzar notificacions amb detecció Apple/Safari optimitzada
   */
  const initializeNotifications = useCallback(async (): Promise<boolean> => {
    try {
      logger.info('useNotifications', 'Initializing notifications system', { 
        isSafari: isSafari(), 
        isPWA: isPWA(), 
        canUse, 
        userAgent: navigator.userAgent 
      });

      if (!canUse) {
        const errorMsg = isSafari() && !isPWA() 
          ? 'Safari requereix que l\'app estigui instal·lada com PWA per utilitzar notificacions' 
          : 'Web Push no és compatible amb aquest navegador';
        
        logger.warn('useNotifications', errorMsg);
        throw new Error(errorMsg);
      }

      // Sol·licitar permisos
      logger.debug('useNotifications', 'Requesting notification permission');
      const permission = await requestNotificationPermission();
      setPermissionStatus(permission);
      
      if (permission !== 'granted') {
        throw new Error('Permisos de notificació no concedits');
      }
      logger.info('useNotifications', 'Notification permission granted');

      // Registrar service worker amb retry logic
      logger.debug('useNotifications', 'Registering Service Worker');
      const registration = await registerServiceWorker();
      logger.info('useNotifications', 'Service Worker registered and active');
      
      // Verificar subscripció existent
      logger.debug('useNotifications', 'Checking existing subscription');
      let pushSubscription = await getExistingSubscription(registration);
      
      if (!pushSubscription) {
        logger.info('useNotifications', 'Creating new Web Push subscription');
        pushSubscription = await createPushSubscription(registration);
      } else {
        logger.info('useNotifications', 'Using existing subscription');
      }
      
      setSubscription(pushSubscription);
      setIsSubscribed(true);

      // Guardar subscripció a la BD amb millor logging
      if (user && pushSubscription) {
        logger.debug('useNotifications', 'Saving subscription to database');
        const saved = await saveSubscription(pushSubscription);
        if (saved) {
          logger.info('useNotifications', 'Subscription saved successfully');
        } else {
          logger.error('useNotifications', 'Failed to save subscription');
        }
      }

      setIsInitialized(true);
      logger.info('useNotifications', 'Notifications system initialized successfully');
      
      toast({
        title: "✅ Notificacions habilitades",
        description: "Les notificacions push estan configurades correctament",
      });
      
      return true;
    } catch (error) {
      logger.error('useNotifications', 'Error initializing notifications', error);
      
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
  }, [canUse, user, toast, loadSubscriptions]);

  /**
   * Guardar subscripció a la base de dades amb millor control d'errors
   */
  const saveSubscription = useCallback(async (pushSubscription: PushSubscription): Promise<boolean> => {
    if (!user) {
      logger.warn('useNotifications', 'Cannot save subscription without user');
      return false;
    }

    try {
      const subscriptionData = formatSubscriptionForDatabase(pushSubscription);
      const deviceInfo = getDeviceInfo();

      logger.debug('useNotifications', 'Attempting to save subscription', {
        endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
        deviceType: deviceInfo.deviceType,
        userId: user.id
      });

      // Create unique device fingerprint to prevent duplicates
      const deviceFingerprint = `${deviceInfo.deviceType}-${deviceInfo.platform}-${deviceInfo.userAgent.substring(0, 50)}`;

      // First, deactivate any existing subscriptions for this specific device
      await supabase
        .from('web_push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('device_type', deviceInfo.deviceType)
        .like('device_info->>userAgent', `${deviceInfo.userAgent.substring(0, 50)}%`);

      // Insert new subscription for this device
      const { data, error } = await supabase
        .from('web_push_subscriptions')
        .insert([{
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          auth_key: subscriptionData.keys.auth,
          p256dh_key: subscriptionData.keys.p256dh,
          device_type: deviceInfo.deviceType,
          device_info: {
            ...deviceInfo,
            deviceFingerprint,
            subscriptionDate: new Date().toISOString()
          },
          is_active: true
        }])
        .select();

      if (error) {
        logger.error('useNotifications', 'Database error saving subscription', error);
        throw error;
      }
      
      logger.info('useNotifications', 'Subscription saved with unique identifier', { deviceFingerprint });
      await loadSubscriptions(); // Recarregar per verificar
      return true;
    } catch (error) {
      logger.error('useNotifications', 'Error saving subscription', error);
      toast({
        title: "⚠️ Advertència",
        description: "No s'ha pogut guardar la subscripció a la BD",
        variant: 'destructive'
      });
      return false;
    }
  }, [user, toast, loadSubscriptions]);


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
      logger.error('useNotifications', 'Error creating reminder', error);
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
    scheduledAt: Date,
    metadata?: { block_id?: string; notification_type?: string }
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
          notification_type: metadata?.notification_type || 'custom',
          block_id: metadata?.block_id || null,
          status: 'pending',
          metadata: metadata || {}
        });

      if (error) throw error;
      
      toast({
        title: "✅ Notificació creada",
        description: "La notificació s'ha programat correctament",
      });
    } catch (error) {
      logger.error('useNotifications', 'Error creating custom notification', error);
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
      logger.error('useNotifications', 'Error cancelling reminder', error);
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
      
      logger.info('useNotifications', 'Reminders processor executed', data);
      toast({
        title: "✅ Processador executat",
        description: `Processats: ${data?.processed || 0}, Enviats: ${data?.sent || 0}`,
      });
    } catch (error) {
      logger.error('useNotifications', 'Error executing reminders processor', error);
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
      return null;
    }

    try {
      logger.debug('useNotifications', 'Sending test notification');
      
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
        logger.error('useNotifications', 'Error invoking send-notification', error);
        throw error;
      }
      
      logger.debug('useNotifications', 'send-notification response', data);
      
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
        return data; // Return data even if test failed for diagnostics
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
      
      return data; // Return response data for diagnostics
    } catch (error) {
      logger.error('useNotifications', 'Error sending test notification', error);
      toast({
        title: "❌ Error",
        description: "No s'ha pogut enviar la notificació de prova",
        variant: 'destructive'
      });
      throw error; // Re-throw to allow debug panel to handle it
    }
  }, [user, toast, subscriptions, loadSubscriptions]);

  /**
   * Reinicialitzar subscripcions completament
   */
  const resetSubscription = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      toast({
        title: "❌ Error",
        description: "Has d'estar autenticat per reinicialitzar les subscripcions",
        variant: 'destructive'
      });
      return;
    }

    try {
      logger.info('useNotifications', 'Resetting subscriptions');
      
      // 1. Desactivar totes les subscripcions existents
      await supabase
        .from('web_push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // 2. Reset local state first
      setSubscriptions([]);
      setIsSubscribed(false);
      setIsInitialized(false);
      setSubscription(null);
      
      // 3. Reinicialitzar només si necessari
      // await initializeNotifications();
      
      // 4. Recarregar dades
      await refreshData();
      
      toast({
        title: "✅ Subscripcions reinicialitzades",
        description: "Les subscripcions s'han reinicialitzat correctament",
      });
    } catch (error: any) {
      logger.error('useNotifications', 'Error resetting subscriptions', error);
      toast({
        title: "❌ Error",
        description: "Error reinicialitzant les subscripcions",
        variant: 'destructive'
      });
      throw error;
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

  /**
   * Netejar subscripcions duplicades
   */
  const cleanupDuplicateSubscriptions = useCallback(async () => {
    if (!user) return;
    
    try {
      logger.info('useNotifications', 'Cleaning duplicate subscriptions');
      
      // Mantenir només la subscripció més recent
      const { error } = await supabase
        .from('web_push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .not('id', 'in', `(
          SELECT id FROM web_push_subscriptions 
          WHERE user_id = '${user.id}' 
          ORDER BY updated_at DESC 
          LIMIT 1
        )`);

      if (error) throw error;

      await loadSubscriptions();
      logger.info('useNotifications', 'Subscriptions cleaned');
    } catch (error) {
      logger.error('useNotifications', 'Error cleaning duplicate subscriptions', error);
    }
  }, [user, loadSubscriptions]);

  /**
   * Purgar totes les subscripcions i començar de nou
   */
  const purgeAllSubscriptions = useCallback(async () => {
    if (!user) return;
    
    try {
      logger.info('useNotifications', 'Purging all subscriptions');
      
      const { error } = await supabase
        .from('web_push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Reset local state
      setSubscriptions([]);
      setIsSubscribed(false);
      setIsInitialized(false);
      setSubscription(null);
      
      // Also unsubscribe from browser subscription
      try {
        const registration = await navigator.serviceWorker.ready;
        const browserSub = await registration.pushManager.getSubscription();
        if (browserSub) {
          await browserSub.unsubscribe();
          logger.info('useNotifications', 'Browser subscription also unsubscribed');
        }
      } catch (error) {
        logger.warn('useNotifications', 'Could not unsubscribe browser subscription', error);
      }
      
      logger.info('useNotifications', 'All subscriptions purged');
    } catch (error) {
      logger.error('useNotifications', 'Error purging subscriptions', error);
    }
  }, [user]);

  // Estat efectiu de notificacions
  const notificationsReady = isSupported && canUse && permissionStatus === 'granted' && (isSubscribed || subscription);

  // New utilities for device management
  const getActiveDevices = useCallback(() => {
    return subscriptions.filter(sub => sub.is_active);
  }, [subscriptions]);

  const getTotalDevices = useCallback(() => {
    return subscriptions.length;
  }, [subscriptions]);

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
    notificationsReady, // Nou estat efectiu
    
    // Accions
    initializeNotifications,
    updatePreferences,
    createTaskReminder,
    createCustomNotification,
    cancelReminder,
    refreshData,
    runRemindersProcessor,
    sendTestNotification,
    resetSubscription,
    cleanupDuplicateSubscriptions,
    purgeAllSubscriptions,
    
    // Device management utilities
    getActiveDevices,
    getTotalDevices,
    getDeviceInfo
  };
};

// Export types for external use
export type { NotificationPreferences, NotificationReminder, WebPushSubscriptionDB };
