// Service Worker - SUPER_PRO SYSTEM
// GitHub Pages runs under a subpath, so use relative cache entries.
const CACHE_NAME = 'superpro-v4';
const APP_SHELL = [
    './',
    './index.html',
    './manifest.json',
    './user-data-full.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const req = event.request;
    const url = new URL(req.url);

    // Network-first for navigations/HTML to avoid serving stale UI.
    const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
    if (isHTML) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
                    return res;
                })
                .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
        );
        return;
    }

    // Cache-first for static assets.
    event.respondWith(
        caches.match(req).then((cached) => cached || fetch(req))
    );
});
