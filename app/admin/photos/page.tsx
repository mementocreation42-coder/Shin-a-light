import Link from 'next/link';
import { getAdminGalleryPhotos } from '@/lib/wordpress';
import PhotoManager from '@/components/admin/PhotoManager';
import AdminNav from '@/components/admin/AdminNav';
import styles from '../admin.module.css';

export const metadata = {
    title: { absolute: 'Photos | Shine a Light' },
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function AdminPhotosPage() {
    const photos = await getAdminGalleryPhotos();

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/admin" className={styles.logo}>SAL</Link>
                    <span className={styles.logoBadge}>ADMIN</span>
                    <AdminNav />
                </div>
                <div className={styles.headerRight}>
                    <Link href="/photos" target="_blank" className={styles.ghostBtn}>公開ページを見る ↗</Link>
                </div>
            </header>
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 80px' }}>
                <PhotoManager initialPhotos={photos} />
            </main>
        </div>
    );
}
