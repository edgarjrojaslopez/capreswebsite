// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      'www.flickr.com',
      'farm8.staticflickr.com',
      'c1.staticflickr.com',
      'flickr.com',
    ],
  },
};

export default nextConfig;
