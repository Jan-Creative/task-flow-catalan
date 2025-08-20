// Service Worker per Web Push nativu (compatible amb Apple)
// Substitueix firebase-messaging-sw.js

const CACHE_NAME = 'taskflow-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Instal·lació del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Web Push Service Worker instal·lat');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache obert');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activació del Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Web Push Service Worker activat');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminant cache antic:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🎯 Prenent control de tots els clients');
      return self.clients.claim();
    }).then(() => {
      // Notificar als clients que el SW està actiu
      console.log('📡 Notificant als clients que el SW està actiu');
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            timestamp: Date.now()
          });
        });
      });
    })
  );
});

// Gestionar notificacions push en background
self.addEventListener('push', (event) => {
  console.log('📨 Notificació push rebuda:', event);
  
  let notificationData = {
    title: 'TaskFlow',
    body: 'Tens una nova notificació',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'taskflow-notification',
    data: {},
    actions: [],
    requireInteraction: false,
    silent: false
  };

  // Parsejar dades si venen del servidor
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📦 Payload rebut:', payload);
      
      notificationData = {
        ...notificationData,
        title: payload.title || notificationData.title,
        body: payload.body || payload.message || notificationData.body,
        tag: payload.tag || payload.data?.type || notificationData.tag,
        data: payload.data || {},
        requireInteraction: payload.data?.type === 'task_reminder',
        actions: payload.data?.type === 'task_reminder' ? [
          {
            action: 'view',
            title: 'Veure tasca'
          },
          {
            action: 'complete',
            title: 'Marcar completada'
          }
        ] : [
          {
            action: 'view',
            title: 'Veure'
          }
        ]
      };
    } catch (error) {
      console.error('❌ Error parsejar payload:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Gestionar clics en notificacions
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Clic en notificació:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  notification.close();

  if (action === 'view') {
    // Obrir l'app i navegar a la tasca
    const urlToOpen = data.taskId 
      ? `${self.registration.scope}task/${data.taskId}`
      : self.registration.scope;
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          const client = clientList.find(c => c.url.includes(self.registration.scope));
          
          if (client) {
            return client.focus().then(() => {
              return client.navigate(urlToOpen);
            });
          } else {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (action === 'complete' && data.taskId) {
    // Enviar missatge a l'app per marcar tasca completada
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

// Gestionar missatges del client
self.addEventListener('message', (event) => {
  console.log('💬 Missatge rebut al SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Intercepció de requests (cache first strategy)
self.addEventListener('fetch', (event) => {
  // Només per requests GET
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna de cache si existeix, sinó fetch de la xarxa
        return response || fetch(event.request);
      })
  );
});