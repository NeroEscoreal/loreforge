const CACHE_NAME = 'loreforge-v3';
const SHELL = ['index.html', 'manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API calls - network only, no cache
  if (url.hostname === 'api.groq.com' || url.hostname === 'openrouter.ai') return;

  // Image generation - cache after first fetch
  if (url.hostname === 'image.pollinations.ai') {
    e.respondWith(
      caches.open(CACHE_NAME).then(c =>
        c.match(e.request).then(r => r || fetch(e.request).then(resp => {
          c.put(e.request, resp.clone());
          return resp;
        })).catch(() => new Response('', { status: 408 }))
      )
    );
    return;
  }

  // App shell - stale while revalidate
  e.respondWith(
    caches.match(e.request).then(r => {
      const fetchPromise = fetch(e.request).then(resp => {
        caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone()));
        return resp;
      }).catch(() => r);
      return r || fetchPromise;
    })
  );
});
