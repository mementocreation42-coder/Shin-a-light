import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'journal.shinealight.jp',
      },
      {
        protocol: 'https',
        hostname: 'assets.st-note.com',
      },
    ],
  },
};

export default nextConfig;
