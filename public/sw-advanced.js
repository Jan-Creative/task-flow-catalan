/**
 * Advanced Service Worker for PWA
 * Implements professional caching strategies and offline capabilities
 */

// Fixed cache version to avoid infinite update loops
const SW_VERSION = 'v3';
const CACHE_NAME = `taskflow-${SW_VERSION}`;
const STATIC_CACHE = `taskflow-static-${SW_VERSION}`;
const DYNAMIC_CACHE = `taskflow-dynamic-${SW_VERSION}`;
const API_CACHE = `taskflow-api-${SW_VERSION}`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Resources to precache - Workbox will inject the manifest here
// This placeholder will be replaced by workbox-build with the actual precache manifest
const precacheManifest = self.__WB_MANIFEST;

// Fallback resources if manifest is empty
const PRECACHE_RESOURCES = precacheManifest.length > 0 ? precacheManifest : [
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

// PWA mode detection helper
const isPWAMode = (clientUrl) => {
  if (!clientUrl) return false;
  const url = new URL(clientUrl);
  return url.searchParams.has('pwa') || url.searchParams.has('nocache') ||
         url.toString().includes('display-mode=standalone');
};

// Install event - minimal precaching for PWA performance
self.addEventListener('install', event => {
  console.log('📦 SW installing with cache:', CACHE_NAME);
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        // Only cache offline fallback and manifest - minimal footprint
        const essentialResources = ['/offline.html', '/manifest.json'];
        await Promise.allSettled(
          essentialResources.map(url => 
            cache.add(url).catch(err => console.warn(`Failed to cache ${url}:`, err))
          )
        );
        console.log('✅ Essential precaching complete');
      } catch (error) {
        console.error('Precaching error:', error);
      }
      // Always skip waiting
      self.skipWaiting();
    })()
  );
});

// Activate event - cache cleanup and immediate control
self.addEventListener('activate', event => {
  console.log('🚀 SW activating with cache:', CACHE_NAME);
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const validCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
      await Promise.all(
        cacheNames
          .filter(cacheName => !validCaches.includes(cacheName))
          .map(cacheName => {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );

      // Take immediate control of all clients
      await self.clients.claim();
      // Do not force reload to avoid loops
    })()
  );
});

// Fetch event - PWA-aware caching with network-first for standalone mode
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Check if request comes from PWA/standalone mode
  const pwaMode = url.searchParams.has('pwa') || url.searchParams.has('nocache');
  
  // Find matching route strategy
  const routeConfig = ROUTE_STRATEGIES.find(route => 
    route.pattern.test(event.request.url)
  );
  
  if (routeConfig) {
    // Force network-first in PWA mode for critical resources
    if (pwaMode && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
      event.respondWith(
        fetch(event.request, { cache: 'no-store' })
          .catch(() => handleRequest(event.request, routeConfig))
      );
    } else {
      event.respondWith(handleRequest(event.request, routeConfig));
    }
  } else {
    // Default strategy for app routes
    event.respondWith(handleAppRoute(event.request, pwaMode));
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
        (options.networkTimeoutSeconds || 3) * 1000)
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

// Handle app routes (SPA navigation) - Enhanced with PWA mode support
async function handleAppRoute(request, pwaMode = false) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const url = new URL(request.url);
  
  // For navigation requests, ALWAYS network-first, NO CACHE in PWA mode
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    try {
      // In PWA mode, always fetch fresh with no-store
      const fetchOptions = pwaMode ? { cache: 'no-store' } : { cache: 'default' };
      const response = await fetch(request, fetchOptions);
      
      // Don't cache HTML in PWA mode to ensure fresh app
      if (!pwaMode && response.status === 200) {
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      // Fallback only if network completely fails
      console.warn('Network failed, using cached fallback');
      const cached = await cache.match('/') || 
                     await cache.match('/offline.html') || 
                     await cache.match('/index.html');
      return cached || new Response('App offline', { status: 503 });
    }
  }
  
  // For other resources, network-first in PWA mode
  if (pwaMode) {
    try {
      const response = await fetch(request, { cache: 'reload' });
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      return cached || new Response('Resource offline', { status: 503 });
    }
  }
  
  // Regular mode: cache-first for assets
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || new Response('Resource offline', { status: 503 });
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