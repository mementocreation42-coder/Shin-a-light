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
                    <Link href="/" className={styles.logo}>SAL</Link>
                    <span className={styles.logoBadge}>ADMIN</span>
                    <AdminNav />
                </div>
                <div className={styles.headerRight}>
                    <Link href="/photos" target="_blank" className={styles.ghostBtn}>公開ページを見る ↗</Link>
                </div>
            </header>
            <main className={styles.main}>
                <PhotoManager initialPhotos={photos} />
            </main>
        </div>
    );
}
