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
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin" className={styles.logo}>SAL</Link>
          <Link href="/admin" className={styles.breadcrumb}>/ 投稿一覧</Link>
          <span className={styles.breadcrumb}>/ 新規投稿</span>
        </div>
      </header>

      <main className={styles.editorMain}>
        <PostEditor categories={categories} />
      </main>
    </div>
  );
}
