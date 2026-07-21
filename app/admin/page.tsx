import Link from 'next/link';
import { getAdminPosts, getFeaturedImageUrl, formatDate } from '@/lib/wordpress';
import { logout } from '@/app/login/actions';
import PostActions from '@/components/admin/PostActions';
import AdminToolbar from '@/components/admin/AdminToolbar';
import AdminNav from '@/components/admin/AdminNav';
import styles from './admin.module.css';

export const metadata = {
  title: { absolute: 'Admin | Shine a Light' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1', 10);
  const { posts, totalPages, total } = await getAdminPosts(page, 20);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>SAL</span>
          <span className={styles.logoBadge}>ADMIN</span>
          <AdminNav />
        </div>
        <div className={styles.headerRight}>
          <Link href="/admin/post" className={styles.primaryBtn}>
            <span className={styles.btnIcon}>＋</span>
            <span className={styles.btnText}>新規投稿</span>
          </Link>
          <form action={logout}>
            <button type="submit" className={styles.ghostBtn}>ログアウト</button>
          </form>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageTitleRow}>
          <h1 className={styles.pageTitle}>
            投稿一覧
            <span className={styles.count}>{total}件</span>
          </h1>
          <AdminToolbar />
        </div>

        <div className={styles.list}>
          {posts.map((post) => {
            const imgUrl = getFeaturedImageUrl(post);
            const isDraft = post.status === 'draft';
            const plainTitle = post.title.rendered.replace(/<[^>]*>/g, '');
            return (
              <div key={post.id} className={`${styles.item} ${isDraft ? styles.itemDraft : ''}`}>
                <div className={styles.thumb}>
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt="" className={styles.thumbImg} />
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
                    {isDraft && <span className={styles.draftBadge}>下書き</span>}
                  </div>
                  {post.status === 'publish' ? (
                    <Link href={`/journal/${post.id}`} target="_blank" className={styles.title}>
                      {plainTitle}
                    </Link>
                  ) : (
                    <span className={`${styles.title} ${styles.titleDraft}`}>{plainTitle}</span>
                  )}
                </div>
                <PostActions postId={post.id} />
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {page > 1 && <Link href={`/admin?page=${page - 1}`} className={styles.pageBtn}>← 前</Link>}
            <span className={styles.pageInfo}>{page} / {totalPages}</span>
            {page < totalPages && <Link href={`/admin?page=${page + 1}`} className={styles.pageBtn}>次 →</Link>}
          </div>
        )}
      </main>
    </div>
  );
}
