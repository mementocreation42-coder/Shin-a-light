import Link from 'next/link';
import { getAdminPosts, getFeaturedThumbUrl, formatDate, stripHtml } from '@/lib/wordpress';
import { countByStatus } from '@/lib/newsletter';
import { listGalleries } from '@/lib/gallery';
import { isDbConfigured } from '@/lib/db';
import SalMark from '@/components/SalMark';
import styles from './dashboard.module.css';

export const metadata = {
  title: { absolute: 'Dashboard | Shine a Light' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

/** 失敗しても画面全体を落とさない。数字は「—」で出す */
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (error) {
    console.error('[dashboard]', error);
    return fallback;
  }
}

/**
 * SAL ダッシュボード（管理画面のトップ）。
 * いま何件あるかと、最近の投稿と、次にやることへの入口だけを置く。
 */
export default async function AdminDashboardPage() {
  const empty = { posts: [], totalPages: 0, total: 0 };
  const [recent, drafts, ideas, scheduled, galleries, subscribers] = await Promise.all([
    safe(getAdminPosts(1, 6), empty),
    safe(getAdminPosts(1, 1, { status: 'draft' }), empty),
    safe(getAdminPosts(1, 1, { status: 'pending' }), empty),
    safe(getAdminPosts(1, 1, { status: 'future' }), empty),
    safe(listGalleries(), []),
    isDbConfigured() ? safe(countByStatus(), {} as Record<string, number>) : Promise.resolve(null),
  ]);

  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
  const num = (n: number | null | undefined) => (n === null || n === undefined ? '—' : n.toLocaleString());

  return (
    <main className={styles.main}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>
          <SalMark size={26} />
          SAL ダッシュボード
        </h1>
        <span className={styles.date}>{today}</span>
      </div>

      <div className={styles.stats}>
        <Link href="/admin/posts" className={styles.stat}>
          <span className={styles.statValue}>{num(recent.total)}</span>
          <span className={styles.statLabel}>投稿（公開・予約・下書き）</span>
        </Link>
        <Link href="/admin/posts?status=draft" className={styles.stat}>
          <span className={`${styles.statValue} ${drafts.total === 0 ? styles.statValueMuted : ''}`}>{num(drafts.total)}</span>
          <span className={styles.statLabel}>下書き</span>
        </Link>
        <Link href="/admin/ideas" className={styles.stat}>
          <span className={`${styles.statValue} ${ideas.total === 0 ? styles.statValueMuted : ''}`}>{num(ideas.total)}</span>
          <span className={styles.statLabel}>記事ネタ</span>
        </Link>
        <Link href="/admin/newsletter" className={styles.stat}>
          <span className={`${styles.statValue} ${!subscribers ? styles.statValueMuted : ''}`}>{num(subscribers?.active)}</span>
          <span className={styles.statLabel}>ニュースレター 配信対象</span>
        </Link>
        <Link href="/admin/galleries" className={styles.stat}>
          <span className={`${styles.statValue} ${galleries.length === 0 ? styles.statValueMuted : ''}`}>{num(galleries.length)}</span>
          <span className={styles.statLabel}>メメント</span>
        </Link>
      </div>

      <div className={styles.cols}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <span>最近の投稿{scheduled.total > 0 && <span style={{ fontWeight: 400, color: '#888' }}>　予約 {scheduled.total} 件</span>}</span>
            <Link href="/admin/posts">すべて見る →</Link>
          </div>
          {recent.posts.length === 0 ? (
            <p className={styles.empty}>投稿を読み込めませんでした。</p>
          ) : (
            recent.posts.map((post) => {
              const thumb = getFeaturedThumbUrl(post);
              const label = post.status === 'draft' ? '下書き' : post.status === 'future' ? '予約' : '';
              return (
                <Link key={post.id} href={`/admin/posts/${post.id}/edit`} className={styles.row}>
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" loading="lazy" decoding="async" className={styles.rowThumb} />
                  ) : (
                    <span className={styles.rowThumbEmpty} />
                  )}
                  <span className={styles.rowTitle}>{stripHtml(post.title.rendered)}</span>
                  <span className={styles.rowMeta}>{label ? `${label} · ` : ''}{formatDate(post.date)}</span>
                </Link>
              );
            })
          )}
        </section>

        <aside>
          <section className={styles.panel} style={{ marginBottom: 16 }}>
            <div className={styles.panelHead}><span>いまやる</span></div>
            <div className={styles.actions}>
              <Link href="/admin/post" className={`${styles.action} ${styles.actionPrimary}`}><span className={styles.actionIcon}>＋</span>新規投稿</Link>
              <Link href="/admin/ideas" className={styles.action}><span className={styles.actionIcon}>✎</span>ネタを書き留める</Link>
              <Link href="/admin/newsletter" className={styles.action}><span className={styles.actionIcon}>✉</span>ニュースレターを書く</Link>
              <Link href="/admin/photos" className={styles.action}><span className={styles.actionIcon}>▣</span>写真を追加する</Link>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><span>SAL のなか</span></div>
            <div className={styles.sections}>
              <Link href="/admin/posts" className={styles.section}><span className={styles.sectionLabel}>記事</span><span className={styles.sectionSub}>投稿管理・記事ネタ</span></Link>
              <Link href="/admin/photos" className={styles.section}><span className={styles.sectionLabel}>写真</span><span className={styles.sectionSub}>フォト管理・メメント</span></Link>
              <Link href="/admin/newsletter" className={styles.section}><span className={styles.sectionLabel}>届ける</span><span className={styles.sectionSub}>ニュースレター</span></Link>
              <Link href="/admin/site-images" className={styles.section}><span className={styles.sectionLabel}>サイト</span><span className={styles.sectionSub}>Pro ページ・ツールズ</span></Link>
            </div>
            <Link href="/admin/sal-map" className={styles.map}>
              <SalMark size={30} />
              <span>SAL 図 — 3 つの円と毎日のループ</span>
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
