/**
 * Advanced Service Worker for PWA
 * Implements professional caching strategies and offline capabilities
 */

// Static cache version - increment manually for major updates
const CACHE_VERSION = '1.0.0';
// Build hash injected by Vite during build (fallback to version if not available)
const BUILD_HASH = typeof __VITE_BUILD_HASH__ !== 'undefined' ? __VITE_BUILD_HASH__ : CACHE_VERSION;
const CACHE_NAME = `taskflow-v${BUILD_HASH}`;
const STATIC_CACHE = `taskflow-static-v${BUILD_HASH}`;
const DYNAMIC_CACHE = `taskflow-dynamic-v${BUILD_HASH}`;
const API_CACHE = `taskflow-api-v${BUILD_HASH}`;

// Persistent critical cache - NEVER deleted, survives version updates
const CRITICAL_CACHE = 'taskflow-critical-persistent';
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json'
];

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
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cache: STATIC_CACHE,
    options: {
      networkTimeoutSeconds: 3,
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
  console.log('📦 SW installing', {
    version: CACHE_VERSION,
    buildHash: BUILD_HASH,
    cacheName: CACHE_NAME,
    timestamp: new Date().toISOString()
  });
  event.waitUntil(
    (async () => {
      // Precache regular assets
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE_RESOURCES);
      
      // Precache critical assets to persistent cache
      const criticalCache = await caches.open(CRITICAL_CACHE);
      try {
        await criticalCache.addAll(CRITICAL_ASSETS);
        console.log('✅ Critical assets cached to persistent storage');
      } catch (error) {
        console.warn('⚠️ Some critical assets failed to cache:', error);
        // Don't fail installation if critical cache fails
      }
      
      // Force immediate activation for updates
      self.skipWaiting();
    })()
  );
});

// Activate event - gentle cache cleanup with delayed deletion
self.addEventListener('activate', event => {
  console.log('🚀 SW activating', {
    version: CACHE_VERSION,
    buildHash: BUILD_HASH,
    cacheName: CACHE_NAME
  });
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const taskflowCaches = cacheNames.filter(name => name.startsWith('taskflow-'));
      
      // Extract unique version hashes from cache names
      const cacheVersions = [...new Set(
        taskflowCaches.map(name => {
          const match = name.match(/taskflow-(?:static-|dynamic-|api-)?v(.+)/);
          return match ? match[1] : null;
        }).filter(Boolean)
      )];
      
      console.log('📊 Cache versions found:', {
        total: cacheVersions.length,
        versions: cacheVersions,
        current: BUILD_HASH
      });
      
      // Keep current version + 1 previous version for smooth transitions
      const currentVersionCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
      
      // Identify previous version caches (most recent that isn't current)
      const previousVersionHash = cacheVersions
        .filter(v => v !== BUILD_HASH)
        .sort()
        .reverse()[0];
      
      const previousVersionCaches = previousVersionHash 
        ? taskflowCaches.filter(name => name.includes(previousVersionHash))
        : [];
      
      const validCaches = [...currentVersionCaches, ...previousVersionCaches];
      
      console.log('✅ Valid caches:', {
        current: currentVersionCaches,
        previous: previousVersionCaches,
        total: validCaches.length
      });
      
      // Identify caches to delete (older than previous version, but NEVER delete critical cache)
      const cachesToDelete = cacheNames.filter(cacheName => 
        cacheName.startsWith('taskflow-') && 
        !validCaches.includes(cacheName) &&
        cacheName !== CRITICAL_CACHE // Never delete critical cache
      );
      
      if (cachesToDelete.length > 0) {
        console.log('⏳ Scheduling cleanup of old caches in 5 seconds:', cachesToDelete);
        
        // Delay cleanup to ensure smooth transition
        setTimeout(async () => {
          console.log('🗑️ Starting delayed cache cleanup...');
          await Promise.all(
            cachesToDelete.map(cacheName => {
              console.log('🗑️ Deleting old cache:', cacheName, {
                reason: 'version-outdated',
                current: BUILD_HASH,
                previous: previousVersionHash
              });
              return caches.delete(cacheName);
            })
          );
          console.log('✅ Cache cleanup completed');
        }, 5000); // 5 second delay
      } else {
        console.log('✅ No old caches to clean up');
      }
      
      // Take control of all clients
      await self.clients.claim();
      
      // Notify clients (but don't force reload)
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        console.log('📡 Notifying client of activation');
        client.postMessage({ 
          type: 'SW_ACTIVATED',
          cacheVersion: CACHE_NAME,
          buildHash: BUILD_HASH,
          previousVersion: previousVersionHash,
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

/**
 * Fetch with multi-level fallback strategy
 * 1. Try network
 * 2. Try versioned cache
 * 3. Try critical persistent cache
 * 4. Return offline response
 */
async function fetchWithFallback(request, offlineResponse) {
  try {
    // Attempt network fetch
    return await fetch(request);
  } catch (networkError) {
    console.log('🔄 Network failed, trying caches for:', request.url);
    
    // Try all versioned caches (current + previous)
    const allCaches = await caches.keys();
    for (const cacheName of allCaches) {
      if (cacheName.startsWith('taskflow-')) {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);
        if (cached) {
          console.log('✅ Found in cache:', cacheName);
          return cached;
        }
      }
    }
    
    // Last resort: try critical persistent cache
    const criticalCache = await caches.open(CRITICAL_CACHE);
    const criticalCached = await criticalCache.match(request);
    if (criticalCached) {
      console.log('✅ Found in critical cache');
      return criticalCached;
    }
    
    // Return offline response as final fallback
    console.warn('❌ No cache found, returning offline response');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
}

// Cache-first strategy with fallback
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
    // Use multi-level fallback
    const offlineResponse = await caches.match('/offline.html');
    return fetchWithFallback(request, offlineResponse || new Response('Offline', { status: 503 }));
  }
}

// Network-first strategy with fallback
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
    
    // Try critical cache for important assets
    const criticalCache = await caches.open(CRITICAL_CACHE);
    const criticalCached = await criticalCache.match(request);
    if (criticalCached) {
      console.log('✅ Found in critical cache (network-first fallback)');
      return criticalCached;
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