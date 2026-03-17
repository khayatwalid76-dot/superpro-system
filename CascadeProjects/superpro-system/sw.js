// Service Worker - SUPER_PRO SYSTEM
// Bump this to force clients to get latest app shell
const CACHE_NAME = 'superpro-v3';
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
    const url = new URL(event.request.url);

    // Network-first for navigations (HTML) to avoid serving stale UI that breaks buttons/data.
    const isNavigation = event.request.mode === 'navigate';
    const isHtml = url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
    if (isNavigation || isHtml) {
        event.respondWith((async () => {
            try {
                const fresh = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, fresh.clone());
                return fresh;
            } catch (e) {
                const cached = await caches.match(event.request);
                return cached || caches.match('./index.html');
            }
        })());
        return;
    }

    // Cache-first for other GET requests
    event.respondWith((async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        const fresh = await fetch(event.request);
        try {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, fresh.clone());
        } catch (e) {}
        return fresh;
    })());
});
