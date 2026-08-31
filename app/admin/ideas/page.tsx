import Link from 'next/link';
import { getAdminPosts, getFeaturedThumbUrl, formatDate, stripHtml } from '@/lib/wordpress';
import AdminNav from '@/components/admin/AdminNav';
import PostActions from '@/components/admin/PostActions';
import IdeaQuickAdd from '@/components/admin/IdeaQuickAdd';
import styles from '../admin.module.css';

export const metadata = {
    title: { absolute: 'Ideas | Shine a Light' },
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

/**
 * 記事ネタ = WP の status:pending。投稿一覧（publish,future,draft）には出ない置き場。
 * 見た目と動線は投稿一覧と同じ：行をクリック → 同じ編集画面。
 * 編集画面では「ネタを保存」「下書きへ移す」「投稿する」が選べる。
 */
export default async function AdminIdeasPage() {
    const { posts, total } = await getAdminPosts(1, 100, { status: 'pending' });

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.logo}>SAL</Link>
                    <span className={styles.logoBadge}>ADMIN</span>
                    <AdminNav />
                </div>
                <div className={styles.headerRight}>
                    <Link href="/journal" target="_blank" className={styles.ghostBtn}>公開ページを見る ↗</Link>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.pageTitleRow}>
                    <h1 className={styles.pageTitle}>
                        記事ネタ
                        <span className={styles.count}>{total}件</span>
                    </h1>
                </div>
                <p style={{ fontSize: 12, color: '#a0a0a0', margin: '0 0 16px' }}>
                    書く前のネタ置き場です（投稿一覧には出ません）。編集画面の「下書きへ移す」で投稿一覧に移ります。
                </p>

                <IdeaQuickAdd />

                {posts.length === 0 ? (
                    <p className={styles.emptyState}>ネタはまだありません。</p>
                ) : (
                    <div className={styles.list}>
                        {posts.map((post) => {
                            const imgUrl = getFeaturedThumbUrl(post);
                            const plainTitle = stripHtml(post.title.rendered);
                            return (
                                <div key={post.id} className={`${styles.item} ${styles.itemDraft}`}>
                                    <div className={styles.thumb}>
                                        {imgUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={imgUrl} alt="" loading="lazy" decoding="async" className={styles.thumbImg} />
                                        ) : (
                                            <span className={styles.thumbEmpty}>—</span>
                                        )}
                                    </div>
                                    <div className={styles.info}>
                                        <div className={styles.meta}>
                                            <time className={styles.date}>{formatDate(post.date)}</time>
                                            {post._embedded?.['wp:term']?.[0]?.map((cat) => (
                                                <span key={cat.id} className={styles.catTag}>{cat.name}</span>
                                            ))}
                                            <span className={styles.draftBadge}>ネタ</span>
                                        </div>
                                        <Link href={`/admin/posts/${post.id}/edit`} className={`${styles.title} ${styles.titleDraft}`}>
                                            {plainTitle}
                                        </Link>
                                    </div>
                                    <PostActions postId={post.id} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
