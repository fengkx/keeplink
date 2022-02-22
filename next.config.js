const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});
const withPWA = require('next-pwa');
module.exports = withBundleAnalyzer(
  withPWA({
    webpack: (config) => {
      if (process.env.ANALYZE === 'true') {
        config.plugins.push(new DuplicatePackageCheckerPlugin());
      }

      return config;
    },
    future: {
      webpack5: true
    },
    swcMinify: true,
    pwa: {
      dest: 'public',
      runtimeCaching: require('./pwa-runtime-cache')
    }
  })
);
