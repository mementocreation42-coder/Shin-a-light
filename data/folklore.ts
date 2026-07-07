// Folklore — 土地に根ざした自然・人・営みの伝承を掘り下げる特設ページ群。
// 1ページ = ブロックの配列。テンプレ固定ではなく、テーマごとに組み替える。
//
// ※ 現在リセット中。中身はこれから作り直す。blocks にブロックを足していく。

// 画像 src に空文字を渡すと「取材予定」プレースホルダーが表示される。
// 実素材が揃ったら URL を入れるだけで差し替わる。
export type FolkloreBlock =
    | { type: 'narrative'; eyebrow?: string; text: string }
    | { type: 'fullMedia'; kind: 'image' | 'video'; src: string; poster?: string; caption?: string }
    | { type: 'parallax'; background: string; eyebrow?: string; title: string; lead?: string; motifs: string[] }
    | {
          type: 'horizontal';
          eyebrow?: string;
          title: string;
          panels: (
              | { kind: 'text'; heading?: string; body: string }
              | { kind: 'image'; src: string; caption?: string }
          )[];
      }
    | { type: 'history'; eyebrow?: string; heading: string; body: string; image?: string; sources?: { label: string; url: string }[] }
    | { type: 'interview'; eyebrow?: string; quote: string; name: string; role?: string; portrait?: string }
    | { type: 'craft'; eyebrow?: string; heading: string; items: { title: string; text: string; image?: string }[] }
    | { type: 'gallery'; images: string[] }
    | { type: 'shadow'; eyebrow?: string; heading: string; text: string }
    | { type: 'related'; heading: string; links: { label: string; href: string }[] };

export interface Folklore {
    slug: string;
    title: string;
    titleEn?: string;
    region: string;
    year?: string;
    excerpt: string;
    hero: { src: string; kind: 'image' | 'video'; poster?: string; hook: string };
    blocks: FolkloreBlock[];
}

export const folklore: Folklore[] = [
    {
        slug: 'awa-odori',
        title: '阿波おどり',
        titleEn: 'Awa Odori',
        region: '徳島県',
        excerpt: '（準備中）',
        hero: {
            src: '/videos/hero.mp4',
            kind: 'video',
            poster: '',
            hook: '',
        },
        blocks: [],
    },
];

export function getFolkloreBySlug(slug: string): Folklore | undefined {
    return folklore.find((f) => f.slug === slug);
}
