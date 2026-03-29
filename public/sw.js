const CACHE_NAME = 'schedule-app-v1';
const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/src/main.tsx',
    '/src/App.tsx',
    '/src/index.css',
];

// Install — cache shell app
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(SHELL_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — xóa cache cũ
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-http(s) requests (chrome-extension, etc.)
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Skip Supabase requests — luôn dùng network
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response để cache
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                // Network fail → dùng cache
                return caches.match(event.request).then((response) => {
                    return response || new Response('Offline', { status: 503 });
                });
            })
    );
});

// Push Notification Handlers
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const title = data.title || '⏰ Nhắc nhở';
        const options = {
            body: data.body || 'Bạn có hoạt động sắp bắt đầu',
            icon: data.icon || '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            tag: data.tag || 'slot-notification',
            requireInteraction: false,
            data: {
                url: data.url || '/',
                timestamp: Date.now(),
            },
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (error) {
        console.error('Error showing notification:', error);
    }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});
