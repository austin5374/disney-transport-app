// Offline for an app that is used in a queue
//
// Every byte of this app's data is static: the route graph, the line
// definitions, and a status engine that computes from a hash of the wall
// clock. Nothing here needs a network, which makes "works with the antenna
// off" a feature rather than a limitation — and it is exactly the condition
// the app is for. Park wifi at 2pm is not a network.
//
// Navigations are network-first so a deploy is picked up on the next visit
// rather than being pinned behind a stale cache; everything else is
// cache-first, since the bundle and font filenames carry content hashes.

const CACHE = 'wdw-transport-v2';
const SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function cachePut(request, response) {
  if (!response || !response.ok || response.type === 'opaque') return response;
  const copy = response.clone();
  caches.open(CACHE).then(cache => cache.put(request, copy));
  return response;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => cachePut(request, response))
        .catch(() => caches.match('/index.html').then(hit => hit || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(hit =>
      hit || fetch(request).then(response => cachePut(request, response))
    )
  );
});
