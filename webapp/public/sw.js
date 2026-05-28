// Basic Service Worker to enable WebAPK installation on Android
// This satisfies Chrome's requirement for a fetch handler to consider the PWA "installable" without the Chrome badge.

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Take control of all clients immediately
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // We don't need offline support for now, just pass through.
  // The mere presence of this fetch listener makes Android happy to install the WebAPK.
  e.respondWith(fetch(e.request).catch(() => new Response("Offline")));
});
