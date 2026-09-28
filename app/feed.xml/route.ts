import { getFeaturedImageUrl, getPosts, stripHtml, type WPMedia, type WPPost } from '@/lib/wordpress';

// Journal の RSS。RSS リーダー（SAL Reader など）でフォローできるようにする
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.shinealight.jp';
const TITLE = 'Shine a Light Journal';
const DESCRIPTION = '小林大介のジャーナル。映像・写真・Web・AI・健康・自然のこと。';

// WordPress の date はタイムゾーンなしの日本時間。Vercel（UTC）でそのまま読むと 9 時間ずれる
const jst = (d: string) => new Date(/(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(d) ? d : `${d}+09:00`);

const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
    const { posts } = await getPosts(1, 30);
    const items = (posts as (WPPost & { _embedded?: { 'wp:featuredmedia'?: WPMedia[] } })[]).map((post) => {
        const url = `${SITE_URL}/journal/${post.id}`;
        const image = getFeaturedImageUrl(post);
        const summary = stripHtml(post.excerpt?.rendered ?? '').replace(/\s+/g, ' ').replace(/\s*\[&hellip;\]|\s*\[…\]$/, '…');
        return [
            '    <item>',
            `      <title>${esc(stripHtml(post.title.rendered))}</title>`,
            `      <link>${url}</link>`,
            `      <guid isPermaLink="true">${url}</guid>`,
            `      <pubDate>${jst(post.date).toUTCString()}</pubDate>`,
            `      <description>${esc(summary)}</description>`,
            image ? `      <media:thumbnail url="${esc(image)}"/>` : '',
            '    </item>',
        ]
            .filter(Boolean)
            .join('\n');
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(TITLE)}</title>
    <link>${SITE_URL}/journal</link>
    <description>${esc(DESCRIPTION)}</description>
    <language>ja</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join('\n')}
  </channel>
</rss>
`;
    return new Response(xml, {
        headers: {
            'content-type': 'application/rss+xml; charset=utf-8',
            'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
