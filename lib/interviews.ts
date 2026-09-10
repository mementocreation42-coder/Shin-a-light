/**
 * /interview — インタビュー（対話の記録）。
 *
 * 記事の置き場は Journal（WordPress）の「Interview」カテゴリ（lib/wordpress.ts の INTERVIEW_CATEGORY_SLUG）。
 * 本文は SAL Echos（書き起こしスキル）が書く interview.md の形をそのまま前提にする:
 *   - 先頭に「肩書き・所属 - 氏名」の一段落（下書きスクリプトは class="iv-byline" を付ける）
 *   - 続いて収録日の一段落（class="iv-recorded"、任意）
 *   - 「小林：質問」「相手：答え」の段落が対話。見出し（h2）で話題を区切る
 *     （画面では名前を出さず、質問を「――」始まりの太字、答えを普通の段落にする）
 *   - 末尾の「## 要確認」は内部メモなので出さない
 * このモジュールは、その形を画面用に読み替えるだけ。WP 側の投稿は普通の記事のまま。
 */
import {
    WP_REST_BASE,
    getPostById,
    getInterviewCategoryId,
    getFeaturedImageUrl,
    stripHtml,
    formatDate,
    type WPPost,
    type WPMedia,
} from '@/lib/wordpress';

/** 聞き手のラベル。interview.md の「小林：」 */
export const INTERVIEW_HOST_LABEL = '小林';
/** 記事に出す聞き手の名前 */
export const INTERVIEW_HOST_NAME = '小林大介';

export interface InterviewByline {
    /** 肩書き・所属（無ければ空） */
    role: string;
    name: string;
}

export interface InterviewPost {
    id: number;
    /** WP が返す HTML のタイトル */
    title: string;
    plainTitle: string;
    /** 公開日（ISO） */
    date: string;
    modified: string;
    byline: InterviewByline | null;
    /** 収録日。YYYY-MM-DD が基本だが、手書きの文字列も通す */
    recordedOn: string | null;
    /** 抜粋（プレーンテキスト） */
    excerpt: string;
    /** アイキャッチ原寸（記事のヒーロー・OGP） */
    imageUrl: string | null;
    /** 一覧用の軽いサムネ */
    thumbUrl: string | null;
    /** 本文 HTML。対話行に印を付け、要確認は除いたもの */
    bodyHtml: string;
}

type EmbeddedPost = WPPost & { _embedded?: { 'wp:featuredmedia'?: WPMedia[] } };

