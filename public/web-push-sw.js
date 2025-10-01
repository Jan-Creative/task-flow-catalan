// Legacy shim Service Worker to avoid 404s and migrate to /sw-advanced.js
// This SW does nothing by design and will be unregistered by the app on load.

self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Take control of existing clients to allow the app to clean up and register the correct SW
    try {
      await self.clients.claim();
    } catch (e) {
      // no-op
    }
  })());
});

// No fetch/push handlers here to stay inert.
// The application will register /sw-advanced.js and unregister this shim.