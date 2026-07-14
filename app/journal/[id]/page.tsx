import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import NewsletterForm from '@/components/NewsletterForm';
import AuthorStrip from '@/components/AuthorStrip';
import { getPostById, getPosts, getCategories, getFeaturedImageUrl, formatDate } from '@/lib/wordpress';
import { processYouTubeEmbeds } from '@/lib/youtube';
import { processLinkCards } from '@/lib/ogp';
import { processAffiliateCards } from '@/lib/affiliate';

const categoryLabels: Record<string, string> = {
    hpmj: 'HpMJ',
};

// Revalidate at most once per hour. Blog posts rarely change after publication,
// so 60s revalidation was burning invocations on every visitor after the cache
// window expired (once per minute per post, multiplied by CDN regions).
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    // Pre-build all 100 most recent posts at deploy time so they are served as
    // static HTML. Previously only 20 were pre-built; the remainder were SSR
    // on first visit AND re-rendered every 60 seconds thereafter.
    const { posts } = await getPosts(1, 100);
    return posts.map((post) => ({
        id: String(post.id),
    }));
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
        return { title: 'Post Not Found' };
    }

    const decode = (s: string) => s
        .replace(/<[^>]*>/g, '')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    const title = decode(post.title.rendered);
    const description = decode(post.excerpt.rendered).slice(0, 160);
    const imageUrl = getFeaturedImageUrl(post);

    return {
        title: title,
        description: description,
        alternates: {
            canonical: `/journal/${id}`,
        },
        openGraph: {
            title: `${title} | Shine a Light`,
            description: description,
            url: `/journal/${id}`,
            siteName: 'Shine a Light',
            locale: 'ja_JP',
            type: 'article',
            publishedTime: post.date,
            authors: ['DAISUKE KOBAYASHI'],
            images: imageUrl ? [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ] : ['/opengraph-image'],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | Shine a Light`,
            description: description,
            images: [imageUrl || '/opengraph-image'],
        },
    };
}

export default async function JournalPostPage({ params }: PageProps) {
    const { id } = await params;
    const [post, allCategories] = await Promise.all([
        getPostById(id),
        getCategories(),
    ]);

    if (!post) {
        notFound();
    }

    const imageUrl = getFeaturedImageUrl(post);
    const decodeText = (s: string) => s
        .replace(/<[^>]*>/g, '')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    const plainTitle = decodeText(post.title.rendered);
    const plainDesc = decodeText(post.excerpt.rendered).slice(0, 160);
    const postCategories = post.categories
        .map(catId => allCategories.find(c => c.id === catId))
        .filter(Boolean);

    // Fetch related posts from same category
    const firstCategoryId = post.categories[0];
    const { posts: relatedRaw } = firstCategoryId
        ? await getPosts(1, 4, firstCategoryId)
        : { posts: [] };
    const relatedPosts = relatedRaw.filter(p => p.id !== post.id).slice(0, 3);

    return (
        <main className="journal-article-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": plainTitle,
                        "datePublished": post.date,
                        "dateModified": post.modified,
                        "description": plainDesc,
                        "image": imageUrl ? [imageUrl] : [],
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": `https://www.shinealight.jp/journal/${id}`
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Shine a Light",
                            "url": "https://www.shinealight.jp"
                        },
                        "author": [{
                            "@type": "Person",
                            "name": "DAISUKE KOBAYASHI",
                            "url": "https://www.shinealight.jp"
                        }]
                    })
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.shinealight.jp" },
                            { "@type": "ListItem", "position": 2, "name": "Journal", "item": "https://www.shinealight.jp/journal" },
                            { "@type": "ListItem", "position": 3, "name": plainTitle }
                        ]
                    })
                }}
            />
            <article className="journal-article">
                <div className="journal-article-body">
                    {imageUrl && (
                        <div className="journal-article-hero">
                            <Image
                                src={imageUrl}
                                alt={plainTitle || 'Journal cover image'}
                                width={1200}
                                height={630}
                                priority
                                sizes="(max-width: 768px) 100vw, 800px"
                                style={{ width: '100%', height: 'auto' }}
                            />
                        </div>
                    )}

                    <div className="journal-article-header">
                        <time className="journal-article-date">
                            {formatDate(post.date)}
                        </time>
                        <h1
                            className="journal-article-title"
                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                        {postCategories.length > 0 && (
                            <div className="journal-article-tags">
                                {postCategories.map((cat) => cat && (
                                    <span
                                        key={cat.id}
                                        className="journal-card-category-badge"
                                        data-category={cat.slug}
                                    >
                                        {categoryLabels[cat.slug] ?? cat.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                        <AuthorStrip />

                    <div
                        className="journal-article-content"
                        dangerouslySetInnerHTML={{ __html: await processLinkCards(await processAffiliateCards(processYouTubeEmbeds(post.content.rendered))) }}
                    />
                </div>

                <div className="journal-nl-banner">
                    <p className="journal-nl-banner-label">NEWSLETTER</p>
                    <p className="journal-nl-banner-copy">領域を横断する、クリエイティブのB面を。</p>
                    <NewsletterForm benefits={[
                        '🎁 登録者には、SAL謹製写真現像プリセット「selpico3」をプレゼント。',
                        '📬 映像・写真・健康・AI・自然、暮らしのヒントを不定期に届ける。',
                        '🔧 使っているツール・ワークフロー・機材の話を共有。',
                    ]} />
                    {relatedPosts.length > 0 && (
                    <section className="journal-related journal-related--inline">
                        <h2 className="journal-related-title">Related Posts</h2>
                        <ul className="journal-related-grid">
                            {relatedPosts.map((relPost) => {
                                const relImageUrl = getFeaturedImageUrl(relPost);
                                return (
                                    <li key={relPost.id}>
                                        <Link href={`/journal/${relPost.id}`} className="journal-card">
                                            {relImageUrl && (
                                                <div
                                                    className="journal-card-image"
                                                    style={{ backgroundImage: `url(${relImageUrl})` }}
                                                />
                                            )}
                                            <div className="journal-card-content">
                                                <time className="journal-card-date">
                                                    {formatDate(relPost.date)}
                                                </time>
                                                <h3
                                                    className="journal-card-title"
                                                    dangerouslySetInnerHTML={{ __html: relPost.title.rendered }}
                                                />
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                    )}
                </div>

                <div className="journal-article-footer">
                    <Link href="/journal" className="journal-back-link">
                        ← Back to Journal
                    </Link>
                </div>
            </article>
        </main>
    );
}
