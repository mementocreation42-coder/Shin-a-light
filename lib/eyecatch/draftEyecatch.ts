import { stripHtml, uploadMedia } from '@/lib/wordpress';
import { generateTitleEyecatch, EYECATCH_MIME, type EyecatchFormat } from './generate';

/**
 * タイトルだけのアイキャッチ画像を生成して WP にアップロードし、media id を返す。
 * 生成や送信に失敗しても投稿自体は止めたくないので、その場合は 0。
 *
 * lib/wordpress.ts はクライアント側からも import されるため、
 * sharp / fs に触るこの処理はサーバー専用モジュールとして分けてある。
 */
export async function createTitleEyecatchMedia(title: string): Promise<number> {
  const plain = stripHtml(title);
  // WP 前段の WAF（SiteGuard）が画像のバイト列を誤検知して 403 を返すことがある。
  // 形式を変えるとバイト列が丸ごと変わるので、弾かれたら別形式で送り直す
  const formats: EyecatchFormat[] = ['jpeg', 'png', 'webp'];
  let lastError: unknown = null;
  for (const format of formats) {
    try {
      const bytes = await generateTitleEyecatch(plain, {}, format);
      const ext = format === 'jpeg' ? 'jpg' : format;
      const mime = EYECATCH_MIME[format];
      const file = new File([new Uint8Array(bytes)], `title-eyecatch.${ext}`, { type: mime });
      const media = await uploadMedia(file, `title-eyecatch-${Date.now()}.${ext}`);
      return media.id;
    } catch (error) {
      lastError = error;
      // 403（WAF）以外はやり直しても無駄なので打ち切る
      if (!String(error).includes('Forbidden')) break;
    }
  }
  console.error('title eyecatch generation failed:', lastError);
  return 0;
}

/** 下書きでアイキャッチ未指定なら、タイトルから仮画像を作って media id を返す。それ以外は指定値のまま */
export async function resolveDraftEyecatch(
  status: 'publish' | 'draft',
  featuredMedia: number | undefined,
  title: string
): Promise<number | undefined> {
  if (status !== 'draft' || featuredMedia || !title.trim()) return featuredMedia;
  return (await createTitleEyecatchMedia(title)) || featuredMedia;
}
