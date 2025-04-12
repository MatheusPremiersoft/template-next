/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      // Add domains you'll load images from
      'images.unsplash.com',
      'localhost',
    ],
  },
  // Enable experimental features as needed
  experimental: {
    // serverActions: true,
  },
};

export default nextConfig;
