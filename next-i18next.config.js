const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'zh-TW', 'ko', 'ja', 'es', 'fr', 'de', 'ru', 'pt'],
  },
  localePath: path.join(process.cwd(), 'public', 'locales'),
};
