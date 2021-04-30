const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  webpack: (config) => {
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(new DuplicatePackageCheckerPlugin());
    }

    return config;
  },
  future: {
    webpack5: true
  }
});
