import type {NextConfig} from 'next';

const isGithubPages = process.env.GITHUB_PAGES === 'true';
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const normalizedBasePath =
  rawBasePath && rawBasePath !== '/'
    ? rawBasePath.startsWith('/')
      ? rawBasePath.replace(/\/+$/, '')
      : `/${rawBasePath.replace(/\/+$/, '')}`
    : '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    ...(isGithubPages ? {unoptimized: true} : {}),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: isGithubPages ? 'export' : 'standalone',
  ...(isGithubPages
    ? {
        trailingSlash: true,
        ...(normalizedBasePath
          ? {
              basePath: normalizedBasePath,
              assetPrefix: normalizedBasePath,
            }
          : {}),
      }
    : {}),
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
