// Retire caches populated by the old generic next-pwa rules. In particular,
// account APIs and SSR JSON must never fall back to another user's response.
self.addEventListener('activate', (event) => {
  const legacyCaches = [
    'apis',
    'others',
    'next-data',
    'cross-origin',
    'start-url',
    'static-image-assets',
    'static-font-assets',
    'next-image',
    'static-js-assets',
    'static-style-assets',
    'static-data-assets',
  ];
  event.waitUntil(Promise.all(legacyCaches.map((name) => caches.delete(name))));
});
