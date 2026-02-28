// SUPER_PRO SYSTEM Service Worker
// Version 2.0.0

const CACHE_NAME = 'superpro-v2.1.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
    console.log('🚀 Installing Service Worker');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker installed');
                return self.skipWaiting();
            })
    );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
    console.log('🔄 Activating Service Worker');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activated');
            return self.clients.claim();
        })
    );
});

// استراتيجية التخزين
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // تجاهل طلبات Firebase API
    if (url.hostname.includes('firebaseio.com') || url.hostname.includes('googleapis.com')) {
        event.respondWith(fetch(request));
        return;
    }
    
    // استراتيجية Cache First للملفات الثابتة
    if (request.destination === 'script' || 
        request.destination === 'style' || 
        request.destination === 'image' ||
        request.destination === 'font') {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request).then(response => {
                        // تخزين الملفات الجديدة
                        if (response.ok) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    });
                })
        );
        return;
    }
    
    // استراتيجية Network First للصفحات
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // تخزين الصفحة الرئيسية
                    if (response.ok && request.url.includes('/index.html')) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // العودة للنسخة المخزنة عند الفشل
                    return caches.match('/index.html');
                })
        );
        return;
    }
    
    // للطلبات الأخرى، استخدم Network
    event.respondWith(fetch(request));
});

// مزامنة في الخلفية
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Background sync triggered');
        event.waitUntil(
            // هنا يمكن إضافة منطق المزامنة
            Promise.resolve()
        );
    }
});

// Push Notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'تحديث جديد في SUPER_PRO SYSTEM',
        icon: '/data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl80XzQiIi8+CjxwYXRoIGQ9Ik05NiA0OEM2Ni44IDQ4IDQ4IDY2LjggNDggOTZTNjYuOCAxNDQgOTYgMTQ0UzE0NCAxMjUuMiAxNDQgOTZTMTI1LjIgNDggOTYgNDhaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODAgNzJIMTEyVjEyMEg4MFY3MloiIGZpbGw9IiMyYzNlNTAiLz4KPHBhdGggZD0iTTg4IDg4SDEwNFYxMDRIOThWODhaIiBmaWxsPSIjMzQ5OGRiIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfNF80IiB4MT0iMCIgeTE9IjAiIHgyPSIxOTIiIHkyPSIxOTIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzJjM2U1MCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzNDk4ZGIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=',
        badge: '/data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzYiIGN5PSIzNiIgcj0iMzYiIGZpbGw9IiMzNDk4ZGIiLz4KPHBhdGggZD0iTTI0IDI0SDQ4VjQ4SDI0VjI0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'فتح التطبيق',
                icon: '/data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMyOGE3NDUiLz4KPHBhdGggZD0iTTEwIDEwSDIyVjIySDEwVjEwWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+'
            },
            {
                action: 'close',
                title: 'إغلاق',
                icon: '/data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNkYzM1NDUiLz4KPHBhdGggZD0iTTEyIDEyTDIwIDIwTTIwIDEyTDEyIDIwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('SUPER_PRO SYSTEM', options)
    );
});

// التعامل مع نقرات الإشعارات
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('🚀 SUPER_PRO Service Worker loaded');
