// Service Worker per Web Push nativu (compatible amb Apple)
// Substitueix firebase-messaging-sw.js

const CACHE_NAME = 'taskflow-v4-icons-20250922';
const urlsToCache = [
  '/',
  '/manifest.json?v=4'
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
    icon: '/icona App 11.png?v=3',
    badge: '/icona App 11.png?v=3',
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
        icon: payload.icon || payload.data?.icon || notificationData.icon,
        badge: payload.badge || payload.data?.badge || notificationData.badge,
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

// Enhanced fetch handler for offline support
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle Supabase API requests and app resources
  if (url.hostname.includes('supabase.co') || url.hostname === self.location.hostname) {
    
    // Handle Supabase API requests
    if (url.hostname.includes('supabase.co')) {
      // For Supabase requests, try network first, fallback to cache
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Cache successful responses
            if (response.ok && event.request.method === 'GET') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(error => {
            console.log('🔌 Network request failed, trying cache:', event.request.url);
            
            // Try to return cached response
            return caches.match(event.request).then(cachedResponse => {
              if (cachedResponse) {
                console.log('📦 Returning cached response for:', event.request.url);
                return cachedResponse;
              }
              
              // For API requests, return a custom offline response
              if (url.pathname.includes('/rest/v1/')) {
                return new Response(JSON.stringify({
                  error: 'offline',
                  message: 'App is offline. Changes will be synced when online.'
                }), {
                  status: 503,
                  statusText: 'Service Unavailable (Offline)',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Offline': 'true'
                  }
                });
              }
              
              throw error;
            });
          })
      );
    } else {
      // For app resources, use cache first strategy
      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            return response || fetch(event.request);
          })
      );
    }
  }
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Notify the app to perform sync
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'BACKGROUND_SYNC',
            timestamp: Date.now()
          });
        });
      })
    );
  }
});