import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      // Add domains you'll load images from
      'localhost',
    ],
  },
  // Enable experimental features as needed
  experimental: {
    // serverActions: true,
  },
};

export default nextConfig;
