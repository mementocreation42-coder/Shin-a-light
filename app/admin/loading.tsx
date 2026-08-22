import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import styles from './admin.module.css';

// 管理画面はすべて WP API 待ちで描画が遅れるので、
// ヘッダーだけ先に出して「押した感」を返す（本体は streaming で差し替わる）
export default function AdminLoading() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.logo}>SAL</Link>
          <span className={styles.logoBadge}>ADMIN</span>
          <AdminNav />
        </div>
      </header>
      <main className={styles.main}>
        <p className={styles.emptyState} aria-busy="true">読み込み中…</p>
      </main>
    </div>
  );
}
