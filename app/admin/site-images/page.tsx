import Link from 'next/link';
import SiteImageManager from '@/components/admin/SiteImageManager';
import styles from '../admin.module.css';

export const metadata = {
    title: { absolute: 'Site Images | Shine a Light' },
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default function AdminSiteImagesPage() {
    return (
        <>
            <main className={styles.main}>
                <SiteImageManager />
            </main>
    </>
    );
}
