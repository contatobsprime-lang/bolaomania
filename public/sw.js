self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || '⚽ Bolão Copa 2026', {
      body: data.body || 'Você tem um jogo em breve!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'bolao-jogo',
      requireInteraction: true,
      data: { url: '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});