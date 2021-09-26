module.exports = {
  reactStrictMode: true,
  webpack: config => {
    config.module.rules.push({
      test: /\.svg$/,
      use: 'raw-loader',
    });

    return config;
  },
};
