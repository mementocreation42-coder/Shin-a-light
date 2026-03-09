import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, getCategories } from '@/lib/wordpress';
import JournalContent from '@/components/JournalContent';

export const metadata: Metadata = {
    title: 'Journal | Shine a Light',
    description: 'Hyperpast Journal',
    alternates: {
        canonical: '/journal',
    },
};

export const revalidate = 60;

export default async function JournalPage() {
    // サーバーサイドで全投稿と全カテゴリーを一括取得
    const [posts, categories] = await Promise.all([
        getAllPosts(),
        getCategories()
    ]);

    // 記事が存在するカテゴリーのみをフィルタリング
    // または、必要なカテゴリーだけに絞る（AI, Fishing, Healthなど）
    // WPのカテゴリー構造に合わせて空のカテゴリーを除外
    const activeCategories = categories.filter(cat =>
        cat.count > 0 && cat.slug !== 'journal' // 'Journal'は親カテゴリーなので除外
    );

    return (
        <main className="journal-page">
            <div className="section-inner">
                <div className="section-header" style={{ justifyContent: 'center' }}>
                    <h1>Hyperpast Journal</h1>
                </div>

                <JournalContent
                    initialPosts={posts}
                    categories={activeCategories}
                />
            </div>
        </main>
    );
}
