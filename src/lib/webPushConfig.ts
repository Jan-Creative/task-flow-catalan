// Configuració Web Push natiu per Apple/Safari compatibility
import { appleWebPushConfig, compatibilityChecker } from './appleWebPushConfig';

// VAPID Keys generats per la nostra aplicació
const VAPID_PUBLIC_KEY = "BDaie0OXdfKEQeTiv-sqcXg6hoElx3LxT0hfE5l5i6zkQCMMtx-IJFodq3UssaBTWc5TBDmt0gsBHqOL0wZGGHg";

/**
 * Converteix una clau VAPID de base64url a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Verifica si el navegador suporta Web Push nativement
 */
export const isWebPushSupported = (): boolean => {
  return compatibilityChecker.checkAll().webPushSupported;
};

/**
 * Detecta si estem en Safari
 */
export const isSafari = (): boolean => {
  return compatibilityChecker.checkAll().isSafari;
};

/**
 * Detecta si l'app està instal·lada com PWA
 */
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

/**
 * Verifica si podem usar Web Push (PWA instal·lada en Safari)
 */
export const canUseWebPush = (): boolean => {
  const compatibility = compatibilityChecker.checkAll();
  return compatibility.canUseNotifications;
};

/**
 * Obté recomanació d'ús segons el dispositiu
 */
export const getUsageRecommendation = () => {
  return compatibilityChecker.getRecommendation();
};

/**
 * Sol·licita permisos de notificació
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('Aquest navegador no suporta notificacions');
  }
  
  return await Notification.requestPermission();
};

/**
 * Registra el service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers no estan suportats');
  }
  
  const registration = await navigator.serviceWorker.register('/web-push-sw.js', {
    scope: '/'
  });
  
  console.log('✅ Service Worker registrat:', registration);
  return registration;
};

/**
 * Crea una subscripció Web Push
 */
export const createPushSubscription = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription> => {
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  
  console.log('🔑 Subscripció Web Push creada:', subscription);
  return subscription;
};

/**
 * Obté la subscripció existent si n'hi ha una
 */
export const getExistingSubscription = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  return await registration.pushManager.getSubscription();
};

/**
 * Converteix una subscripció PushSubscription al format de la nostra BD
 */
export interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const formatSubscriptionForDatabase = (
  subscription: PushSubscription
): WebPushSubscription => {
  const keys = subscription.getKey ? {
    p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
    auth: arrayBufferToBase64(subscription.getKey('auth')!)
  } : { p256dh: '', auth: '' };

  return {
    endpoint: subscription.endpoint,
    keys
  };
};

/**
 * Converteix ArrayBuffer a Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Obté informació del dispositiu per a la BD
 */
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  let deviceType = 'web';
  let os = 'unknown';
  
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    deviceType = 'ios';
    os = 'iOS';
  } else if (/Android/i.test(userAgent)) {
    deviceType = 'android';
    os = 'Android';
  } else if (/Mac/i.test(userAgent)) {
    os = 'macOS';
  } else if (/Win/i.test(userAgent)) {
    os = 'Windows';
  }
  
  return {
    userAgent,
    deviceType,
    os,
    isMobile,
    isPWA: isPWA(),
    isSafari: isSafari(),
    language: navigator.language
  };
};