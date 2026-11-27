const CACHE_NAME = 'yoexisto-shell-v2';
const OLD_CACHE_NAME = 'goodmorning-shell-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([caches.delete(OLD_CACHE_NAME), self.clients.claim()]));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('authorization')) return;
  if (/\/(?:api|auth)\//.test(url.pathname) || /\/(?:availability|version)\.json$/.test(url.pathname)) return;

  const fetchAndCache = async () => {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  };
  if (request.mode === 'navigate' || url.pathname.endsWith('/manifest.webmanifest')) {
    event.respondWith(fetchAndCache().catch(async () => (await caches.match(request)) || Response.error()));
  } else {
    event.respondWith(caches.match(request).then(cached => cached || fetchAndCache()));
  }
});
