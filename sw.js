const cacheName = 'loreforge-cache-v2';
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',  // if you separated CSS
  '/script.js',  // if you separated JS
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(filesToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
