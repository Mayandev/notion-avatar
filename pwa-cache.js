// Keep page HTML, SSR JSON and private responses on the network. Public assets
// are cached on demand instead of downloading every editor option at install.
module.exports = [
  {
    urlPattern: ({ request, url }) =>
      request.mode === 'navigate' ||
      (url.origin === self.location.origin &&
        (url.pathname.startsWith('/api/') ||
          url.pathname.startsWith('/_next/data/') ||
          (url.pathname === '/_next/image' &&
            (url.searchParams.get('url') || '').includes(
              '/storage/v1/object/sign/',
            )))),
    handler: 'NetworkOnly',
    method: 'GET',
  },
  {
    urlPattern: ({ url }) =>
      url.origin === self.location.origin &&
      url.pathname.startsWith('/_next/static/'),
    handler: 'CacheFirst',
    options: {
      cacheName: 'versioned-assets-v2',
      cacheableResponse: { statuses: [200] },
      expiration: { maxEntries: 64, maxAgeSeconds: 365 * 24 * 60 * 60 },
    },
  },
  {
    urlPattern: ({ url }) =>
      (url.origin === self.location.origin &&
        (/^\/(avatar|icon|image|fonts|favicon)\//.test(url.pathname) ||
          url.pathname === '/logo.gif' ||
          url.pathname === '/_next/image')) ||
      (url.hostname === 'uclqvnpqvartezdtmgpn.supabase.co' &&
        url.pathname.startsWith('/storage/v1/object/public/static-resource/')),
    handler: 'CacheFirst',
    options: {
      cacheName: 'public-assets-v2',
      cacheableResponse: { statuses: [200] },
      expiration: { maxEntries: 256, maxAgeSeconds: 24 * 60 * 60 },
    },
  },
];
