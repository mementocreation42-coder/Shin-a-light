import type { Metadata } from 'next';
import { getGalleryPhotos } from '@/lib/wordpress';
import PhotoGallery from '@/components/PhotoGallery';

export const metadata: Metadata = {
    title: 'Photos — Shine a Light / 小林大介の写真',
    description: '徳島・牟岐町の光と自然、旅の記録。小林大介による写真ギャラリー。',
    alternates: {
        canonical: '/photos',
    },
    openGraph: {
        title: 'Photos — Shine a Light',
        description: '徳島・牟岐町の光と自然、旅の記録。小林大介による写真ギャラリー。',
        url: '/photos',
        siteName: 'Shine a Light',
        locale: 'ja_JP',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Photos — Shine a Light',
        description: '小林大介による写真ギャラリー。',
    },
};

export const revalidate = 600;

export default async function PhotosPage() {
    // WordPress 側がタグで category('Archive'|'MEMENTO')を付けて返す。
    const photos = await getGalleryPhotos();

    return (
        <div className="photos-page">
            <header className="photos-header">
                <p className="photos-eyebrow">Gallery</p>
                <h1 className="photos-title">Archives</h1>
            </header>
            <PhotoGallery photos={photos} />
        </div>
    );
}
