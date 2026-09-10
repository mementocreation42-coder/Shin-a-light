import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import InterviewArticle from '@/components/InterviewArticle';
import InterviewCard from '@/components/InterviewCard';
import NewsletterCta from '@/components/NewsletterCta';
import { getInterviewPost, getInterviewPosts, INTERVIEW_HOST_NAME } from '@/lib/interviews';
import { processYouTubeEmbeds } from '@/lib/youtube';
import { processLinkCards } from '@/lib/ogp';
import { processAffiliateCards } from '@/lib/affiliate';

// 公開後の記事はほとんど変わらない。/journal と同じく1時間キャッシュ
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    const { posts } = await getInterviewPosts(1, 100);
    return posts.map((post) => ({ id: String(post.id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const post = await getInterviewPost(id);
    if (!post) return { title: 'Interview Not Found' };

    const title = post.byline ? `${post.plainTitle} — ${post.byline.name}` : post.plainTitle;
    const description = (post.excerpt || post.plainTitle).slice(0, 160);

    return {
        title,
        description,
        alternates: {
            canonical: `/interview/${id}`,
        },
        openGraph: {
            title: `${title} | Interview - Shine a Light`,
            description,
            url: `/interview/${id}`,
            siteName: 'Shine a Light',
            locale: 'ja_JP',
            type: 'article',
            publishedTime: post.date,
            authors: ['DAISUKE KOBAYASHI'],
            images: post.imageUrl
                ? [{ url: post.imageUrl, width: 1200, height: 630, alt: post.plainTitle }]
                : ['/opengraph-image'],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | Interview - Shine a Light`,
            description,
            images: [post.imageUrl ?? '/opengraph-image'],
        },
    };
}

export default async function InterviewPostPage({ params }: PageProps) {
    const { id } = await params;
    const post = await getInterviewPost(id);
    if (!post) notFound();

    // 本文の後処理は /journal と同じ（YouTube 埋め込み → 商品カード → リンクカード）
    const bodyPromise = processAffiliateCards(processYouTubeEmbeds(post.bodyHtml)).then(processLinkCards);
    const [bodyHtml, { posts: latest }] = await Promise.all([bodyPromise, getInterviewPosts(1, 4)]);
    const others = latest.filter((p) => p.id !== post.id).slice(0, 3);

    return (
        <main>
            <div className="journal-article-page iv-article-page">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: post.plainTitle,
                            datePublished: post.date,
                            dateModified: post.modified,
                            description: post.excerpt,
                            image: post.imageUrl ? [post.imageUrl] : [],
                            mainEntityOfPage: {
                                '@type': 'WebPage',
                                '@id': `https://www.shinealight.jp/interview/${id}`,
                            },
                            author: [{ '@type': 'Person', name: INTERVIEW_HOST_NAME, url: 'https://www.shinealight.jp' }],
                            publisher: { '@type': 'Organization', name: 'Shine a Light', url: 'https://www.shinealight.jp' },
                            ...(post.byline
                                ? {
                                      about: {
                                          '@type': 'Person',
                                          name: post.byline.name,
                                          ...(post.byline.role ? { jobTitle: post.byline.role } : {}),
                                      },
                                  }
                                : {}),
                        }),
                    }}
                />

                <InterviewArticle post={post} bodyHtml={bodyHtml} />

                {others.length > 0 && (
                    <section className="iv-others">
                        <h2 className="iv-others-title">他のインタビュー</h2>
                        <ul className="iv-list iv-list--compact">
                            {others.map((p) => (
                                <li key={p.id}>
                                    <InterviewCard post={p} compact />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <div className="journal-article-footer">
                    <Link href="/interview" className="journal-back-link">
                        ← Interview 一覧へ
                    </Link>
                </div>
            </div>
            <NewsletterCta lede="新しいインタビューは、メールでもお知らせしています。映像・写真・AI・暮らしのヒントも不定期で。" />
        </main>
    );
}
