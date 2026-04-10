'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WPPost, WPCategory, getFeaturedImageUrl, stripHtml, formatDate } from '@/lib/wordpress';

interface JournalContentProps {
    posts: WPPost[];
    categories: WPCategory[];
    currentPage: number;
    totalPages: number;
    selectedCategory: number | null;
}

export default function JournalContent({
    posts,
    categories,
    currentPage,
    totalPages,
    selectedCategory,
}: JournalContentProps) {
    const router = useRouter();
    const [isTransitioning, setIsTransitioning] = useState(false);

    // propsが変わった（=新しいデータが来た）らトランジション解除
    useEffect(() => {
        setIsTransitioning(false);
    }, [posts, currentPage, selectedCategory]);

    const navigate = useCallback((page: number, cat: number | null) => {
        const params = new URLSearchParams();
        if (cat) params.set('cat', String(cat));
        if (page > 1) params.set('page', String(page));
        const query = params.toString();
        setIsTransitioning(true);
        router.push(`/journal${query ? `?${query}` : ''}`);
    }, [router]);

    const handleCategoryClick = (categoryId: number | null) => {
        navigate(1, categoryId);
    };

    const handlePageClick = (page: number) => {
        navigate(page, selectedCategory);
    };

    // ページ番号リスト
    const getPageNumbers = (): (number | '...')[] => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages: (number | '...')[] = [];
        const start = Math.max(1, currentPage - 1);
        const end = Math.min(currentPage + 1, totalPages);
        if (start > 1) pages.push(1);
        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push('...');
        if (end < totalPages) pages.push(totalPages);
        return pages;
    };

    // Desired category order based on slug
    const categoryOrder = ['ai', 'video', 'photo', 'web', 'tools', 'hpmj'];

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
                    <button
                        className={`journal-category-btn ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(null)}
                    >
                        ALL
                    </button>
                    {sortedCategories.map((category) => (
                        <button
                            key={category.id}
                            className={`journal-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category.id)}
                            data-category={category.slug}
                        >
                            {categoryLabels[category.slug] ?? category.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Posts Grid */}
            <ul className="journal-grid" style={{
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 0.15s ease',
            }}>
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
                    <button
                        className={`pagination-arrow${currentPage === 1 ? ' disabled' : ''}`}
                        onClick={() => handlePageClick(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ← Prev
                    </button>
                    <div className="pagination-numbers">
                        {getPageNumbers().map((page, i) =>
                            page === '...'
                                ? <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
                                : <button
                                    key={page}
                                    className={`pagination-link${currentPage === page ? ' active' : ''}`}
                                    onClick={() => handlePageClick(page)}
                                >
                                    {page}
                                </button>
                        )}
                    </div>
                    <button
                        className={`pagination-arrow${currentPage === totalPages ? ' disabled' : ''}`}
                        onClick={() => handlePageClick(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
