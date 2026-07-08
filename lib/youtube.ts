/**
 * YouTube URL から動画IDを抽出する
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:[^&]*&)*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * 記事のHTMLコンテンツ内にある YouTube URL を iframe 埋め込みに変換する
 *
 * 対応パターン:
 *   <p>https://www.youtube.com/watch?v=XXXX</p>
 *   <p><a href="https://youtu.be/XXXX">https://youtu.be/XXXX</a></p>
 */
export function processYouTubeEmbeds(html: string): string {
  // <p> 内に YouTube URL だけがある場合（<a> タグの有無を問わず）
  return html.replace(
    /<p>\s*(?:<a[^>]*href="([^"]*)"[^>]*>(?:[^<]*)<\/a>|([^\s<>]+))\s*<\/p>/g,
    (match, hrefUrl: string | undefined, plainUrl: string | undefined) => {
      const url = hrefUrl ?? plainUrl ?? '';
      const videoId = extractYouTubeId(url);
      if (!videoId) return match;

      return `<div class="youtube-embed-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
    }
  );
}

// ---------------------------------------------------------------------------
// チャンネル動画一覧
//
// YOUTUBE_API_KEY が設定されていれば YouTube Data API v3 で「全公開動画」を
// 取得する。未設定の場合は公開 RSS フィード（最新15件のみ）にフォールバックする。
// どちらも ISR の revalidate（1時間）でキャッシュし、新着を自動反映する。
// ---------------------------------------------------------------------------

export const YOUTUBE_CHANNEL_ID = 'UCccE2Pqv_kBiHjFkF_UJiqA';
export const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`;
export const YOUTUBE_HANDLE_URL = 'https://www.youtube.com/@sal-flims';

const YOUTUBE_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

export interface YouTubeVideo {
  /** 動画 ID（埋め込み・サムネイルに使う） */
  id: string;
  title: string;
  /** YouTube 上の視聴ページ URL */
  url: string;
  /** サムネイル画像 URL */
  thumbnail: string;
  /** 公開日（"2026/06/08" 形式） */
  published: string;
  /** 再生回数（取得できた場合のみ） */
  views: number | null;
  /** ショート動画かどうか */
  isShort: boolean;
}

export interface YouTubeChannel {
  title: string;
  videos: YouTubeVideo[];
}

function firstMatch(source: string, regex: RegExp): string {
  const m = source.match(regex);
  return m ? (m[1] ?? '').trim() : '';
}

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function parseEntry(entryXml: string): YouTubeVideo | null {
  const id = firstMatch(entryXml, /<yt:videoId>([\s\S]*?)<\/yt:videoId>/);
  const rawTitle = firstMatch(entryXml, /<title>([\s\S]*?)<\/title>/);
  if (!id || !rawTitle) return null;

  const link = firstMatch(entryXml, /<link[^>]*\shref="([^"]+)"/);
  const isShort = /\/shorts\//.test(link);
  const publishedRaw = firstMatch(entryXml, /<published>([\s\S]*?)<\/published>/);
  const thumbnail =
    firstMatch(entryXml, /<media:thumbnail[^>]*\surl="([^"]+)"/) ||
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const viewsRaw = firstMatch(entryXml, /<media:statistics[^>]*\sviews="(\d+)"/);

  return {
    id,
    title: decodeEntities(rawTitle),
    url: link || `https://www.youtube.com/watch?v=${id}`,
    thumbnail,
    published: formatDate(publishedRaw),
    views: viewsRaw ? parseInt(viewsRaw, 10) : null,
    isShort,
  };
}

/**
 * RSS を取得して動画一覧（新しい順・最新15件）を返す。
 * 取得に失敗した場合は null を返す。
 */
