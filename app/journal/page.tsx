import React from 'react';
import type { Metadata } from 'next';
import { getPosts, getCategories } from '@/lib/wordpress';
import JournalContent from '@/components/JournalContent';

export const metadata: Metadata = {
    title: 'Journal | Shine a Light',
    description: 'Hyperpast Journal',
    alternates: {
        canonical: '/journal',
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

    // サーバーサイドで該当ページ分だけ取得（12件）
    const [{ posts, totalPages }, categories] = await Promise.all([
        getPosts(page, 20, categoryId),
        getCategories()
    ]);

    const activeCategories = categories.filter(cat =>
        cat.count > 0 && cat.slug !== 'journal'
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
