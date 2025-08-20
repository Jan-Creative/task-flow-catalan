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
 * Registra el service worker amb retry logic per Safari iOS
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers no estan suportats');
  }
  
  const registration = await navigator.serviceWorker.register('/web-push-sw.js', {
    scope: '/'
  });
  
  // Esperar que el SW estigui actiu abans de continuar (especialment crucial per Safari iOS)
  await waitForServiceWorkerReady(registration);
  
  console.log('✅ Service Worker registrat i actiu:', registration);
  return registration;
};

/**
 * Espera que el Service Worker estigui completament actiu
 */
export const waitForServiceWorkerReady = async (
  registration: ServiceWorkerRegistration,
  timeout: number = 10000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout esperant Service Worker actiu'));
    }, timeout);

    const checkReady = () => {
      if (registration.active && registration.active.state === 'activated') {
        clearTimeout(timeoutId);
        console.log('🟢 Service Worker completament actiu');
        resolve();
        return;
      }

      if (registration.installing) {
        console.log('🔧 Service Worker instal·lant...');
        registration.installing.addEventListener('statechange', checkReady);
        return;
      }

      if (registration.waiting) {
        console.log('⏳ Service Worker esperant...');
        registration.waiting.addEventListener('statechange', checkReady);
        return;
      }

      // Retry després d'un petit delay
      setTimeout(checkReady, 100);
    };

    checkReady();
  });
};

/**
 * Detecta si el navegador suporta Declarative Web Push (Safari 18.5+)
 */
export const supportsDeclarativeWebPush = (): boolean => {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'pushManager' in ServiceWorkerRegistration.prototype &&
         // Verificar si el manifest suporta push_subscription_change
         'getRegistrations' in navigator.serviceWorker &&
         isSafari() && 
         // Només Safari 18.5+ (aproximació basada en userAgent)
         navigator.userAgent.includes('Safari') && 
         !navigator.userAgent.includes('Chrome');
};

/**
 * Crea una subscripció Web Push amb retry logic per Safari iOS
 */
export const createPushSubscription = async (
  registration: ServiceWorkerRegistration,
  retries: number = 3
): Promise<PushSubscription> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Intent ${attempt}/${retries} crear subscripció Web Push...`);
      
      // Verificar que el SW està realment actiu
      if (!registration.active || registration.active.state !== 'activated') {
        console.log('⏳ Esperant Service Worker actiu...');
        await waitForServiceWorkerReady(registration);
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      console.log(`🔑 Subscripció Web Push creada correctament (intent ${attempt}):`, subscription);
      return subscription;
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Error intent ${attempt}/${retries}:`, error);
      
      if (attempt < retries) {
        // Esperar abans del següent intent (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Esperant ${delay}ms abans del següent intent...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`No s'ha pogut crear la subscripció després de ${retries} intents: ${lastError?.message}`);
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