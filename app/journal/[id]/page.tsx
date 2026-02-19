import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostById, getPosts, getFeaturedImageUrl, formatDate } from '@/lib/wordpress';

export const revalidate = 60;

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    const { posts } = await getPosts(1, 20);
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
    const post = await getPostById(id);

    if (!post) {
        notFound();
    }

    const imageUrl = getFeaturedImageUrl(post);

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
                <div className="journal-article-header">
                    <Link href="/journal" className="journal-back-link">
                        ← Back to Journal
                    </Link>
                    <time className="journal-article-date">
                        {formatDate(post.date)}
                    </time>
                    <h1
                        className="journal-article-title"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                </div>

                {imageUrl && (
                    <div className="journal-article-hero">
                        <img src={imageUrl} alt="" />
                    </div>
                )}

                <div
                    className="journal-article-content"
                    dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                />

                <div className="journal-article-footer">
                    <Link href="/journal" className="journal-back-link">
                        ← Back to Journal
                    </Link>
                </div>
            </article>
        </main>
    );
}
