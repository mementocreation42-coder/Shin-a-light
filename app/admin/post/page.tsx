import Link from 'next/link';
import { getCategories } from '@/lib/wordpress';
import PostEditor from '@/components/admin/PostEditor';
import styles from '../admin.module.css';

export const metadata = {
  title: { absolute: 'New Post | Shine a Light' },
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  const categories = await getCategories();

  return (
    <main className={styles.editorMain}>
      <p className={styles.crumbs}><Link href="/admin/posts">投稿一覧</Link> / 新規投稿</p>
      <PostEditor categories={categories} />
    </main>
  );
}
