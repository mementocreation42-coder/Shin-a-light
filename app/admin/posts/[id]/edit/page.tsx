import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminPostById, getCategories } from '@/lib/wordpress';
import PostEditor from '@/components/admin/PostEditor';

export const metadata = {
  title: { absolute: 'Edit Post | Shine a Light' },
  robots: { index: false, follow: false },
};

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getAdminPostById(id), getCategories()]);

  if (!post) notFound();

  const initialData = {
    id,
    title: post.title.rendered.replace(/<[^>]*>/g, ''),
    date: post.date.split('T')[0],
    categoryIds: post.categories,
    content: post.content.rendered,
    status: post.status === 'private' ? 'publish' : post.status,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1e1e1e', fontFamily: 'var(--font-mono), monospace', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#2a2a2a', borderBottom: '1px solid #3a3a3a', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <Link href="/admin" style={{ fontSize: '16px', fontWeight: 700, color: '#ff764d', letterSpacing: '2px', textDecoration: 'none' }}>SAL</Link>
          <span style={{ fontSize: '12px', color: '#666' }}>/ 投稿を編集</span>
        </div>
        {post.status === 'publish' && (
          <Link href={`/journal/${id}`} target="_blank" style={{ fontSize: '12px', color: '#a0a0a0', textDecoration: 'none' }}>
            公開ページを見る →
          </Link>
        )}
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '32px' }}>投稿を編集</h1>
        <PostEditor categories={categories} initialData={initialData} />
      </main>
    </div>
  );
}
