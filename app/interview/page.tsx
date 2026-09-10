import type { Metadata } from 'next';
import Link from 'next/link';
import NewsletterCta from '@/components/NewsletterCta';
import InterviewCard from '@/components/InterviewCard';
import { getInterviewPosts } from '@/lib/interviews';

const PER_PAGE = 12;
const DESCRIPTION =
    '光が強いほど、影も濃い。まだ光の当たっていない人のところへ行って話を聞き、話した言葉のまま残していくインタビュープロジェクト。聞き手は小林大介。';

export const metadata: Metadata = {
    title: 'Interview',
    description: DESCRIPTION,
    alternates: {
        canonical: '/interview',
    },
    openGraph: {
        title: 'Interview - Shine a Light',
        description: DESCRIPTION,
        url: '/interview',
        siteName: 'Shine a Light',
        locale: 'ja_JP',
        type: 'website',
        images: ['/opengraph-image'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Interview - Shine a Light',
        description: DESCRIPTION,
        images: ['/opengraph-image'],
    },
};

// 記事は WordPress の Interview カテゴリ。公開すれば1時間以内に一覧へ反映される
export const revalidate = 3600;

interface PageProps {
    searchParams: Promise<{ page?: string | string[] }>;
}

export default async function InterviewIndex({ searchParams }: PageProps) {
    const params = await searchParams;
    const requested = Number.parseInt((Array.isArray(params.page) ? params.page[0] : params.page) ?? '1', 10);
    const page = Number.isFinite(requested) && requested > 0 ? requested : 1;
    const { posts, totalPages } = await getInterviewPosts(page, PER_PAGE);

    return (
        <main>
            <div className="iv-index">
                <header className="iv-index-header">
                    <p className="fl-eyebrow">Interview</p>
                    <h1 className="iv-index-title">
                        その時、
                        <br />
                        その瞬間を記録する。
                    </h1>
                    <p className="iv-index-lead">
                        光が強いほど、影も濃い。まだ光の当たっていない人のところへ行って、話を聞き、話した言葉のまま残していくプロジェクトです。
                        聞き手は小林大介。
                    </p>
                </header>

                {posts.length > 0 ? (
                    <ul className="iv-list">
                        {posts.map((post) => (
                            <li key={post.id}>
                                <InterviewCard post={post} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="iv-empty">
                        {page > 1 ? 'このページには記事がありません。' : '最初のインタビューを準備中です。'}
                    </p>
                )}

                {totalPages > 1 && (
                    <nav className="iv-pagination" aria-label="ページ送り">
                        {page > 1 ? (
                            <Link href={page === 2 ? '/interview' : `/interview?page=${page - 1}`}>← 新しい</Link>
                        ) : (
                            <span />
                        )}
                        <span>
                            {page} / {totalPages}
                        </span>
                        {page < totalPages ? <Link href={`/interview?page=${page + 1}`}>古い →</Link> : <span />}
                    </nav>
                )}
            </div>
            <NewsletterCta lede="新しいインタビューは、メールでもお知らせしています。映像・写真・AI・暮らしのヒントも不定期で。" />
        </main>
    );
}
