import Link from 'next/link';
import HeaderActions from '@/components/admin/HeaderActions';
import styles from '../admin.module.css';

export const metadata = {
  title: { absolute: 'SAL Map | Shine a Light' },
  robots: { index: false, follow: false },
};

/** SAL のエコシステム図。本体は data/sal-map.html（/admin/sal-map/raw で配信） */
export default function AdminSalMapPage() {
  return (
    <>
      <HeaderActions>
        <Link href="/admin/sal-map/raw" target="_blank" className={styles.ghostBtn}>新しいタブで開く ↗</Link>
      </HeaderActions>
      <main className={styles.mapMain}>
        <iframe src="/admin/sal-map/raw" title="SAL エコシステム図" className={styles.mapFrame} />
      </main>
    </>
  );
}
