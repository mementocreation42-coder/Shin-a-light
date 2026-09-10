import Image from 'next/image';
import { formatDate } from '@/lib/wordpress';
import { formatRecordedOn, INTERVIEW_HOST_NAME, type InterviewPost } from '@/lib/interviews';

/**
 * インタビュー記事の本体（Journal と同じ紙面カード）。/interview/[id] と /interview/preview で共用。
 * bodyHtml は呼び出し側でリンクカード・YouTube 埋め込みの処理を済ませて渡す。
 */
export default function InterviewArticle({ post, bodyHtml }: { post: InterviewPost; bodyHtml: string }) {
    return (
        <article className="journal-article iv-article">
            <div className="journal-article-body">
                {post.imageUrl && (
                    <div className="journal-article-hero">
                        <Image
                            src={post.imageUrl}
                            alt={post.plainTitle}
                            width={1200}
                            height={630}
                            priority
                            sizes="(max-width: 768px) 100vw, 800px"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </div>
                )}

                <header className="journal-article-header iv-header">
                    <p className="iv-eyebrow">Interview</p>
                    <h1 className="journal-article-title" dangerouslySetInnerHTML={{ __html: post.title }} />
                    {post.byline && (
                        <p className="iv-byline">
                            {post.byline.role && <span className="iv-byline-role">{post.byline.role}</span>}
                            <span className="iv-byline-name">{post.byline.name}</span>
                        </p>
                    )}
                    <dl className="iv-meta">
                        {post.recordedOn && (
                            <div>
                                <dt>収録</dt>
                                <dd>{formatRecordedOn(post.recordedOn)}</dd>
                            </div>
                        )}
                        <div>
                            <dt>公開</dt>
                            <dd>
                                <time dateTime={post.date}>{formatDate(post.date)}</time>
                            </dd>
                        </div>
                        <div>
                            <dt>聞き手</dt>
                            <dd>{INTERVIEW_HOST_NAME}</dd>
                        </div>
                    </dl>
                </header>

                <div className="journal-article-content iv-content" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            </div>
        </article>
    );
}
