import Link from 'next/link';
import { getAdminGalleryPhotos } from '@/lib/wordpress';
import PhotoManager from '@/components/admin/PhotoManager';
import styles from '../admin.module.css';

export const metadata = {
    title: { absolute: 'Photos | Shine a Light' },
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function AdminPhotosPage() {
    const photos = await getAdminGalleryPhotos();

    return (
        <>
            <main className={styles.main}>
                <PhotoManager initialPhotos={photos} />
            </main>
    </>
    );
}
