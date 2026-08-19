import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 手元の DB（PGlite）は WASM をファイルから読む。バンドルに巻き込まず実行時に require させる
  serverExternalPackages: ['@electric-sql/pglite'],
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
