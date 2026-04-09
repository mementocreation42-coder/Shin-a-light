import Link from 'next/link';
import { getCategories } from '@/lib/wordpress';
import PostEditor from '@/components/admin/PostEditor';

export const metadata = { title: { absolute: '新規投稿 | SAL Admin' } };

export default async function NewPostPage() {
  const categories = await getCategories();

  return (
    <div style={{ minHeight: '100vh', background: '#1e1e1e', fontFamily: 'var(--font-mono), monospace', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#2a2a2a', borderBottom: '1px solid #3a3a3a', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <Link href="/admin" style={{ fontSize: '16px', fontWeight: 700, color: '#ff764d', letterSpacing: '2px', textDecoration: 'none' }}>SAL</Link>
          <span style={{ fontSize: '12px', color: '#666' }}>/ 新規投稿</span>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '32px' }}>新規投稿</h1>
        <PostEditor categories={categories} />
      </main>
    </div>
  );
}
