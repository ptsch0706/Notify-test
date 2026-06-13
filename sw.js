// sw.js — Notify Test service worker
const CACHE = 'notify-test-v1';
const ASSETS = ['/Notify-test/', '/Notify-test/index.html'];


self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Handle push events (for future server-sent pushes)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Notify Test', body: 'Push received.' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'Notify Test', {
      body: data.body || 'Push received.',
      icon: '/icon.png',
      badge: '/icon.png',
      tag: 'push-notif',
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});
