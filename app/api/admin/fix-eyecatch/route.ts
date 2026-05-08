import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { fetchOGP } from '@/lib/ogp';
import { uploadMedia, updateWPPost } from '@/lib/wordpress';

const WP_BASE = 'https://journal.shinealight.jp';
const WP_REST_BASE = `${WP_BASE}/index.php?rest_route=/wp/v2`;

function authHeader(): string {
  const user = process.env.WORDPRESS_APP_USERNAME!;
  const pass = process.env.WORDPRESS_APP_PASSWORD!;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

function extractNoteUrl(html: string): string | null {
  const match = html.match(/https:\/\/note\.com\/[^\s"'<>]+/);
  return match?.[0] ?? null;
}

async function fetchAllPostsWithoutEyecatch(): Promise<{ id: number; content: string }[]> {
  const results: { id: number; content: string }[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch(
      `${WP_REST_BASE}/posts&page=${page}&per_page=100&status=publish&_fields=id,content,featured_media`,
      { headers: { Authorization: authHeader() }, cache: 'no-store' }
    );
    if (!res.ok) break;

    const posts = await res.json();
    totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);

    for (const post of posts) {
      if (!post.featured_media || post.featured_media === 0) {
        results.push({ id: post.id, content: post.content?.rendered ?? '' });
      }
    }
    page++;
  }

  return results;
}

export async function POST() {
  const cookieStore = await cookies();
  if (cookieStore.get('sal_admin_auth')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const posts = await fetchAllPostsWithoutEyecatch();

  const results: { id: number; status: 'ok' | 'skip' | 'error'; reason?: string }[] = [];

  for (const post of posts) {
    const noteUrl = extractNoteUrl(post.content);
    if (!noteUrl) {
      results.push({ id: post.id, status: 'skip', reason: 'no note URL' });
      continue;
    }

    try {
      const ogp = await fetchOGP(noteUrl);
      if (!ogp?.image) {
        results.push({ id: post.id, status: 'skip', reason: 'no OGP image' });
        continue;
      }

      const imgRes = await fetch(ogp.image, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
      });
      if (!imgRes.ok) throw new Error(`image fetch failed: ${imgRes.status}`);

      const buffer = await imgRes.arrayBuffer();
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
      const filename = `note-eyecatch-${Date.now()}.${ext}`;
      const file = new File([buffer], filename, { type: contentType });

      const media = await uploadMedia(file, filename);
      await updateWPPost(post.id, { featured_media: media.id });

      results.push({ id: post.id, status: 'ok' });
    } catch (e: unknown) {
      results.push({ id: post.id, status: 'error', reason: e instanceof Error ? e.message : 'unknown' });
    }
  }

  revalidatePath('/', 'layout');

  return NextResponse.json({
    total: posts.length,
    ok: results.filter((r) => r.status === 'ok').length,
    skip: results.filter((r) => r.status === 'skip').length,
    error: results.filter((r) => r.status === 'error').length,
    results,
  });
}
