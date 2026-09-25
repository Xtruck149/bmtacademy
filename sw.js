/* ==========================================================
   Service Worker — BMT Green Academy
   Site 100% statique (GitHub Pages), aucune dépendance backend.

   Stratégies :
   - Pages HTML et données JSON : réseau d'abord, repli sur le cache,
     puis sur offline.html si la page n'a jamais été consultée.
   - CSS / JS : stale-while-revalidate — réponse immédiate depuis le
     cache ET mise à jour en arrière-plan, pour que chaque déploiement
     atteigne les visiteurs réguliers dès la visite suivante (l'ancien
     cache-first figeait style.css / main.js jusqu'au changement de nom
     du cache).
   - Images / polices : cache d'abord, cache plafonné (MAX_MEDIA).
   - Vidéo et requêtes Range : jamais interceptées (streaming natif).

   ⚠ Incrémentez CACHE_VERSION à chaque déploiement qui modifie la
   liste PRECACHE ou pour forcer une purge complète.
   ========================================================== */
const CACHE_VERSION = 'v5';
const PAGES = `bmt-pages-${CACHE_VERSION}`;
const ASSETS = `bmt-assets-${CACHE_VERSION}`;
const MEDIA = `bmt-media-${CACHE_VERSION}`;
const MAX_MEDIA = 120;

const PRECACHE = [
  './',
  'index.html',
  'offline.html',
  'assets/css/style.css',
  'assets/js/main.js',
  'assets/img/logo.png',
  'assets/img/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGES)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set([PAGES, ASSETS, MEDIA]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.has(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const cacheable = res => res && res.ok && res.type === 'basic';

async function put(cacheName, req, res) {
  if (!cacheable(res)) return;
  const cache = await caches.open(cacheName);
  await cache.put(req, res);
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map(k => cache.delete(k)));
}

async function networkFirst(event, cacheName, fallbackUrl) {
  const { request } = event;
  try {
    const res = await fetch(request);
    event.waitUntil(put(cacheName, request, res.clone()));
    return res;
  } catch {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (fallbackUrl) return caches.match(fallbackUrl);
    return Response.error();
  }
}

async function staleWhileRevalidate(event) {
  const { request } = event;
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(res => { event.waitUntil(put(ASSETS, request, res.clone())); return res; })
    .catch(() => cached);
  return cached || network;
}

async function cacheFirst(event) {
  const { request } = event;
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  event.waitUntil(put(MEDIA, request, res.clone()).then(() => trim(MEDIA, MAX_MEDIA)));
  return res;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  if (/\.(mp4|webm|mov)$/i.test(path)) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(event, PAGES, new URL('offline.html', self.registration.scope).href));
  } else if (/\.json$/i.test(path)) {
    event.respondWith(networkFirst(event, ASSETS));
  } else if (/\.(css|js)$/i.test(path)) {
    event.respondWith(staleWhileRevalidate(event));
  } else if (/\.(png|jpe?g|webp|avif|svg|gif|ico|woff2?|ttf)$/i.test(path)) {
    event.respondWith(cacheFirst(event));
  }
});
