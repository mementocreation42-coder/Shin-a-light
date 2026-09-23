import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getAppSetting } from '@/lib/appSettings';

/** 撮ってあげた人に渡す限定ギャラリー。data/galleries/<token>.json */
export interface GalleryPhoto {
  id: string;
  w: number;
  h: number;
  preview: { avif: string; jpg: string; w: number; h: number };   // 無料（クレジット入り、1200px）
  orig: { avif: string; jpg: string; w: number; h: number };      // 購入で解放（10bit P3 AVIF ＋ 原寸 JPEG）
}
export interface Gallery {
  token: string;
  title: string;
  place: string;
  date: string;              // YYYY-MM-DD
  credit: string;            // 例: "Photo: Daisuke Kobayashi / Shine a Light"
  price: { currency: 'usd'; single: number; all: number };   // 単位: ドル
  unlockKey: string;         // Stripe を使わない解放用（現金・PayPal のあと本人が渡す）。URL の ?unlock=
  /** true なら原本も無料で配る（購入ボタンを出さない）。JSON の値を DB の設定で上書きできる */
  free?: boolean;
  /** サイトの作例（/photos の MEMENTO）に公開済みの写真 id。管理画面の「サイトに公開」で増える（DB に保存） */
  published?: string[];
  photos: GalleryPhoto[];
  created: string;
}

const dir = () => join(process.cwd(), 'data', 'galleries');

/** 管理画面から切り替えた「無料配布」の設定キー。'1' で無料、'0' で有料に戻す */
export const galleryFreeKey = (token: string) => `gallery_free:${token}`;
/** サイトに公開済みの写真 id（JSON 配列）の設定キー */
export const galleryPublishedKey = (token: string) => `gallery_published:${token}`;

/** JSON の free を DB 側の設定で上書きする（本番はファイルを書き換えられないため） */
async function applyOverrides(g: Gallery): Promise<Gallery> {
  const [free, published] = await Promise.all([
    getAppSetting(galleryFreeKey(g.token)),
    getAppSetting(galleryPublishedKey(g.token)),
  ]);
  const out: Gallery = { ...g };
  if (free === '1') out.free = true;
  if (free === '0') out.free = false;
  if (published) {
    try {
      const ids = JSON.parse(published);
      if (Array.isArray(ids)) out.published = ids.map(String);
    } catch { /* 壊れていれば未公開扱い */ }
  }
  return out;
}

async function readGalleryFile(file: string): Promise<Gallery | null> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as Gallery;
  } catch {
    return null;
  }
}

export async function loadGallery(token: string): Promise<Gallery | null> {
  if (!/^[a-z0-9]{10,}$/i.test(token)) return null;
  const g = await readGalleryFile(join(dir(), `${token}.json`));
  return g ? applyOverrides(g) : null;
}

/** data/galleries/*.json をすべて読み、作成日の新しい順で返す（管理画面の一覧用） */
export async function listGalleries(): Promise<Gallery[]> {
  let files: string[] = [];
  try {
    files = (await readdir(dir())).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  const galleries = await Promise.all(files.map((f) => readGalleryFile(join(dir(), f))));
  const withOverrides = await Promise.all(galleries.filter((g): g is Gallery => g !== null).map(applyOverrides));
  return withOverrides.sort((a, b) => (b.created || b.date).localeCompare(a.created || a.date));
}
