import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminPostById, getCategories, getFeaturedImageUrl, stripHtml } from '@/lib/wordpress';
import PostEditor from '@/components/admin/PostEditor';
import HeaderActions from '@/components/admin/HeaderActions';
import styles from '../../../admin.module.css';

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
    title: stripHtml(post.title.rendered),
    date: post.date.split('T')[0],
    categoryIds: post.categories,
    content: post.content.rendered,
    // 予約(future)は編集上は「公開」として扱う。日付が未来のまま保存すると
    // WordPress 側が自動で予約に戻す（コアの標準動作）
    status: (post.status === 'private' || post.status === 'future' ? 'publish' : post.status) as
        'publish' | 'draft' | 'pending',
    featuredMediaId: post.featured_media ?? 0,
    featuredImageUrl: getFeaturedImageUrl(post) ?? undefined,
  };

  return (
    <>
      {post.status === 'publish' && (
        <HeaderActions>
          <Link href={`/journal/${id}`} target="_blank" className={styles.ghostBtn}>この投稿を見る ↗</Link>
        </HeaderActions>
      )}
      <main className={styles.editorMain}>
        <p className={styles.crumbs}><Link href="/admin/posts">投稿一覧</Link> / 投稿を編集</p>
        <PostEditor categories={categories} initialData={initialData} />
      </main>
    </>
  );
}
