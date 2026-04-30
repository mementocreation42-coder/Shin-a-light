'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { WPPost, WPCategory, getFeaturedImageUrl, stripHtml, formatDate } from '@/lib/wordpress';

interface JournalContentProps {
    posts: WPPost[];
    categories: WPCategory[];
    currentPage: number;
    totalPages: number;
    selectedCategory: number | null;
}

function buildUrl(page: number, cat: number | null): string {
    const params = new URLSearchParams();
    if (cat) params.set('cat', String(cat));
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return `/journal${query ? `?${query}` : ''}`;
}

export default function JournalContent({
    posts,
    categories,
    currentPage,
    totalPages,
    selectedCategory,
}: JournalContentProps) {

    // ページ番号リスト
    const getPageNumbers = (): (number | '...')[] => {
        const pages: (number | '...')[] = [];
        const start = Math.max(1, currentPage - 1);
        const end = Math.min(currentPage + 1, totalPages);
        if (start > 1) pages.push(1);
        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages) pages.push('...');
        return pages;
    };

    const categoryOrder = ['ai', 'video', 'photo', 'life', 'web', 'tools', 'hpmj'];

    const categoryLabels: Record<string, string> = {
        hpmj: 'HpMJ',
    };

    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => {
            const indexA = categoryOrder.indexOf(a.slug);
            const indexB = categoryOrder.indexOf(b.slug);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [categories]);

    return (
        <div className="journal-content-adapter">
            {/* Category Filter Bar */}
            <div className="journal-categories-wrapper">
                <nav className="journal-categories" aria-label="Category filter">
                    <Link
                        href="/journal"
                        className={`journal-category-btn ${selectedCategory === null ? 'active' : ''}`}
                    >
                        ALL
                    </Link>
                    {sortedCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={buildUrl(1, category.id)}
                            className={`journal-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                            data-category={category.slug}
                        >
                            {categoryLabels[category.slug] ?? category.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Posts Grid */}
            <ul className="journal-grid">
                {posts.length > 0 ? (
                    posts.map((post) => {
                        const imageUrl = getFeaturedImageUrl(post);

                        const postCategories = post.categories
                            ? (post.categories
                                .map((catId) => categories.find((c) => c.id === catId))
                                .filter(Boolean) as WPCategory[])
                            : [];

                        return (
                            <li key={post.id} className="journal-card-wrapper animate-fade-in">
                                <Link
                                    href={`/journal/${post.id}`}
                                    className="journal-card"
                                >
                                    {imageUrl && (
                                        <div
                                            className="journal-card-image"
                                            style={{ backgroundImage: `url(${imageUrl})` }}
                                        >
                                            {postCategories.length > 0 && (
                                                <div className="journal-card-category-badges">
                                                    {postCategories.map((cat) => (
                                                        <span
                                                            key={cat.id}
                                                            className="journal-card-category-badge"
                                                            data-category={cat.slug}
                                                        >
                                                            {categoryLabels[cat.slug] ?? cat.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="journal-card-content">
                                        <time className="journal-card-date">
                                            {formatDate(post.date)}
                                        </time>
                                        <h2
                                            className="journal-card-title"
                                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                        />
                                        {postCategories.length > 0 && (
                                            <div className="journal-card-category-badges-inline">
                                                {postCategories.map((cat) => (
                                                    <span
                                                        key={cat.id}
                                                        className="journal-card-category-badge"
                                                        data-category={cat.slug}
                                                    >
                                                        {categoryLabels[cat.slug] ?? cat.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="journal-card-excerpt">
                                            {stripHtml(post.excerpt.rendered).slice(0, 100)}...
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        );
                    })
                ) : (
                    <li className="journal-empty">
                        <p>該当する記事が見つかりませんでした。</p>
                    </li>
                )}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="journal-pagination">
                    {currentPage > 1 ? (
                        <Link
                            href={buildUrl(currentPage - 1, selectedCategory)}
                            className="pagination-arrow"
                        >
                            ← Prev
                        </Link>
                    ) : (
                        <span className="pagination-arrow disabled">← Prev</span>
                    )}
                    <div className="pagination-numbers">
                        {getPageNumbers().map((page, i) =>
                            page === '...'
                                ? <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
                                : <Link
                                    key={page}
                                    href={buildUrl(page, selectedCategory)}
                                    className={`pagination-link${currentPage === page ? ' active' : ''}`}
                                >
                                    {page}
                                </Link>
                        )}
                    </div>
                    {currentPage < totalPages ? (
                        <Link
                            href={buildUrl(currentPage + 1, selectedCategory)}
                            className="pagination-arrow"
                        >
                            Next →
                        </Link>
                    ) : (
                        <span className="pagination-arrow disabled">Next →</span>
                    )}
                </div>
            )}
        </div>
    );
}
