// Service Worker der Aufträge-App: zeigt Push-Benachrichtigungen an und öffnet beim Antippen
// den passenden Auftrag. Bewusst ohne Zwischenspeicher (kein fetch-Handler), damit neue
// Versionen der App sofort geladen werden.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let daten = {};
  try {
    daten = event.data ? event.data.json() : {};
  } catch {
    daten = { title: 'Neuer Auftrag', body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(daten.title || 'Neuer Auftrag', {
      body: daten.body || '',
      icon: '/app-symbol-192.png',
      badge: '/app-symbol-192.png',
      tag: daten.url || 'auftrag',
      requireInteraction: !!daten.notfall,
      data: { url: daten.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const ziel = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenster) => {
      for (const f of fenster) {
        if ('focus' in f) {
          f.navigate(ziel);
          return f.focus();
        }
      }
      return self.clients.openWindow(ziel);
    }),
  );
});
