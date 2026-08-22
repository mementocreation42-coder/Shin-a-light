import { readFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

/**
 * タイトル文字だけで作るアイキャッチ（1200×630）。
 * 下書きにアイキャッチが無いとき、仮で入れておくために使う。
 * フォントはリポジトリ同梱の Noto Sans JP Bold なので、本番（Vercel）でも豆腐にならない。
 */

const WIDTH = 1200;
const HEIGHT = 630;
const BG = '#16171a';
const ACCENT = '#ff764d';
const FG = '#f4f1ec';
const MUTED = '#8a8f98';

let fontCache: Promise<ArrayBuffer> | null = null;
function loadFont(): Promise<ArrayBuffer> {
  if (!fontCache) {
    fontCache = readFile(path.join(process.cwd(), 'lib/eyecatch/fonts/NotoSansJP-Bold.ttf')).then(
      (buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    );
  }
  return fontCache;
}

// 文字数で段階的に縮める（1200px幅に 2〜4 行で収まる目安）
function fontSizeFor(title: string): number {
  const n = [...title].length;
  if (n <= 14) return 84;
  if (n <= 24) return 68;
  if (n <= 40) return 56;
  return 46;
}

// satori は React 無しでも素のオブジェクトを受け付ける
type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: Node[] | string): Node => ({
  type,
  props: { style, children },
});

export interface EyecatchOptions {
  /** 右下に小さく出す補足（日付など）。省略可 */
  caption?: string;
  /** 左上のラベル。既定は "SAL JOURNAL" */
  label?: string;
}

/** 出力形式。WAF に弾かれたとき、バイト列の違う別形式で再送するために選べるようにしてある */
export type EyecatchFormat = 'jpeg' | 'png' | 'webp';

export const EYECATCH_MIME: Record<EyecatchFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export async function generateTitleEyecatch(
  title: string,
  opts: EyecatchOptions = {},
  format: EyecatchFormat = 'jpeg'
): Promise<Buffer> {
  const fontData = await loadFont();
  const label = opts.label ?? 'SAL JOURNAL';
  const fontSize = fontSizeFor(title);

  const tree = el(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px',
      backgroundColor: BG,
      color: FG,
      fontFamily: 'Noto Sans JP',
    },
    [
      el('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
        el('div', { width: 14, height: 14, backgroundColor: ACCENT, borderRadius: 7 }),
        el('div', { fontSize: 26, letterSpacing: 4, color: MUTED }, label),
      ]),
      el(
        'div',
        {
          fontSize,
          lineHeight: 1.35,
          fontWeight: 700,
          // 長いタイトルでも枠からはみ出さないよう 4 行で切る
          display: 'block',
          lineClamp: 4,
          overflow: 'hidden',
          wordBreak: 'normal',
        },
        title
      ),
      el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }, [
        el('div', { width: 160, height: 6, backgroundColor: ACCENT }),
        el('div', { fontSize: 24, color: MUTED, letterSpacing: 2 }, opts.caption ?? 'shinealight.jp'),
      ]),
    ]
  );

  const svg = await satori(tree as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [{ name: 'Noto Sans JP', data: fontData, weight: 700, style: 'normal' }],
  });

  // 文字はアウトライン化済みの SVG なので、ラスタライズにフォントは要らない
  // mozjpeg 出力は WP 側の WAF（SiteGuard）に弾かれたことがあるので使わない
  const img = sharp(Buffer.from(svg));
  if (format === 'png') return img.png().toBuffer();
  if (format === 'webp') return img.webp({ quality: 90 }).toBuffer();
  return img.jpeg({ quality: 86 }).toBuffer();
}
