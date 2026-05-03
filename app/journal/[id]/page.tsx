import { notFound } from 'next/navigation';
import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';
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

    const title = post.title.rendered.replace(/<[^>]*>/g, '');
    const description = post.excerpt.rendered.replace(/<[^>]*>/g, '').slice(0, 160);
    const imageUrl = getFeaturedImageUrl(post);

    return {
        title: `${title} | Shine a Light`,
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
            ] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | Shine a Light`,
            description: description,
            images: imageUrl ? [imageUrl] : undefined,
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
                        "headline": post.title.rendered.replace(/<[^>]*>/g, ''),
                        "datePublished": post.date,
                        "dateModified": post.modified,
                        "description": post.excerpt.rendered.replace(/<[^>]*>/g, '').slice(0, 160),
                        "image": imageUrl ? [imageUrl] : [],
                        "author": [{
                            "@type": "Person",
                            "name": "DAISUKE KOBAYASHI",
                            "url": "https://www.shinealight.jp"
                        }]
                    })
                }}
            />
            <article className="journal-article">
                <div className="journal-article-body">
                    {imageUrl && (
                        <div className="journal-article-hero">
                            <img src={imageUrl} alt={post.title.rendered.replace(/<[^>]*>/g, '') || 'Journal cover image'} />
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
                    <div className="journal-author-box">
                        <img src="/images/profile.jpg" alt="DAISUKE KOBAYASHI" className="journal-author-avatar" />
                        <div className="journal-author-info">
                            <p className="journal-author-name">DAISUKE KOBAYASHI</p>
                            <p className="journal-author-bio">映像制作・写真・Web・AIを軸に徳島を拠点に活動するクリエイター。釣りと健康にも本気。</p>
                            <Link href="/#about" className="journal-author-about-link">About →</Link>
                        </div>
                    </div>

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
