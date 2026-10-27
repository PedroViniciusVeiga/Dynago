// Dynago service worker
// - Arquivos do app: busca a versão mais nova quando há internet e usa a cópia salva offline.
// - Biblioteca do Supabase (CDN com versão fixa): usa a cópia salva quando existir.
// - Chamadas ao Supabase (login e dados) nunca passam pelo cache.
// - Aviso de fim do descanso: o app avisa o horário e o service worker mostra a notificação
//   se o Dynago não estiver aberto na tela.
const CACHE = 'dynago-v3';
const FILES = ['./', './index.html', './config.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
const CDN = 'https://cdn.jsdelivr.net/';

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.startsWith(CDN)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});

// Aviso de fim do descanso
let restTimer = null, restRelease = null;
function cancelRest() {
  if (restTimer) { clearTimeout(restTimer); restTimer = null; }
  if (restRelease) { restRelease(); restRelease = null; }
}
self.addEventListener('message', e => {
  const m = e.data || {};
  if (m.type !== 'rest' && m.type !== 'cancel') return;
  cancelRest();
  if (m.type !== 'rest') return;
  const wait = Math.max(0, m.end - Date.now());
  e.waitUntil(new Promise(resolve => {
    restRelease = resolve;
    restTimer = setTimeout(async () => {
      restTimer = null;
      try {
        const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        if (!wins.some(c => c.visibilityState === 'visible')) {
          await self.registration.showNotification(m.title || 'Descanso terminado', {
            body: m.body || '', tag: 'dynago-rest', renotify: true,
            icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', vibrate: [300, 120, 300]
          });
        }
      } catch (err) {}
      restRelease = null; resolve();
    }, wait);
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
