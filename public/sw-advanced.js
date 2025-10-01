/**
 * Advanced Service Worker for PWA
 * Implements professional caching strategies and offline capabilities
 */

// Dynamic cache names with timestamp for guaranteed updates
const BUILD_TIMESTAMP = Date.now();
const CACHE_NAME = `taskflow-v${BUILD_TIMESTAMP}`;
const STATIC_CACHE = `taskflow-static-v${BUILD_TIMESTAMP}`;
const DYNAMIC_CACHE = `taskflow-dynamic-v${BUILD_TIMESTAMP}`;
const API_CACHE = `taskflow-api-v${BUILD_TIMESTAMP}`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Resources to precache - Workbox will inject the manifest here
const precacheManifest = self.__WB_MANIFEST;

const PRECACHE_RESOURCES = (precacheManifest && precacheManifest.length > 0) ? precacheManifest : [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Route configurations
const ROUTE_STRATEGIES = [
  {
    pattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\//,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cache: API_CACHE,
    options: {
      networkTimeoutSeconds: 3,
      cacheableResponse: {
        statuses: [0, 200]
      }
    }
  },
  {
    pattern: /\.(js|css)$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cache: STATIC_CACHE,
    options: {
      cacheableResponse: {
        statuses: [0, 200]
      }
    }
  },
  {
    pattern: /\.(woff2?|png|jpg|jpeg|webp|svg|ico)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cache: STATIC_CACHE,
    options: {
      cacheableResponse: {
        statuses: [0, 200]
      }
    }
  },
  {
    pattern: /\/api\//,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cache: API_CACHE,
    options: {
      networkTimeoutSeconds: 2
    }
  }
];

// Install event - precache resources and force immediate activation
self.addEventListener('install', event => {
  console.log('📦 SW installing with cache:', CACHE_NAME);
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE_RESOURCES);
      // Force immediate activation for updates
      self.skipWaiting();
    })()
  );
});

// Activate event - gentle cache cleanup, NO forced reloads
self.addEventListener('activate', event => {
  console.log('🚀 SW activating with cache:', CACHE_NAME);
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const validCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
      
      // Delete old caches
      await Promise.all(
        cacheNames
          .filter(cacheName => !validCaches.includes(cacheName))
          .map(cacheName => {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
      
      // Take control of all clients
      await self.clients.claim();
      
      // Notify clients (but don't force reload)
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        console.log('📡 Notifying client of activation');
        client.postMessage({ 
          type: 'SW_ACTIVATED',
          cacheVersion: CACHE_NAME,
          shouldReload: false
        });
      });
    })()
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Find matching route strategy
  const routeConfig = ROUTE_STRATEGIES.find(route => 
    route.pattern.test(event.request.url)
  );
  
  if (routeConfig) {
    event.respondWith(handleRequest(event.request, routeConfig));
  } else {
    // Default strategy for app routes
    event.respondWith(handleAppRoute(event.request));
  }
});

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback if available
    return cache.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName, options = {}) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 
        options.networkTimeoutSeconds * 1000 || 3000)
      )
    ]);
    
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Return structured offline response for API calls
    if (request.url.includes('/rest/v1/')) {
      return new Response(JSON.stringify({
        error: 'offline',
        message: 'This data is not available offline'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Handle request based on strategy
async function handleRequest(request, routeConfig) {
  const { strategy, cache: cacheName, options } = routeConfig;
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName);
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName, options);
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName);
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    case CACHE_STRATEGIES.CACHE_ONLY:
      const cache = await caches.open(cacheName);
      return cache.match(request);
    default:
      return fetch(request);
  }
}

// Handle app routes (SPA navigation) - SAFE network-first with no-store for HTML
async function handleAppRoute(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // For navigation requests, always try network first with cache: 'no-store'
  if (request.mode === 'navigate' || request.url.endsWith('/') || request.url.includes('.html')) {
    try {
      // Force fresh HTML from network with no-store
      const response = await fetch(request, { cache: 'no-store' });
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // Only use cache if network completely fails
      const cached = await cache.match('/') || await cache.match('/index.html');
      return cached || new Response('App offline', { status: 503 });
    }
  }
  
  // For JS/CSS: network-first (no stale-while-revalidate to avoid stale code)
  if (request.url.match(/\.(js|css)$/)) {
    try {
      const response = await fetch(request);
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // Fallback to cache only if offline
      const cached = await cache.match(request);
      return cached || new Response('Resource offline', { status: 503 });
    }
  }
  
  // For other resources, cache first is fine
  const cached = await cache.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Resource offline', { status: 503 });
  }
}

// Push notification handling
self.addEventListener('push', event => {
const options = {
    body: 'Tens una nova notificació',
    icon: '/icons/app-icon-192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'taskflow-notification',
    requireInteraction: false,
    data: {},
    actions: []
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      options.body = payload.body || options.body;
      options.title = payload.title || 'TaskFlow';
      options.icon = payload.icon || options.icon;
      options.badge = payload.badge || options.badge;
      options.tag = payload.tag || options.tag;
      options.data = payload.data || {};
      
      if (payload.type === 'task_reminder') {
        options.actions = [
          { action: 'view', title: 'Veure tasca' },
          { action: 'complete', title: 'Marcar completada' }
        ];
        options.data = { taskId: payload.taskId, type: payload.type };
      }
    } catch (error) {
      console.log('Error parsing push data:', error);
      // Use default options if parsing fails
    }
  }

  event.waitUntil(
    self.registration.showNotification(options.title || 'TaskFlow', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = event.notification.data?.taskId 
      ? `/task/${event.notification.data.taskId}`
      : '/';
      
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus().then(client => {
            return client.navigate(urlToOpen);
          });
        }
        return clients.openWindow(urlToOpen);
      })
    );
  } else if (event.action === 'complete' && event.notification.data?.taskId) {
    // Send message to complete task
    event.waitUntil(
      clients.matchAll().then(clientList => {
        clientList.forEach(client => {
          client.postMessage({
            type: 'COMPLETE_TASK',
            taskId: event.notification.data.taskId
          });
        });
      })
    );
  }
});

// Background sync
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      clients.matchAll().then(clientList => {
        clientList.forEach(client => {
          client.postMessage({ type: 'BACKGROUND_SYNC' });
        });
      })
    );
  }
});

// Message handling
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});