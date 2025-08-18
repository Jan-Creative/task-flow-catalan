// Service Worker per Firebase Cloud Messaging (FCM)
// Aquest fitxer ha d'estar a la root pública per funcionar correctament

// Importar scripts de Firebase
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Configuració de Firebase (necessària per FCM)
const firebaseConfig = {
  // Aquestes claus seran afegides quan configurem Firebase
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicialitzar Firebase
firebase.initializeApp(firebaseConfig);

// Obtenir instància de messaging
const messaging = firebase.messaging();

// Gestionar notificacions en background
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Notificació rebuda en background:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Nova notificació';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || 'Tens una nova notificació',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.type || 'general',
    data: payload.data,
    actions: payload.data?.type === 'task_reminder' ? [
      { 
        action: 'view', 
        title: 'Veure tasca',
        icon: '/favicon.ico'
      },
      { 
        action: 'complete', 
        title: 'Marcar com completada',
        icon: '/favicon.ico'
      }
    ] : [
      { 
        action: 'view', 
        title: 'Veure',
        icon: '/favicon.ico'
      }
    ],
    requireInteraction: payload.data?.type === 'task_reminder', // Mantenir visible si és recordatori de tasca
    silent: false,
    vibrate: [200, 100, 200]
  };

  // Mostrar la notificació
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestionar clics en notificacions
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Clic en notificació:', event.notification.data);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  notification.close();

  // Gestionar diferents accions
  if (action === 'view') {
    // Obrir l'app i navegar a la tasca específica
    const urlToOpen = data.taskId 
      ? `${self.registration.scope}task/${data.taskId}`
      : self.registration.scope;
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Buscar finestra oberta de l'app
          const client = clientList.find(c => c.url.includes(self.registration.scope));
          
          if (client) {
            // Si l'app està oberta, enfocar i navegar
            return client.focus().then(() => {
              return client.navigate(urlToOpen);
            });
          } else {
            // Si no està oberta, obrir nova finestra
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (action === 'complete' && data.taskId) {
    // Marcar tasca com completada (enviar missatge a l'app)
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          clientList.forEach(client => {
            client.postMessage({
              type: 'COMPLETE_TASK',
              taskId: data.taskId
            });
          });
        })
    );
  } else {
    // Acció per defecte: obrir l'app
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          } else {
            return clients.openWindow(self.registration.scope);
          }
        })
    );
  }
});

// Gestionar instal·lació del service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instal·lat');
  self.skipWaiting();
});

// Gestionar activació del service worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activat');
  event.waitUntil(clients.claim());
});

// Gestionar missatges del client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});