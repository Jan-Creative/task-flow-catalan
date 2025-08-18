import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  requestNotificationPermission, 
  onForegroundMessage, 
  isNotificationSupported,
  getNotificationPermissionStatus 
} from '@/lib/firebaseConfig';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface NotificationSubscription {
  id: string;
  user_id: string;
  fcm_token: string;
  device_type: string;
  device_info: any; // JSON type from Supabase
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationReminder {
  id: string;
  user_id: string;
  task_id?: string;
  title: string;
  message: string;
  scheduled_at: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  notification_type: 'task_reminder' | 'custom' | 'deadline';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  enabled: boolean;
  task_reminders: boolean;
  deadline_alerts: boolean;
  custom_notifications: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  notification_sound: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const [isSupported] = useState(isNotificationSupported());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    getNotificationPermissionStatus()
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Inicialitzar notificacions FCM
   */
  const initializeNotifications = useCallback(async () => {
    if (!isSupported || !user) {
      console.warn('Notificacions no suportades o usuari no autenticat');
      return false;
    }

    setIsInitializing(true);

    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        setFcmToken(token);
        setPermissionStatus('granted');

        // Guardar subscripció a la base de dades
        await saveSubscription(token);

        toast({
          title: 'Notificacions activades! 🔔',
          description: 'Rebràs recordatoris de les teves tasques',
        });

        return true;
      } else {
        setPermissionStatus(getNotificationPermissionStatus());
        return false;
      }
    } catch (error) {
      console.error('Error inicialitzant notificacions:', error);
      
      // Capturar errors específics de Firebase per evitar rebuigs no gestionats
      if (error instanceof Error) {
        if (error.message.includes('unsupported-browser')) {
          toast({
            title: 'Navegador no compatible',
            description: 'Aquest navegador no suporta notificacions push',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'No s\'han pogut activar les notificacions',
            variant: 'destructive',
          });
        }
      }
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [isSupported, user, toast]);

  /**
   * Guardar subscripció FCM a la base de dades
   */
  const saveSubscription = useCallback(async (token: string) => {
    if (!user) return;

    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString(),
      };

      // Comprovar si ja existeix una subscripció activa per aquest token
      const { data: existingSubscription } = await supabase
        .from('notification_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('fcm_token', token)
        .eq('is_active', true)
        .single();

      if (!existingSubscription) {
        // Desactivar subscripcions anteriors d'aquest usuari
        await supabase
          .from('notification_subscriptions')
          .update({ is_active: false })
          .eq('user_id', user.id);

        // Crear nova subscripció
        const { error } = await supabase
          .from('notification_subscriptions')
          .insert({
            user_id: user.id,
            fcm_token: token,
            device_type: 'web',
            device_info: deviceInfo,
            is_active: true,
          });

        if (error) {
          console.error('Error guardant subscripció:', error);
          throw error;
        }
      }

      await loadSubscriptions();
    } catch (error) {
      console.error('Error guardant subscripció FCM:', error);
      throw error;
    }
  }, [user]);

  /**
   * Carregar subscripcions de l'usuari
   */
  const loadSubscriptions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error carregant subscripcions:', error);
    }
  }, [user]);

  /**
   * Carregar preferències de notificació
   */
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPreferences(data);
    } catch (error) {
      console.error('Error carregant preferències:', error);
    }
  }, [user]);

  /**
   * Actualitzar preferències de notificació
   */
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      
      toast({
        title: 'Preferències actualitzades',
        description: 'Les teves preferències de notificació s\'han guardat',
      });
    } catch (error) {
      console.error('Error actualitzant preferències:', error);
      toast({
        title: 'Error',
        description: 'No s\'han pogut actualitzar les preferències',
        variant: 'destructive',
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
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Recordatori creat! ⏰',
        description: `Te recordarem: ${title}`,
      });

      return data;
    } catch (error) {
      console.error('Error creant recordatori:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut crear el recordatori',
        variant: 'destructive',
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
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('notification_reminders')
        .insert({
          user_id: user.id,
          title,
          message,
          scheduled_at: scheduledAt.toISOString(),
          notification_type: 'custom',
          status: 'pending',
          metadata,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Notificació programada! 📅',
        description: `${title} - ${scheduledAt.toLocaleString()}`,
      });

      return data;
    } catch (error) {
      console.error('Error creant notificació:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut programar la notificació',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  /**
   * Cancel·lar recordatori
   */
  const cancelReminder = useCallback(async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('notification_reminders')
        .update({ status: 'cancelled' })
        .eq('id', reminderId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Recordatori cancel·lat',
        description: 'El recordatori s\'ha cancel·lat correctament',
      });
    } catch (error) {
      console.error('Error cancel·lant recordatori:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut cancel·lar el recordatori',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Configurar listener per notificacions en primer pla
  useEffect(() => {
    if (!fcmToken) return;

    const unsubscribe = onForegroundMessage((payload) => {
      // Mostrar notificació com toast quan l'app està oberta
      toast({
        title: payload.notification?.title || 'Nova notificació',
        description: payload.notification?.body || 'Tens una nova notificació',
      });
    });

    return unsubscribe;
  }, [fcmToken, toast]);

  // Carregar dades inicials
  useEffect(() => {
    if (user) {
      loadPreferences();
      loadSubscriptions();
    }
  }, [user, loadPreferences, loadSubscriptions]);

  /**
   * Executar processador de recordatoris manualment
   */
  const runRemindersProcessor = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('process-reminders', {
        body: { manual_trigger: true, source: 'user_request' }
      });

      if (error) throw error;

      toast({
        title: 'Processador executat! ⚡',
        description: `Processats: ${data?.processed || 0} recordatoris`,
      });

      return data;
    } catch (error) {
      console.error('Error executant processador:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut executar el processador',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  /**
   * Enviar notificació de prova
   */
  const sendTestNotification = useCallback(async () => {
    if (!user) return;

    try {
      const testDate = new Date(Date.now() + 10000); // 10 segons
      
      const { data, error } = await supabase
        .from('notification_reminders')
        .insert({
          user_id: user.id,
          title: '🧪 Prova de notificació',
          message: 'Si reps això, el sistema funciona perfectament!',
          scheduled_at: testDate.toISOString(),
          notification_type: 'custom',
          status: 'pending',
          metadata: { test: true }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Notificació de prova programada! 🧪',
        description: 'Rebràs una notificació en 10 segons',
      });

      return data;
    } catch (error) {
      console.error('Error enviant notificació de prova:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut enviar la notificació de prova',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, toast]);

  return {
    // Estats
    isSupported,
    permissionStatus,
    fcmToken,
    isInitializing,
    preferences,
    subscriptions,
    
    // Accions
    initializeNotifications,
    updatePreferences,
    createTaskReminder,
    createCustomNotification,
    cancelReminder,
    loadPreferences,
    loadSubscriptions,
    runRemindersProcessor,
    sendTestNotification,
  };
};