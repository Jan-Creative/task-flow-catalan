// Web Push configuració i generador de claus VAPID per Apple/Safari

/**
 * Generar parella de claus VAPID (pública/privada) 
 * Aquestes claus s'utilitzen per autenticar l'aplicació amb els serveis Push
 */
export async function generateVAPIDKeys() {
  try {
    // Generar parella de claus EC P-256 per VAPID
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      true, // extractable
      ['sign', 'verify']
    );

    // Exportar clau pública
    const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
    const publicKeyArray = new Uint8Array(publicKeyBuffer);
    const publicKeyBase64 = arrayBufferToBase64Url(publicKeyArray);

    // Exportar clau privada
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const privateKeyArray = new Uint8Array(privateKeyBuffer);
    const privateKeyBase64 = arrayBufferToBase64Url(privateKeyArray);

    return {
      publicKey: publicKeyBase64,
      privateKey: privateKeyBase64,
      subject: 'mailto:hello@taskflow.app'
    };
  } catch (error) {
    console.error('Error generant claus VAPID:', error);
    throw error;
  }
}

/**
 * Convertir ArrayBuffer a Base64 URL-safe
 */
function arrayBufferToBase64Url(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Claus VAPID actuals de l'aplicació
 * En producció, aquestes es generarien una vegada i es guardarien segures
 */
export const VAPID_KEYS = {
  // Clau pública (pot ser visible al client)
  publicKey: "BDaie0OXdfKEQeTiv-sqcXg6hoElx3LxT0hfE5l5i6zkQCMMtx-IJFodq3UssaBTWc5TBDmt0gsBHqOL0wZGGHg",
  
  // Clau privada (només al servidor - Edge Functions)
  privateKey: "BKg8lJsKqEe7FnMW7UJQczOQ8Q4B0-Tn0oJ9B4K9QjRDfPGe_MqOEo-vhX0K8Y6LjGx4A8K4xV1K5k9Fo6KjNDg",
  
  // Subject (email de contacte)
  subject: "mailto:hello@taskflow.app"
};

/**
 * Detectar capabilities específiques d'Apple/Safari
 */
export const appleNotificationFeatures = {
  // Safari 16.4+ suporta Web Push en PWA
  isPWARequired: () => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    return isSafari && !window.matchMedia('(display-mode: standalone)').matches;
  },

  // Detectar si estem en iOS Safari
  isIOSSafari: () => {
    const userAgent = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/CriOS|FxiOS|OPiOS|mercury/.test(userAgent);
  },

  // Verificar si Web Push està disponible
  isWebPushAvailable: () => {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window &&
      'showNotification' in ServiceWorkerRegistration.prototype
    );
  },

  // Safari té limitacions específiques
  getSafariLimitations: () => {
    if (!appleNotificationFeatures.isIOSSafari()) return [];
    
    return [
      'Requereix PWA instal·lada',
      'No suporta accions personalitzades',
      'Límit de text més restrictiu',
      'No suporta icones personalitzades',
      'Només funciona amb HTTPS'
    ];
  }
};

/**
 * Configuració específica per Apple Web Push
 */
export const appleWebPushConfig = {
  // Endpoint de Apple per Web Push
  endpoint: 'https://web.push.apple.com',
  
  // Headers específics per Apple
  getAppleHeaders: () => ({
    'apns-priority': '10',
    'apns-topic': 'taskflow.app', // Bundle ID de l'app
    'apns-push-type': 'alert',
    'apns-expiration': '0'
  }),

  // Payload optimitzat per Safari
  createSafariPayload: (title: string, body: string, data: any = {}) => ({
    title,
    body,
    // Safari és més restrictiu amb les propietats
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.type || 'taskflow',
    data,
    // Safari no suporta accions complexes
    actions: [], 
    requireInteraction: false,
    silent: false
  }),

  // Verificar si l'endpoint és d'Apple
  isAppleEndpoint: (endpoint: string) => {
    return endpoint.includes('web.push.apple.com');
  }
};

/**
 * Utilitats per instal·lació PWA
 */
export const pwaInstallUtils = {
  // Verificar si l'app pot ser instal·lada
  canInstall: () => {
    return 'BeforeInstallPromptEvent' in window || 
           window.matchMedia('(display-mode: browser)').matches;
  },

  // Mostrar prompt d'instal·lació (si està disponible)
  showInstallPrompt: async () => {
    // Aquesta funcionalitat requereix gestió d'esdeveniments beforeinstallprompt
    // que s'han de configurar al component principal
    console.log('💡 Per instal·lar l\'app com PWA, utilitza el menú del navegador');
  },

  // Detectar si l'app està instal·lada
  isInstalled: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },

  // Instruccions específiques per Safari iOS
  getSafariInstallInstructions: () => [
    '1. Obre Safari i navega a l\'aplicació',
    '2. Toca el botó de compartir (quadrat amb fletxa)',
    '3. Desplaça\'t cap avall i toca "Afegir a la pantalla d\'inici"',
    '4. Toca "Afegir" per confirmar',
    '5. L\'app apareixerà a la pantalla d\'inici'
  ]
};

/**
 * Validador de compatibilitat
 */
export const compatibilityChecker = {
  checkAll: () => {
    const results = {
      webPushSupported: appleNotificationFeatures.isWebPushAvailable(),
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      isIOS: appleNotificationFeatures.isIOSSafari(),
      isPWA: pwaInstallUtils.isInstalled(),
      canUseNotifications: false,
      requirements: [] as string[],
      limitations: [] as string[]
    };

    // Determinar si es poden usar notificacions
    if (results.isSafari || results.isIOS) {
      results.canUseNotifications = results.isPWA;
      if (!results.isPWA) {
        results.requirements.push('Instal·la l\'app com PWA per rebre notificacions');
      }
      results.limitations = appleNotificationFeatures.getSafariLimitations();
    } else {
      results.canUseNotifications = results.webPushSupported;
    }

    return results;
  },

  getRecommendation: () => {
    const check = compatibilityChecker.checkAll();
    
    if (check.canUseNotifications) {
      return {
        type: 'success',
        message: 'El teu dispositiu és compatible amb notificacions push!',
        action: 'activate'
      };
    }

    if (check.isSafari && !check.isPWA) {
      return {
        type: 'warning',
        message: 'Safari requereix instal·lar l\'app com PWA per rebre notificacions',
        action: 'install',
        instructions: pwaInstallUtils.getSafariInstallInstructions()
      };
    }

    return {
      type: 'error',
      message: 'El teu navegador no suporta notificacions push',
      action: 'upgrade',
      recommendation: 'Prova amb Chrome, Edge, Firefox o Safari (amb PWA)'
    };
  }
};