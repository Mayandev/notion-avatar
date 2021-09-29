const { i18n } = require('./next-i18next.config');
const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

module.exports = withPWA(
  {
    i18n,
    reactStrictMode: true,
    pwa: {
      dest: 'public',
      runtimeCaching,
    },
    webpack: config => {
      config.module.rules.push({
        test: /\.svg$/,
        use: 'raw-loader',
      });
      return config;
    },
  }
);