async function getViaRss(): Promise<YouTubeChannel | null> {
  try {
    const res = await fetch(YOUTUBE_RSS_URL, {
      headers: { 'User-Agent': 'ShineALightBot/1.0' },
      // 1時間ごとに再取得（新着動画の自動反映）
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const xml = await res.text();
    const title =
      decodeEntities(firstMatch(xml, /<title>([\s\S]*?)<\/title>/)) || 'SAL Films';

    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    const videos = entries
      .map(parseEntry)
      .filter((v): v is YouTubeVideo => v !== null);

    if (videos.length === 0) return null;

    return { title, videos };
  } catch {
    return null;
  }
}

/** ISO 8601 duration（例: "PT1M5S"）を秒に変換する */
function iso8601ToSeconds(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, h, min, s] = m;
  return (
    (parseInt(h || '0', 10) * 3600) +
    (parseInt(min || '0', 10) * 60) +
    parseInt(s || '0', 10)
  );
}

interface PlaylistItem {
  snippet?: {
    title?: string;
    publishedAt?: string;
    resourceId?: { videoId?: string };
    thumbnails?: Record<string, { url?: string }>;
  };
}

interface VideoDetail {
  id?: string;
  statistics?: { viewCount?: string };
  contentDetails?: { duration?: string };
}

/**
 * YouTube Data API v3 でチャンネルの全公開動画を取得する。
 * uploads プレイリスト（"UC…" → "UU…"）を pageToken で最後まで辿る。
 */
async function getViaApi(apiKey: string): Promise<YouTubeChannel | null> {
  const uploadsPlaylistId = `UU${YOUTUBE_CHANNEL_ID.slice(2)}`;
  const items: PlaylistItem[] = [];
  let pageToken = '';

  try {
    // 1) uploads プレイリストを全ページ取得
    do {
      const url =
        `https://www.googleapis.com/youtube/v3/playlistItems` +
        `?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}` +
        `&pageToken=${pageToken}&key=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        items?: PlaylistItem[];
        nextPageToken?: string;
      };
      if (data.items) items.push(...data.items);
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    const base = items
      .map((it) => {
        const s = it.snippet;
        const id = s?.resourceId?.videoId;
        if (!id || !s?.title || s.title === 'Private video' || s.title === 'Deleted video') {
          return null;
        }
        const thumbs = s.thumbnails || {};
        const thumbnail =
          thumbs.maxres?.url ||
          thumbs.standard?.url ||
          thumbs.high?.url ||
          thumbs.medium?.url ||
          `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        return {
          id,
          title: s.title,
          publishedAt: s.publishedAt || '',
          thumbnail,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    if (base.length === 0) return null;

    // 2) 再生数・長さ（ショート判定用）を 50 件ずつまとめて取得
    const details = new Map<string, VideoDetail>();
    for (let i = 0; i < base.length; i += 50) {
      const ids = base.slice(i, i + 50).map((v) => v.id).join(',');
      const url =
        `https://www.googleapis.com/youtube/v3/videos` +
        `?part=statistics,contentDetails&id=${ids}&key=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) continue;
      const data = (await res.json()) as { items?: VideoDetail[] };
      for (const d of data.items || []) {
        if (d.id) details.set(d.id, d);
      }
    }

    const videos: YouTubeVideo[] = base.map((v) => {
      const d = details.get(v.id);
      const viewCount = d?.statistics?.viewCount;
      const seconds = d?.contentDetails?.duration
        ? iso8601ToSeconds(d.contentDetails.duration)
        : 0;
      const isShort = seconds > 0 && seconds <= 60;
      return {
        id: v.id,
        title: decodeEntities(v.title),
        url: isShort
          ? `https://www.youtube.com/shorts/${v.id}`
          : `https://www.youtube.com/watch?v=${v.id}`,
        thumbnail: v.thumbnail,
        published: formatDate(v.publishedAt),
        views: viewCount ? parseInt(viewCount, 10) : null,
        isShort,
      };
    });

    return { title: 'SAL Films', videos };
  } catch {
    return null;
  }
}

/**
 * 動画一覧（新しい順）を返す。
 * YOUTUBE_API_KEY があれば全公開動画、無ければ RSS（最新15件）。
 * API 取得に失敗した場合も RSS へフォールバックする。
 */
export async function getYouTubeVideos(): Promise<YouTubeChannel | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    const viaApi = await getViaApi(apiKey);
    if (viaApi) return viaApi;
  }
  return getViaRss();
}
