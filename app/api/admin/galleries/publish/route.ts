import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { isAdminAuthed } from '@/lib/adminAuth';
import { setAppSetting } from '@/lib/appSettings';
import { galleryPublishedKey, loadGallery } from '@/lib/gallery';
import {
  createWPPost,
  getOrCreateGalleryCategoryId,
  getOrCreateMementoTagId,
  uploadMedia,
  WP_CACHE_TAGS,
} from '@/lib/wordpress';

export const dynamic = 'force-dynamic';
// 写真を WP に上げるので少し長めに
export const maxDuration = 60;

/**
 * お渡しギャラリー（/g/<token>）の写真を、サイトの作例（/photos の MEMENTO）に公開する。
 * 原寸 JPEG を WP のメディアに上げ、gallery カテゴリ＋memento タグの投稿を作る。
 * 公開した写真 id は app_settings に記録し、管理画面で「公開済み」と出す。
 *
 * body: { token: string; photoIds: string[] }
 */
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { token?: string; photoIds?: string[] } | null;
  const token = body?.token ?? '';
  const ids = Array.isArray(body?.photoIds) ? body!.photoIds.map(String) : [];
  const g = await loadGallery(token);
  if (!g) return NextResponse.json({ error: 'ギャラリーが見つかりません' }, { status: 404 });
  if (ids.length === 0) return NextResponse.json({ error: '写真を選んでください' }, { status: 400 });

  const already = new Set(g.published ?? []);
  const targets = g.photos.filter((p) => ids.includes(p.id) && !already.has(p.id));
  if (targets.length === 0) {
    return NextResponse.json({ ok: true, published: [...already], added: [] });
  }

  const [categoryId, mementoTagId] = await Promise.all([
    getOrCreateGalleryCategoryId(),
    getOrCreateMementoTagId(),
  ]);

  const added: string[] = [];
  const errors: string[] = [];
  for (const p of targets) {
    try {
      const bytes = await readOriginal(p.orig.jpg);
      const filename = `memento-${g.token.slice(0, 6)}-${p.id}.jpg`;
      const media = await uploadMedia(new File([bytes], filename, { type: 'image/jpeg' }), filename);
      await createWPPost({
        // キャプションは撮影地。個人名は出さない
        title: g.place,
        content: '<!-- gallery photo -->',
        status: 'publish',
        categories: [categoryId],
        tags: [mementoTagId],
        featured_media: media.id,
        date: `${g.date}T12:00:00`,
      });
      added.push(p.id);
    } catch (error) {
      console.error('[galleries/publish]', p.id, error);
      errors.push(p.id);
    }
  }

  const published = [...already, ...added];
  await setAppSetting(galleryPublishedKey(g.token), JSON.stringify(published));

  revalidatePath('/photos');
  revalidatePath('/admin/galleries');
  revalidateTag(WP_CACHE_TAGS.adminGallery, 'max');

  return NextResponse.json({ ok: errors.length === 0, published, added, errors });
}

/**
 * 原本 JPEG の中身を取る。
 * 手元・ビルド環境では public/ から直接読み、Vercel の関数では public/ が同梱されないので
 * 公開 URL から取り直す（/g/<token>/o/ は推測不能なファイル名で静的配信されている）。
 */
async function readOriginal(publicPath: string): Promise<ArrayBuffer> {
  try {
    const buf = await readFile(join(process.cwd(), 'public', publicPath));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.shinealight.jp';
    const res = await fetch(`${base}${publicPath}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`原本を取得できません: ${publicPath} (${res.status})`);
    return await res.arrayBuffer();
  }
}
