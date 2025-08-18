// Configuració de Firebase per FCM
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';

// Configuració Firebase amb claus reals
const firebaseConfig = {
  apiKey: "AIzaSyAMTxVyQchcy04W9bg3uPxu2FyyZvK9v0M",
  authDomain: "notification-app-c4dfa.firebaseapp.com", 
  projectId: "notification-app-c4dfa",
  storageBucket: "notification-app-c4dfa.firebasestorage.app",
  messagingSenderId: "653569130057",
  appId: "1:653569130057:web:f5857a45e6c2bcfd294998"
};

// Inicialitzar Firebase
export const app = initializeApp(firebaseConfig);

// Obtenir instància de messaging
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// VAPID Key per Web Push
const VAPID_KEY = "BgFZfHT8U2KEBnHa2UU4mnzxGljooHI_BDMf_SZmU9s";

/**
 * Sol·licitar permisos de notificació i obtenir FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Comprovar si el navegador suporta notificacions
    if (!('Notification' in window)) {
      console.warn('Aquest navegador no suporta notificacions');
      return null;
    }

    // Comprovar si messaging està disponible
    if (!messaging) {
      console.warn('Firebase messaging no està disponible');
      return null;
    }

    // Sol·licitar permisos
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Permisos de notificació no concedits');
      return null;
    }

    // Registrar service worker si no està ja registrat
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registrat:', registration);
    }

    // Obtenir FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY
    });

    if (token) {
      console.log('🔑 FCM Token obtingut:', token);
      return token;
    } else {
      console.warn('No s\'ha pogut obtenir FCM token');
      return null;
    }
  } catch (error) {
    console.error('Error sol·licitant permisos de notificació:', error);
    return null;
  }
};

/**
 * Escoltar notificacions quan l'app està en primer pla
 */
export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('📨 Notificació rebuda en primer pla:', payload);
    callback(payload);
  });
};

/**
 * Verificar si les notificacions estan suportades
 */
export const isNotificationSupported = (): boolean => {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
};

/**
 * Obtenir estat dels permisos de notificació
 */
export const getNotificationPermissionStatus = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};