/** 「肩書き・所属 - 氏名」を分ける。区切りが無ければ全体を名前とみなす */
export function parseByline(text: string): InterviewByline {
    const parts = text
        .trim()
        .split(/\s+[-–—―]\s+|\s*[｜|]\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
    if (parts.length >= 2) {
        return { role: parts.slice(0, -1).join(' '), name: parts[parts.length - 1] };
    }
    return { role: '', name: text.trim() };
}

/** 肩書き行らしさ: 短く、文末記号が無く、「 - 」か「｜」の区切りがある */
function looksLikeByline(text: string): boolean {
    return text.length > 0 && text.length <= 60 && !/[。！？!?]/.test(text) && /\s[-–—―]\s|[｜|]/.test(text);
}

export interface ParsedInterviewContent {
    byline: string | null;
    recordedOn: string | null;
    bodyHtml: string;
}

/** WP の本文 HTML から、肩書き行・収録日を取り出し、要確認を落とす */
export function parseInterviewContent(html: string): ParsedInterviewContent {
    let body = html;
    let byline: string | null = null;
    let recordedOn: string | null = null;

    // 1. 印つき段落（下書きスクリプトが付ける）
    body = body.replace(/<p[^>]*class="[^"]*\biv-byline\b[^"]*"[^>]*>([\s\S]*?)<\/p>\s*/, (_m, inner: string) => {
        byline = stripHtml(inner);
        return '';
    });
    body = body.replace(/<p[^>]*class="[^"]*\biv-recorded\b[^"]*"[^>]*>([\s\S]*?)<\/p>\s*/, (_m, inner: string) => {
        recordedOn = stripHtml(inner);
        return '';
    });

    // 2. 印が無ければ、冒頭の短い一段落を肩書き行とみなす（管理画面で手で貼ったとき用）
    if (!byline) {
        const first = body.match(/^\s*<p(?:\s[^>]*)?>([\s\S]*?)<\/p>\s*/);
        if (first) {
            const text = stripHtml(first[1]);
            if (looksLikeByline(text)) {
                byline = text;
                body = body.slice(first[0].length);
            }
        }
    }

    // 3. 「要確認」以降は内部メモ。公開面には出さない
    body = body.replace(/<h[23][^>]*>\s*要確認\s*<\/h[23]>[\s\S]*$/, '');

    return { byline, recordedOn, bodyHtml: body.trim() };
}

const PARAGRAPH_RE = /<p(\s[^>]*)?>([\s\S]*?)<\/p>/g;
// 「小林：」「山田：」「Alex: 」。全角コロンか、半角コロン＋空白。URL（https://）は空白が無いので当たらない
const SPEAKER_RE = /^\s*(?:<strong>)?([^\s<>：:「」（）()、。]{1,12})(?:<\/strong>)?\s*(?:：|:\s)\s*/;

/** 質問の頭に付ける記号（雑誌のインタビュー体裁） */
export const INTERVIEW_QUESTION_DASH = '――';

/**
 * 「小林：…」「相手：…」の段落を対話の行にする。
 * 名前ラベルは出さない。聞き手の段落は「――質問」（太字）、相手の段落はそのままの本文。
 */
export function markDialogue(html: string, host = INTERVIEW_HOST_LABEL): string {
    return html.replace(PARAGRAPH_RE, (match, attrs: string | undefined, inner: string) => {
        // class 付きの段落（印・埋め込みなど）は触らない
        if (attrs && /class=/.test(attrs)) return match;
        const m = inner.match(SPEAKER_RE);
        if (!m) return match;
        const label = m[1];
        const text = inner.slice(m[0].length);
        if (!text.trim()) return match;
        return label === host
            ? `<p class="iv-line iv-host">${INTERVIEW_QUESTION_DASH}${text}</p>`
            : `<p class="iv-line iv-guest">${text}</p>`;
    });
}

/** 一覧のサムネ。原寸は重いので WP が生成した中間サイズを優先 */
function pickThumb(post: EmbeddedPost): string | null {
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    if (!media?.source_url) return null;
    const sizes = media.media_details?.sizes;
    for (const name of ['medium_large', 'large', 'medium']) {
        const s = sizes?.[name];
        if (s?.source_url) return encodeURI(s.source_url);
    }
    return encodeURI(media.source_url);
}

/** WP の投稿 → 画面用。一覧と記事の両方で使う */
export function toInterviewPost(post: EmbeddedPost): InterviewPost {
    const { byline, recordedOn, bodyHtml } = parseInterviewContent(post.content?.rendered ?? '');

    // 抜粋が未設定だと WP が本文冒頭から自動生成するので、肩書き行と末尾の […] を外す
    let excerpt = stripHtml(post.excerpt?.rendered ?? '');
    if (byline && excerpt.startsWith(byline)) excerpt = excerpt.slice(byline.length).trim();
    excerpt = excerpt.replace(/\s*\[…\]\s*$/, '…');

    return {
        id: post.id,
        title: post.title.rendered,
        plainTitle: stripHtml(post.title.rendered),
        date: post.date,
        modified: post.modified,
        byline: byline ? parseByline(byline) : null,
        recordedOn,
        excerpt,
        imageUrl: getFeaturedImageUrl(post),
        thumbUrl: pickThumb(post),
        bodyHtml: markDialogue(bodyHtml),
    };
}

/** 収録日の表示。YYYY-MM-DD なら日本語の日付に、それ以外はそのまま */
export function formatRecordedOn(value: string): string {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? formatDate(`${value}T00:00:00`) : value;
}

// 一覧にも本文が要る（肩書き行を読むため）。1ページ分なので転送量は許容範囲
const LIST_FIELDS =
    '_fields=id,title,excerpt,date,modified,content,categories,featured_media,_links,_embedded&_embed=wp:featuredmedia';

/** Interview カテゴリの公開記事（新しい順）。カテゴリ未作成なら空 */
export async function getInterviewPosts(
    page = 1,
    perPage = 12,
): Promise<{ posts: InterviewPost[]; totalPages: number }> {
    const catId = await getInterviewCategoryId();
    if (!catId) return { posts: [], totalPages: 0 };
    try {
        const res = await fetch(
            `${WP_REST_BASE}/posts&categories=${catId}&page=${page}&per_page=${perPage}&${LIST_FIELDS}`,
            { next: { revalidate: 3600 } },
        );
        // 範囲外のページ番号は WP が 400 を返す。空として扱う
        if (!res.ok) return { posts: [], totalPages: 0 };
        const posts: EmbeddedPost[] = await res.json();
        return {
            posts: posts.map(toInterviewPost),
            totalPages: parseInt(res.headers.get('X-WP-TotalPages') || '1', 10),
        };
    } catch (error) {
        console.error('WordPress API connection error (getInterviewPosts):', error);
        return { posts: [], totalPages: 0 };
    }
}

/** id の投稿が Interview カテゴリなら返す。違えば null（/journal 側の記事を /interview で出さない） */
export async function getInterviewPost(id: string): Promise<InterviewPost | null> {
    const [post, catId] = await Promise.all([getPostById(id), getInterviewCategoryId()]);
    if (!post || !catId || !post.categories?.includes(catId)) return null;
    return toInterviewPost(post);
}
