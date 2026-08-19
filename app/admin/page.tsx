import Link from 'next/link';
import { getAdminPosts, getCategories, getFeaturedImageUrl, formatDate } from '@/lib/wordpress';
import { logout } from '@/app/login/actions';
import PostActions from '@/components/admin/PostActions';
import PostFilters from '@/components/admin/PostFilters';
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
  searchParams: Promise<{ page?: string; q?: string; status?: string; cat?: string }>;
}) {
  const { page: pageParam, q, status: statusParam, cat } = await searchParams;
  const page = parseInt(pageParam || '1', 10);
  const search = q?.trim() || undefined;
  const statusFilter =
    statusParam === 'publish' || statusParam === 'draft' || statusParam === 'future'
      ? statusParam
      : undefined;
  const categoryId = cat ? parseInt(cat, 10) || undefined : undefined;

  const [{ posts, totalPages, total }, categories] = await Promise.all([
    getAdminPosts(page, 20, { search, status: statusFilter, categoryId }),
    getCategories(),
  ]);

  // ページ送りのリンクに現在の絞り込みを引き継ぐ
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (statusFilter) params.set('status', statusFilter);
    if (categoryId) params.set('cat', String(categoryId));
    params.set('page', String(target));
    return `/admin?${params.toString()}`;
  };

  const isFiltered = Boolean(search || statusFilter || categoryId);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>SAL</span>
          <span className={styles.logoBadge}>ADMIN</span>
          <AdminNav />
        </div>
        <div className={styles.headerRight}>
          <Link href="/" target="_blank" className={styles.siteLink}>
            <span className={styles.siteLinkText}>サイトを見る</span>
            <span aria-hidden="true">↗</span>
          </Link>
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
            <span className={styles.count}>
              {isFiltered ? `該当 ${total}件` : `${total}件`}
            </span>
          </h1>
        </div>

        <PostFilters categories={categories.map((c) => ({ id: c.id, name: c.name }))} />

        {posts.length === 0 ? (
          <p className={styles.emptyState}>
            {isFiltered ? '条件に一致する投稿がありません。' : '投稿がまだありません。'}
          </p>
        ) : (
        <div className={styles.list}>
          {posts.map((post) => {
            const imgUrl = getFeaturedImageUrl(post);
            const isDraft = post.status === 'draft';
            const isFuture = post.status === 'future';
            const plainTitle = post.title.rendered.replace(/<[^>]*>/g, '');
            return (
              <div key={post.id} className={`${styles.item} ${isDraft || isFuture ? styles.itemDraft : ''}`}>
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
                    {isFuture && (
                      <span className={styles.futureBadge}>
                        予約 {new Date(post.date).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
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
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {page > 1 && <Link href={pageHref(page - 1)} className={styles.pageBtn}>← 前</Link>}
            <span className={styles.pageInfo}>{page} / {totalPages}</span>
            {page < totalPages && <Link href={pageHref(page + 1)} className={styles.pageBtn}>次 →</Link>}
          </div>
        )}
      </main>
    </div>
  );
}
