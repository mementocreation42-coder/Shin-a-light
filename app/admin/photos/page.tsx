import Link from 'next/link';
import { getAdminGalleryPhotos } from '@/lib/wordpress';
import PhotoManager from '@/components/admin/PhotoManager';

export const metadata = {
    title: { absolute: 'Photos | Shine a Light' },
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function AdminPhotosPage() {
    const photos = await getAdminGalleryPhotos();

    return (
        <div style={{ minHeight: '100vh', background: '#1e1e1e', fontFamily: 'var(--font-mono), monospace', color: '#fff' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#2a2a2a', borderBottom: '1px solid #3a3a3a', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <Link href="/admin" style={{ fontSize: '16px', fontWeight: 700, color: '#ff764d', letterSpacing: '2px', textDecoration: 'none' }}>SAL</Link>
                    <span style={{ fontSize: '11px', color: '#666' }}>/ フォト管理</span>
                </div>
                <Link href="/photos" target="_blank" style={{ fontSize: '12px', color: '#a0a0a0', textDecoration: 'none' }}>公開ページを見る ↗</Link>
            </header>
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
                <PhotoManager initialPhotos={photos} />
            </main>
        </div>
    );
}
