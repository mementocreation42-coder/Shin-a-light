import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 手元の DB（PGlite）は WASM をファイルから読む。バンドルに巻き込まず実行時に require させる
  // satori は harfbuzz の wasm をファイルから読むので、同じくバンドルさせない
  serverExternalPackages: ['@electric-sql/pglite', 'sharp', 'satori'],
  // 親ディレクトリにも lockfile があり、ルートを取り違えるのを防ぐ
  turbopack: { root: process.cwd() },
  // 仮アイキャッチ生成用のフォントを、本番のサーバー関数にも同梱する
  outputFileTracingIncludes: {
    '/api/admin/posts': ['./lib/eyecatch/fonts/**'],
  },
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
