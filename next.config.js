/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: false,
  swcMinify: true,
  basePath: '',
  assetPrefix: '',
  images: {
    loader: 'imgix',
    path: '/',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    config.externals.push('pino-pretty', 'encoding');
    config.module.rules.push({
      test: /HeartbeatWorker\.js$/,
      type: 'javascript/auto', // treat as ESM, not CJS
    });
    return config;
  },
};

module.exports = nextConfig;
