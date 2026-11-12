// Service worker : permet à l'appli de fonctionner hors ligne.
// Stratégie "réseau d'abord" : si Internet est dispo, on prend la dernière version
// (donc les mises à jour GitHub arrivent), sinon on sert la copie en cache.
const CACHE = 'contree-v2';
const FILES = ['./', './index.html', './manifest.json', './icon.png', './icon-192.png', './icon-180.png'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const copy = response.clone();
                caches.open(CACHE).then(cache => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
});
