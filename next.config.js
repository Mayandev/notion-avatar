const runtimeCaching = require('./pwa-cache');
const { i18n } = require('./next-i18next.config');

const withPWA = require('next-pwa')({
  dest: 'public',
  // Register natively in _app: next-pwa's helper also caches SSR JSON on install.
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching,
  // Cache assets when visited; keep HTML and locale redirects on the network.
  cacheStartUrl: false,
  dynamicStartUrl: false,
  cacheOnFrontEndNav: false,
  reloadOnOnline: false,
  additionalManifestEntries: [{ url: '/manifest.json', revision: null }],
  buildExcludes: [() => true],
  publicExcludes: ['!**/*'],
});

module.exports = withPWA({
  i18n,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24h - 减少 cache miss，降低 Image Transformations 消耗
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uclqvnpqvartezdtmgpn.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'uclqvnpqvartezdtmgpn.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:folder(avatar|icon|image|fonts|favicon)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: '/logo.gif',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        // 为所有路由应用安全头部
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://uclqvnpqvartezdtmgpn.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: 'raw-loader',
    });
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
});
