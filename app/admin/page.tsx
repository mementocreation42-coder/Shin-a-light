import Link from 'next/link';
import { getAdminPosts, getFeaturedImageUrl, formatDate } from '@/lib/wordpress';
import { logout } from '@/app/login/actions';
import PostActions from '@/components/admin/PostActions';

export const metadata = { title: { absolute: 'ダッシュボード | SAL Admin' } };
export const dynamic = 'force-dynamic';

const s = {
  page: { minHeight: '100vh', background: '#1e1e1e', fontFamily: 'var(--font-mono), monospace', color: '#fff' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#2a2a2a', borderBottom: '1px solid #3a3a3a', position: 'sticky', top: 0, zIndex: 10 } as React.CSSProperties,
  logo: { fontSize: '16px', fontWeight: 700, color: '#ff764d', letterSpacing: '2px' } as React.CSSProperties,
  badge: { fontSize: '10px', color: '#666', letterSpacing: '2px', marginLeft: '8px' } as React.CSSProperties,
  main: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' } as React.CSSProperties,
  newBtn: { padding: '10px 20px', background: '#ff764d', color: '#fff', borderRadius: '6px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.5px' } as React.CSSProperties,
  logoutBtn: { padding: '10px 20px', background: 'transparent', border: '1px solid #3a3a3a', color: '#666', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
  pageTitle: { display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' } as React.CSSProperties,
  count: { fontSize: '12px', color: '#666' } as React.CSSProperties,
  list: { display: 'flex', flexDirection: 'column', gap: '1px', background: '#3a3a3a', border: '1px solid #3a3a3a', borderRadius: '10px', overflow: 'hidden' } as React.CSSProperties,
  item: { background: '#2a2a2a', padding: '16px 20px' } as React.CSSProperties,
  row: { display: 'flex', gap: '16px', alignItems: 'flex-start' } as React.CSSProperties,
  thumb: { width: '72px', height: '48px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: '#3a3a3a' } as React.CSSProperties,
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' } as React.CSSProperties,
  info: { flex: 1, minWidth: 0 } as React.CSSProperties,
  meta: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' } as React.CSSProperties,
  date: { fontSize: '11px', color: '#666' } as React.CSSProperties,
  catTag: { fontSize: '10px', padding: '2px 8px', background: '#3a3a3a', borderRadius: '10px', color: '#a0a0a0' } as React.CSSProperties,
  draftBadge: { fontSize: '10px', padding: '2px 8px', background: 'rgba(255,118,77,0.15)', border: '1px solid #ff764d', borderRadius: '10px', color: '#ff764d', marginLeft: '6px' } as React.CSSProperties,
  title: { fontSize: '14px', fontWeight: 600, color: '#fff', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, display: 'block' } as React.CSSProperties,
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '32px' } as React.CSSProperties,
  pageBtn: { padding: '8px 16px', background: '#2a2a2a', border: '1px solid #3a3a3a', color: '#a0a0a0', borderRadius: '6px', fontSize: '13px', textDecoration: 'none' } as React.CSSProperties,
  pageInfo: { fontSize: '13px', color: '#666' } as React.CSSProperties,
} as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1', 10);
  const { posts, totalPages, total } = await getAdminPosts(page, 20);

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={s.logo}>SAL</span>
          <span style={s.badge}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/admin/post" style={s.newBtn}>+ 新規投稿</Link>
          <form action={logout}>
            <button type="submit" style={s.logoutBtn}>ログアウト</button>
          </form>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.pageTitle}>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>投稿一覧</h1>
          <span style={s.count}>{total}件</span>
        </div>

        <div style={s.list}>
          {posts.map((post) => {
            const imgUrl = getFeaturedImageUrl(post);
            return (
              <div key={post.id} style={s.item}>
                <div style={s.row}>
                  {imgUrl && (
                    <div style={s.thumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt="" style={s.thumbImg as React.CSSProperties} />
                    </div>
                  )}
                  <div style={s.info}>
                    <div style={s.meta}>
                      <time style={s.date}>{formatDate(post.date)}</time>
                      {post._embedded?.['wp:term']?.[0]?.map((cat) => (
                        <span key={cat.id} style={s.catTag}>{cat.name}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {post.status === 'publish' ? (
                        <Link href={`/journal/${post.id}`} target="_blank" style={s.title}>
                          {post.title.rendered.replace(/<[^>]*>/g, '')}
                        </Link>
                      ) : (
                        <span style={s.title}>{post.title.rendered.replace(/<[^>]*>/g, '')}</span>
                      )}
                      {post.status === 'draft' && <span style={s.draftBadge}>下書き</span>}
                    </div>
                  </div>
                </div>
                <PostActions postId={post.id} />
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div style={s.pagination}>
            {page > 1 && <Link href={`/admin?page=${page - 1}`} style={s.pageBtn}>← 前</Link>}
            <span style={s.pageInfo}>{page} / {totalPages}</span>
            {page < totalPages && <Link href={`/admin?page=${page + 1}`} style={s.pageBtn}>次 →</Link>}
          </div>
        )}
      </main>
    </div>
  );
}
