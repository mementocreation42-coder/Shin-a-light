import { MEMENTO_TAG_SLUG } from './galleryCategories';

const WP_BASE = 'https://journal.shinealight.jp';
const WP_REST_BASE = `${WP_BASE}/index.php?rest_route=/wp/v2`;

export interface WPPost {
    id: number;
    slug: string;
    date: string;
    modified: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    featured_media: number;
    categories: number[];
    tags?: number[];
    link: string;
}

export interface WPMediaSize {
    source_url: string;
    width: number;
    height: number;
}

export interface WPMedia {
    id: number;
    source_url: string;
    alt_text: string;
    media_details?: {
        width: number;
        height: number;
        sizes?: Record<string, WPMediaSize>;
    };
}

export interface WPCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
}

// Fetch all posts with pagination and optional category filter
export async function getPosts(page = 1, perPage = 12, categoryId?: number): Promise<{ posts: WPPost[]; totalPages: number }> {
    try {
        const listFields = '_fields=id,title,excerpt,date,categories,featured_media,_links,_embedded&_embed=wp:featuredmedia';
        let url = `${WP_REST_BASE}/posts&page=${page}&per_page=${perPage}&${listFields}`;
        if (categoryId) {
            url += `&categories=${categoryId}`;
        } else {
            // ギャラリー専用投稿はジャーナル一覧から除外
            const galleryId = await getGalleryCategoryId();
            if (galleryId) url += `&categories_exclude=${galleryId}`;
        }

        const res = await fetch(
            url,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            console.error('Failed to fetch posts:', res.statusText);
            return { posts: [], totalPages: 0 };
        }

        const posts = await res.json();
        const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);

        return { posts, totalPages };
    } catch (error) {
        console.error('WordPress API connection error:', error);
        return { posts: [], totalPages: 0 };
    }
}

// Fetch all posts without pagination (useful for client-side filtering)
// Uses _fields to minimize payload — content is NOT needed for listing.
export async function getAllPosts(): Promise<WPPost[]> {
    try {
        const perPage = 100; // WP Max is 100
        const page = 1;
        let allPosts: WPPost[] = [];
        let totalPages = 1;

        const listFields = '_fields=id,title,excerpt,date,categories,featured_media,_links,_embedded&_embed=wp:featuredmedia';
        const galleryId = await getGalleryCategoryId();
        const exclude = galleryId ? `&categories_exclude=${galleryId}` : '';

        // Fetch first page to get totalPages
        const firstRes = await fetch(
            `${WP_REST_BASE}/posts&page=${page}&per_page=${perPage}&${listFields}${exclude}`,
            { next: { revalidate: 3600 } }
        );

        if (!firstRes.ok) {
            console.error('Failed to fetch initial posts:', firstRes.statusText);
            return [];
        }

        const firstPosts = await firstRes.json();
        allPosts = [...firstPosts];
        totalPages = parseInt(firstRes.headers.get('X-WP-TotalPages') || '1', 10);

        // Fetch remaining pages in parallel
        if (totalPages > 1) {
            const promises = [];
            for (let i = 2; i <= totalPages; i++) {
                promises.push(
                    fetch(`${WP_REST_BASE}/posts&page=${i}&per_page=${perPage}&${listFields}${exclude}`, {
                        next: { revalidate: 3600 },
                    }).then((res) => (res.ok ? res.json() : []))
                );
            }

            const remainingPages = await Promise.all(promises);
            for (const pagePosts of remainingPages) {
                if (Array.isArray(pagePosts)) {
                    allPosts = [...allPosts, ...pagePosts];
                }
            }
        }

        return allPosts;
    } catch (error) {
        console.error('WordPress API connection error (getAllPosts):', error);
        return [];
    }
}

