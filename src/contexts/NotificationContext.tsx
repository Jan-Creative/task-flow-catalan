import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { NotificationPreferences, NotificationSubscription } from '@/hooks/useNotifications';

interface NotificationContextType {
  // Estado
  isSupported: boolean;
  permissionStatus: NotificationPermission;
  fcmToken: string | null;
  preferences: NotificationPreferences | null;
  subscriptions: NotificationSubscription[];
  isInitialized: boolean;
  
  // Acciones
  initializeNotifications: () => Promise<void>;
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
  createTaskReminder: (
    taskId: string,
    title: string,
    message: string,
    scheduledAt: Date
  ) => Promise<void>;
  createCustomNotification: (
    title: string,
    message: string,
    scheduledAt: Date,
    metadata?: Record<string, any>
  ) => Promise<void>;
  cancelReminder: (reminderId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext debe usarse dentro de un NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    isSupported,
    permissionStatus,
    fcmToken,
    preferences,
    subscriptions,
    initializeNotifications: hookInitialize,
    updatePreferences: hookUpdatePreferences,
    createTaskReminder: hookCreateTaskReminder,
    createCustomNotification: hookCreateCustomNotification,
    cancelReminder: hookCancelReminder,
    loadPreferences,
    loadSubscriptions,
  } = useNotifications();

  // Inicializar automáticamente las notificaciones cuando el usuario se autentica
  useEffect(() => {
    const autoInitialize = async () => {
      if (user && isSupported && !isInitialized) {
        try {
          if (permissionStatus === 'default') {
            // Mostrar mensaje informativo antes de solicitar permisos
            toast({
              title: "Notificacions disponibles",
              description: "Pots activar les notificacions per rebre recordatoris de tasques.",
              duration: 5000,
            });
          } else if (permissionStatus === 'granted' && !fcmToken) {
            // Si ya se concedieron permisos pero no hay token, inicializar
            await hookInitialize();
          }
          setIsInitialized(true);
        } catch (error) {
          console.error('Error auto-inicializando notificaciones:', error);
          setIsInitialized(true);
        }
      }
    };

    autoInitialize();
  }, [user, isSupported, permissionStatus, fcmToken, isInitialized, hookInitialize, toast]);

  // Funciones envueltas con manejo de errores
  const initializeNotifications = async () => {
    try {
      await hookInitialize();
      toast({
        title: "Notificacions activades",
        description: "Rebràs recordatoris per les teves tasques.",
      });
    } catch (error) {
      toast({
        title: "Error activant notificacions",
        description: "No s'han pogut activar les notificacions. Prova-ho més tard.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      await hookUpdatePreferences(updates);
      toast({
        title: "Preferències actualitzades",
        description: "Les teves preferències de notificació s'han guardat.",
      });
    } catch (error) {
      toast({
        title: "Error actualitzant preferències",
        description: "No s'han pogut guardar les preferències.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createTaskReminder = async (
    taskId: string,
    title: string,
    message: string,
    scheduledAt: Date
  ) => {
    try {
      await hookCreateTaskReminder(taskId, title, message, scheduledAt);
      toast({
        title: "Recordatori creat",
        description: `T'avisarem el ${scheduledAt.toLocaleDateString()} a les ${scheduledAt.toLocaleTimeString()}.`,
      });
    } catch (error) {
      toast({
        title: "Error creant recordatori",
        description: "No s'ha pogut crear el recordatori.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createCustomNotification = async (
    title: string,
    message: string,
    scheduledAt: Date,
    metadata: Record<string, any> = {}
  ) => {
    try {
      await hookCreateCustomNotification(title, message, scheduledAt, metadata);
      toast({
        title: "Notificació programada",
        description: `T'avisarem el ${scheduledAt.toLocaleDateString()} a les ${scheduledAt.toLocaleTimeString()}.`,
      });
    } catch (error) {
      toast({
        title: "Error programant notificació",
        description: "No s'ha pogut programar la notificació.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const cancelReminder = async (reminderId: string) => {
    try {
      await hookCancelReminder(reminderId);
      toast({
        title: "Recordatori cancel·lat",
        description: "El recordatori s'ha cancel·lat correctament.",
      });
    } catch (error) {
      toast({
        title: "Error cancel·lant recordatori",
        description: "No s'ha pogut cancel·lar el recordatori.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshData = async () => {
    try {
      await Promise.all([
        loadPreferences(),
        loadSubscriptions(),
      ]);
    } catch (error) {
      console.error('Error refreshing notification data:', error);
    }
  };

  const contextValue: NotificationContextType = {
    isSupported,
    permissionStatus,
    fcmToken,
    preferences,
    subscriptions,
    isInitialized,
    initializeNotifications,
    updatePreferences,
    createTaskReminder,
    createCustomNotification,
    cancelReminder,
    refreshData,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};