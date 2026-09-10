import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/wordpress';
import type { InterviewPost } from '@/lib/interviews';

/**
 * インタビュー一覧のカード。
 * 記事末尾の「他のインタビュー」では compact（縦積み・抜粋なし）。
 */
export default function InterviewCard({ post, compact = false }: { post: InterviewPost; compact?: boolean }) {
    const classes = ['iv-card', post.thumbUrl ? '' : 'iv-card--noimage', compact ? 'iv-card--compact' : '']
        .filter(Boolean)
        .join(' ');

    return (
        <Link href={`/interview/${post.id}`} className={classes}>
            {post.thumbUrl && (
                <span className="iv-card-image">
                    <Image
                        src={post.thumbUrl}
                        alt=""
                        fill
                        sizes={compact ? '(max-width: 700px) 100vw, 260px' : '(max-width: 700px) 100vw, 240px'}
                        style={{ objectFit: 'cover' }}
                    />
                </span>
            )}
            <span className="iv-card-body">
                <span className="iv-card-meta">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                </span>
                {post.byline && (
                    <span className="iv-card-who">
                        {post.byline.role && <span className="iv-card-role">{post.byline.role}</span>}
                        <span className="iv-card-name">{post.byline.name}</span>
                    </span>
                )}
                <span className="iv-card-title" dangerouslySetInnerHTML={{ __html: post.title }} />
                {!compact && post.excerpt && <span className="iv-card-excerpt">{post.excerpt}</span>}
                <span className="iv-card-cta">読む →</span>
            </span>
        </Link>
    );
}
