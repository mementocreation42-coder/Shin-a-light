import AdminHeader from '@/components/admin/AdminHeader';
import styles from './admin.module.css';

/**
 * 管理画面の共通の枠。ヘッダー（2 段ナビ）はここで一度だけ描く。
 * 各ページは <main> から先だけを返す。ページ固有のボタンは HeaderActions で差し込む。
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <AdminHeader />
      {children}
    </div>
  );
}
