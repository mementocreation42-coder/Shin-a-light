import React from 'react';
import type { Metadata } from 'next';
import { getPosts, getCategories, GALLERY_CATEGORY_SLUG } from '@/lib/wordpress';
import JournalContent from '@/components/JournalContent';

export const metadata: Metadata = {
    title: 'Journal — Hyperpast / 小林大介のブログ',
    description: '映像・写真・Web・AI・健康・自然——領域を横断するクリエイティブのB面を記録するジャーナル。徳島・牟岐町から発信。',
    alternates: {
        canonical: '/journal',
    },
    openGraph: {
        title: 'Journal — Hyperpast / 小林大介のブログ',
        description: '映像・写真・Web・AI・健康・自然——領域を横断するクリエイティブのB面を記録するジャーナル。',
        url: '/journal',
        siteName: 'Shine a Light',
        locale: 'ja_JP',
        type: 'website',
        images: ['/opengraph-image'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Journal | Hyperpast',
        description: '映像・写真・Web・AI・健康・自然のジャーナル。',
        images: ['/opengraph-image'],
    },
};

export const revalidate = 3600;

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JournalPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page ?? '1');
    const categoryId = params.cat ? Number(params.cat) : undefined;

    const [{ posts, totalPages }, categories] = await Promise.all([
        getPosts(page, 24, categoryId),
        getCategories()
    ]);

    const activeCategories = categories.filter(cat =>
        cat.count > 0 && cat.slug !== 'journal' && cat.slug !== GALLERY_CATEGORY_SLUG
    );

    return (
        <main className="journal-page">
            <div className="section-inner">
                <div className="section-header" style={{ justifyContent: 'center' }}>
                    <h1 className="journal-page-title">
                        <span className="hyperpast-label">Hyperpast</span>
                        <span className="journal-main-word">Journal</span>
                    </h1>
                </div>

                <JournalContent
                    posts={posts}
                    categories={activeCategories}
                    currentPage={page}
                    totalPages={totalPages}
                    selectedCategory={categoryId ?? null}
                />
            </div>
        </main>
    );
}
