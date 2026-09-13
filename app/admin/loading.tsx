import styles from './admin.module.css';

// 管理画面はすべて WP API 待ちで描画が遅れる。
// ヘッダーは layout が先に出すので、ここは本体の「読み込み中」だけ返す。
export default function AdminLoading() {
  return (
    <main className={styles.main}>
      <p className={styles.emptyState} aria-busy="true">読み込み中…</p>
    </main>
  );
}