// Fetch a single post by slug
export async function getPost(slug: string): Promise<WPPost | null> {
    try {
        const res = await fetch(
            `${WP_REST_BASE}/posts&slug=${slug}&_embed`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            return null;
        }

        const posts = await res.json();
        return posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error('WordPress API connection error (getPost):', error);
        return null;
    }
}

// Fetch a single post by ID
export async function getPostById(id: string): Promise<WPPost | null> {
    try {
        const res = await fetch(
            `${WP_REST_BASE}/posts/${id}&_embed`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            return null;
        }

        return res.json();
    } catch (error) {
        console.error('WordPress API connection error (getPostById):', error);
        return null;
    }
}

// Fetch media (featured image) by ID
export async function getMedia(mediaId: number): Promise<WPMedia | null> {
    if (!mediaId) return null;

    try {
        const res = await fetch(
            `${WP_REST_BASE}/media/${mediaId}`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            return null;
        }

        return res.json();
    } catch (error) {
        console.error('WordPress API connection error (getMedia):', error);
        return null;
    }
}

// Fetch all categories
export async function getCategories(): Promise<WPCategory[]> {
    try {
        const res = await fetch(
            `${WP_REST_BASE}/categories`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            return [];
        }

        return res.json();
    } catch (error) {
        console.error('WordPress API connection error (getCategories):', error);
        return [];
    }
}

// Helper to get featured image URL from embedded data
export function getFeaturedImageUrl(post: WPPost & { _embedded?: { 'wp:featuredmedia'?: WPMedia[] } }): string | null {
    const url = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    if (url) {
        // Encode non-ASCII characters (e.g. Japanese filenames) for safe CSS url() use
        return encodeURI(url);
    }
    return null;
}

// Helper to strip HTML tags and decode HTML entities from excerpt
export function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .trim();
}

// ===================================
// ADMIN — authenticated WordPress API
// ===================================

function authHeader(): string {
  const user = process.env.WORDPRESS_APP_USERNAME!;
  const pass = process.env.WORDPRESS_APP_PASSWORD!;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

export interface WPPostAdmin extends WPPost {
  status: 'publish' | 'draft' | 'private';
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[];
    'wp:term'?: Array<Array<WPCategory>>;
  };
}

export async function getAdminPosts(page = 1, perPage = 20): Promise<{
  posts: WPPostAdmin[];
  totalPages: number;
  total: number;
}> {
  const galleryId = await getGalleryCategoryId();
  const exclude = galleryId ? `&categories_exclude=${galleryId}` : '';
  const url = `${WP_REST_BASE}/posts&page=${page}&per_page=${perPage}&_embed&status=publish,draft${exclude}`;
  const res = await fetch(url, {
    headers: { Authorization: authHeader() },
    cache: 'no-store',
  });
  if (!res.ok) return { posts: [], totalPages: 0, total: 0 };
  const posts = await res.json();
  return {
    posts,
    totalPages: parseInt(res.headers.get('X-WP-TotalPages') || '1', 10),
    total: parseInt(res.headers.get('X-WP-Total') || '0', 10),
  };
}

