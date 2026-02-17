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

    return {
        title: `${post.title.rendered.replace(/<[^>]*>/g, '')} | Shine a Light`,
        description: post.excerpt.rendered.replace(/<[^>]*>/g, '').slice(0, 160),
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
