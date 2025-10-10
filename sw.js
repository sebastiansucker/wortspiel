// Service Worker für Wortspiel PWA
const CACHE_NAME = 'wortspiel-v1';
// Build urlsToCache dynamically based on the service worker's scope so the SW
// works correctly when the site is hosted under a subpath like /wortspiel/.
function buildUrlsToCache() {
  const scope = (self.registration && self.registration.scope) ? new URL(self.registration.scope).pathname : '/';
  const base = scope.endsWith('/') ? scope : scope + '/';
  return [
    base,
    base + 'index.html',
    base + 'favicon.svg',
    base + 'icon-192.png',
    base + 'icon-512.png',
    base + 'apple-touch-icon.png',
    base + 'manifest.json'
  ];
}

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Lösche alten Cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});