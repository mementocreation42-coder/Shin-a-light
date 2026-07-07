// Spotify for Podcasters (Anchor) の RSS フィードを取得してエピソード一覧を返す。
// 新しいエピソードが公開されると RSS に追加されるので、ISR の revalidate に
// 合わせて自動で一覧へ反映される（サイト側の更新作業は不要）。

const PODCAST_RSS_URL = 'https://anchor.fm/s/f035da90/podcast/rss';
export const SPOTIFY_SHOW_ID = '3g1Jexgm6ZWa1XYTFLGIxo';
export const SPOTIFY_SHOW_URL = `https://open.spotify.com/show/${SPOTIFY_SHOW_ID}`;

export interface PodcastEpisode {
    guid: string;
    title: string;
    /** リンクを取り除いたプレーンな概要テキスト */
    summary: string;
    /** Spotify のエピソードページ */
    link: string;
    /** 公開日 */
    pubDate: string;
    /** 音声ファイル(mp3/m4a)の URL。ネイティブ再生に使う */
    audioUrl: string;
    /** "18:39" のような長さ表記 */
    duration: string;
    /** エピソードのサムネイル画像 URL */
    image: string;
}

export interface PodcastShow {
    title: string;
    description: string;
    image: string;
    episodes: PodcastEpisode[];
}

// --- 小さなヘルパー（依存を増やさず正規表現でパース） ---

function firstMatch(source: string, regex: RegExp): string {
    const m = source.match(regex);
    return m ? (m[1] ?? '').trim() : '';
}

/** CDATA を剥がす */
function stripCdata(value: string): string {
    return value.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

/** 基本的な HTML エンティティをデコード */
function decodeEntities(value: string): string {
    return value
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&');
}

/** HTML タグを除去し、概要用のプレーンテキストにする */
function htmlToText(html: string): string {
    return decodeEntities(
        html
            .replace(/<br\s*\/?>(?=)/gi, ' ')
            .replace(/<\/p>/gi, ' ')
            .replace(/<[^>]+>/g, '')
    )
        .replace(/⁠|⁡|⁢|⁣/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/** "00:18:39" → "18:39" / "01:02:03" → "1:02:03" */
function formatDuration(raw: string): string {
    if (!raw) return '';
    // 秒数だけ（"1119"）で来るケースにも対応
    if (/^\d+$/.test(raw)) {
        const total = parseInt(raw, 10);
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        return h > 0
            ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            : `${m}:${String(s).padStart(2, '0')}`;
    }
    const parts = raw.split(':').map((n) => parseInt(n, 10));
    if (parts.length === 3) {
        const [h, m, s] = parts;
        return h > 0
            ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            : `${m}:${String(s).padStart(2, '0')}`;
    }
    return raw;
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

function parseEpisode(itemXml: string, fallbackImage: string): PodcastEpisode | null {
    const rawTitle = stripCdata(firstMatch(itemXml, /<title>([\s\S]*?)<\/title>/));
    const link = firstMatch(itemXml, /<link>([\s\S]*?)<\/link>/);
    const audioUrl = firstMatch(itemXml, /<enclosure[^>]*\surl="([^"]+)"/);
    if (!rawTitle || !audioUrl) return null;

    const image =
        firstMatch(itemXml, /<itunes:image[^>]*\shref="([^"]+)"/) || fallbackImage;

    const guid =
        firstMatch(itemXml, /<guid[^>]*>([\s\S]*?)<\/guid>/) || link || rawTitle;
    const descriptionHtml = stripCdata(
        firstMatch(itemXml, /<description>([\s\S]*?)<\/description>/)
    );
    const pubDateRaw = firstMatch(itemXml, /<pubDate>([\s\S]*?)<\/pubDate>/);
    const durationRaw = firstMatch(
        itemXml,
        /<itunes:duration>([\s\S]*?)<\/itunes:duration>/
    );

    return {
        guid,
        title: decodeEntities(rawTitle),
        summary: htmlToText(descriptionHtml),
        link,
        pubDate: formatDate(pubDateRaw),
        audioUrl,
        duration: formatDuration(durationRaw),
        image,
    };
}

/**
 * RSS を取得してエピソード一覧（新しい順）を返す。
 * 取得に失敗した場合は null を返し、呼び出し側で Spotify 埋め込みへフォールバックできる。
 */
export async function getPodcast(): Promise<PodcastShow | null> {
    try {
        const res = await fetch(PODCAST_RSS_URL, {
            headers: { 'User-Agent': 'ShineALightBot/1.0' },
            // 1時間ごとに再取得（新エピソードの自動反映）
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;

        const xml = await res.text();
        const channel = firstMatch(xml, /<channel>([\s\S]*?)<\/channel>/) || xml;

        const title =
            decodeEntities(stripCdata(firstMatch(channel, /<title>([\s\S]*?)<\/title>/))) ||
            'SAL Radio';
        const description = htmlToText(
            stripCdata(firstMatch(channel, /<description>([\s\S]*?)<\/description>/))
        );
        const image = firstMatch(channel, /<itunes:image[^>]*\shref="([^"]+)"/);

        const items = channel.match(/<item>[\s\S]*?<\/item>/g) || [];
        const episodes = items
            .map((item) => parseEpisode(item, image))
            .filter((e): e is PodcastEpisode => e !== null);

        return { title, description, image, episodes };
    } catch {
        return null;
    }
}
