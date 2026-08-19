import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminPostById, getCategories, getFeaturedImageUrl } from '@/lib/wordpress';
import PostEditor from '@/components/admin/PostEditor';
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
    title: post.title.rendered.replace(/<[^>]*>/g, ''),
    date: post.date.split('T')[0],
    categoryIds: post.categories,
    content: post.content.rendered,
    // 予約(future)は編集上は「公開」として扱う。日付が未来のまま保存すると
    // WordPress 側が自動で予約に戻す（コアの標準動作）
    status: post.status === 'private' || post.status === 'future' ? 'publish' : post.status,
    featuredMediaId: post.featured_media ?? 0,
    featuredImageUrl: getFeaturedImageUrl(post) ?? undefined,
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin" className={styles.logo}>SAL</Link>
          <Link href="/admin" className={styles.breadcrumb}>/ 投稿一覧</Link>
          <span className={styles.breadcrumb}>/ 投稿を編集</span>
        </div>
        <div className={styles.headerRight}>
          {post.status === 'publish' && (
            <Link href={`/journal/${id}`} target="_blank" className={styles.ghostBtn}>
              公開ページを見る ↗
            </Link>
          )}
          <div id="post-editor-actions" />
        </div>
      </header>

      <main className={styles.editorMain}>
        <PostEditor categories={categories} initialData={initialData} />
      </main>
    </div>
  );
}