export async function getAdminPostById(id: string): Promise<WPPostAdmin | null> {
  const res = await fetch(`${WP_REST_BASE}/posts/${id}&_embed`, {
    headers: { Authorization: authHeader() },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function createWPPost(data: {
  title: string;
  content: string;
  excerpt?: string;
  date?: string;
  status: 'publish' | 'draft';
  categories?: number[];
  tags?: number[];
  featured_media?: number;
}): Promise<WPPost> {
  const res = await fetch(`${WP_REST_BASE}/posts`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create post failed: ${await res.text()}`);
  return res.json();
}

export async function updateWPPost(id: number, data: {
  title?: string;
  content?: string;
  excerpt?: string;
  date?: string;
  status?: 'publish' | 'draft';
  categories?: number[];
  tags?: number[];
  featured_media?: number;
}): Promise<WPPost> {
  const res = await fetch(`${WP_REST_BASE}/posts/${id}`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Update post failed: ${await res.text()}`);
  return res.json();
}

export async function deleteWPPost(id: number): Promise<void> {
  const res = await fetch(`${WP_REST_BASE}/posts/${id}&force=true&_method=DELETE`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'X-HTTP-Method-Override': 'DELETE' },
  });
  if (!res.ok) throw new Error(`Delete post failed: ${await res.text()}`);
}

export async function uploadMedia(file: File, filename: string): Promise<WPMedia> {
  const buffer = await file.arrayBuffer();
  const res = await fetch(`${WP_REST_BASE}/media`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Type': file.type || 'image/jpeg',
      // SiteGuard等のWAFがライブラリ経由(UAなし)のリクエストを弾く場合の緩和策
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`);
  return res.json();
}

// ===================================
// PHOTO GALLERY — dedicated "gallery" category
// ===================================

export const GALLERY_CATEGORY_SLUG = 'gallery';

let _galleryCatId: number | null = null;

// Resolve the gallery category id (read-only). Cached in-process + via fetch cache.
export async function getGalleryCategoryId(): Promise<number | null> {
    if (_galleryCatId) return _galleryCatId;
    try {
        // カテゴリ未作成→作成後の遷移を確実に反映するためキャッシュしない。
        // 成功したidはモジュール変数に memo するので追加リクエストは最小限。
        const res = await fetch(
            `${WP_REST_BASE}/categories&slug=${GALLERY_CATEGORY_SLUG}&_fields=id`,
            { cache: 'no-store' }
        );
        if (!res.ok) return null;
        const cats = await res.json();
        if (Array.isArray(cats) && cats[0]?.id) {
            _galleryCatId = cats[0].id as number;
            return _galleryCatId;
        }
        return null;
    } catch (error) {
        console.error('WordPress API error (getGalleryCategoryId):', error);
        return null;
    }
}

// Resolve or create the gallery category (authenticated, admin use only).
export async function getOrCreateGalleryCategoryId(): Promise<number> {
    const existing = await getGalleryCategoryId();
    if (existing) return existing;
    const res = await fetch(`${WP_REST_BASE}/categories`, {
        method: 'POST',
        headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Gallery', slug: GALLERY_CATEGORY_SLUG }),
    });
    if (!res.ok) throw new Error(`Create gallery category failed: ${await res.text()}`);
    const cat = await res.json();
    _galleryCatId = cat.id as number;
    return _galleryCatId;
}

// --- MEMENTO タグ（ギャラリー内のカテゴリ分け用） ---

let _mementoTagId: number | null = null;

// Resolve the memento tag id (read-only). Returns null if not created yet.
export async function getMementoTagId(): Promise<number | null> {
    if (_mementoTagId) return _mementoTagId;
    try {
        const res = await fetch(
            `${WP_REST_BASE}/tags&slug=${MEMENTO_TAG_SLUG}&_fields=id`,
            { cache: 'no-store' }
        );
        if (!res.ok) return null;
        const tags = await res.json();
        if (Array.isArray(tags) && tags[0]?.id) {
            _mementoTagId = tags[0].id as number;
            return _mementoTagId;
        }
        return null;
    } catch (error) {
        console.error('WordPress API error (getMementoTagId):', error);
        return null;
    }
}

// Resolve or create the memento tag (authenticated, admin use only).
export async function getOrCreateMementoTagId(): Promise<number> {
    const existing = await getMementoTagId();
    if (existing) return existing;
    const res = await fetch(`${WP_REST_BASE}/tags`, {
        method: 'POST',
        headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'MEMENTO', slug: MEMENTO_TAG_SLUG }),
    });
    if (!res.ok) throw new Error(`Create memento tag failed: ${await res.text()}`);
    const tag = await res.json();
    _mementoTagId = tag.id as number;
    return _mementoTagId;
}

export interface GalleryPhoto {
    id: number;
    caption: string;
    /** 原寸画像（ライトボックス表示用） */
    url: string;
    /** グリッド表示用の軽量サムネイル（WordPress生成済みサイズ、無ければ原寸） */
    thumbUrl: string;
    width: number;
    height: number;
    date: string;
    /** ギャラリー内のカテゴリ（フィルタ用）。未指定は 'Archive' 扱い */
    category?: string;
}

// グリッドのサムネイルに使うWordPress生成サイズ（幅の小さい順に候補を探す）
const THUMB_SIZE_PREFERENCE = ['medium_large', 'large', 'medium'];

function pickThumb(media: WPMedia): string {
    const sizes = media.media_details?.sizes;
    if (sizes) {
        for (const name of THUMB_SIZE_PREFERENCE) {
            const s = sizes[name];
            if (s?.source_url) return encodeURI(s.source_url);
        }
    }
    return encodeURI(media.source_url);
}

function mapGalleryPost(post: WPPostAdmin, mementoTagId: number | null): GalleryPhoto | null {
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    if (!media?.source_url) return null;
    const isMemento = !!mementoTagId && (post.tags?.includes(mementoTagId) ?? false);
    return {
        id: post.id,
        caption: stripHtml(post.title.rendered),
        url: encodeURI(media.source_url),
        thumbUrl: pickThumb(media),
        width: media.media_details?.width ?? 1600,
        height: media.media_details?.height ?? 1067,
        date: post.date,
        category: isMemento ? 'MEMENTO' : 'Archive',
    };
}

const GALLERY_FIELDS =
    '_fields=id,title,date,tags,featured_media,_links,_embedded&_embed=wp:featuredmedia';

// gallery カテゴリの投稿を全ページ取得する（WP の per_page 上限は100なので
// X-WP-TotalPages をたどって全件そろえる）。init は cache/認証などの fetch 設定。
async function fetchAllGalleryPosts(
    catId: number,
    query: string,
    init: RequestInit & { next?: { revalidate?: number } }
): Promise<WPPostAdmin[]> {
    const first = await fetch(
        `${WP_REST_BASE}/posts&categories=${catId}&per_page=100&page=1&${query}${GALLERY_FIELDS}`,
        init
    );
    if (!first.ok) return [];
    const posts: WPPostAdmin[] = await first.json();
    const totalPages = parseInt(first.headers.get('X-WP-TotalPages') || '1', 10);
    for (let page = 2; page <= totalPages; page++) {
        const res = await fetch(
            `${WP_REST_BASE}/posts&categories=${catId}&per_page=100&page=${page}&${query}${GALLERY_FIELDS}`,
            init
        );
        if (!res.ok) break;
        posts.push(...((await res.json()) as WPPostAdmin[]));
    }
    return posts;
}

// Public: fetch all gallery photos (newest first).
export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
    const catId = await getGalleryCategoryId();
    if (!catId) return [];
    try {
        const mementoTagId = await getMementoTagId();
        const posts = await fetchAllGalleryPosts(catId, '', { next: { revalidate: 600 } });
        return posts
            .map((p) => mapGalleryPost(p, mementoTagId))
            .filter((p): p is GalleryPhoto => p !== null);
    } catch (error) {
        console.error('WordPress API error (getGalleryPhotos):', error);
        return [];
    }
}

// Admin: fetch gallery photos (no cache).
export async function getAdminGalleryPhotos(): Promise<GalleryPhoto[]> {
    const catId = await getGalleryCategoryId();
    if (!catId) return [];
    const mementoTagId = await getMementoTagId();
    const posts = await fetchAllGalleryPosts(catId, 'status=publish,draft&', {
        headers: { Authorization: authHeader() },
        cache: 'no-store',
    });
    return posts
        .map((p) => mapGalleryPost(p, mementoTagId))
        .filter((p): p is GalleryPhoto => p !== null);
}

// Helper to format date
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
