import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import SiteImageManager from '@/components/admin/SiteImageManager';
import styles from '../admin.module.css';

export const metadata = {
    title: { absolute: 'Site Images | Shine a Light' },
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default function AdminSiteImagesPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.logo}>SAL</Link>
                    <span className={styles.logoBadge}>ADMIN</span>
                    <AdminNav />
                </div>
                <div className={styles.headerRight}>
                    <Link href="/pro" target="_blank" className={styles.ghostBtn}>公開ページを見る ↗</Link>
                </div>
            </header>
            <main className={styles.main}>
                <SiteImageManager />
            </main>
        </div>
    );
}
