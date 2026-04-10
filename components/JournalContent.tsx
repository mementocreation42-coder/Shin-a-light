'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { WPPost, WPCategory, getFeaturedImageUrl, stripHtml, formatDate } from '@/lib/wordpress';

interface JournalContentProps {
    initialPosts: WPPost[];
    categories: WPCategory[];
}

const POSTS_PER_PAGE = 12;

export default function JournalContent({ initialPosts, categories }: JournalContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectedCategory = searchParams.get('cat') ? Number(searchParams.get('cat')) : null;
    const currentPage = Number(searchParams.get('page') ?? '1');

    const updateParams = useCallback((page: number, cat: number | null) => {
        const params = new URLSearchParams();
        if (cat) params.set('cat', String(cat));
        if (page > 1) params.set('page', String(page));
        const query = params.toString();
        router.push(`/journal${query ? `?${query}` : ''}`, { scroll: false });
    }, [router]);

    // Filter posts based on selected category
    const filteredPosts = useMemo(() => {
        if (!selectedCategory) return initialPosts;
        return initialPosts.filter(post => post.categories.includes(selectedCategory));
    }, [initialPosts, selectedCategory]);

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

    const paginatedPosts = useMemo(() => {
        const start = (currentPage - 1) * POSTS_PER_PAGE;
        return filteredPosts.slice(start, start + POSTS_PER_PAGE);
    }, [filteredPosts, currentPage]);

    const handleCategoryClick = (categoryId: number | null) => {
        updateParams(1, categoryId);
    };

    // 現在地の前後1ページを表示。最終ページは番号に出さず ... で示す
    const getPageNumbers = (): (number | '...')[] => {
        const pages: (number | '...')[] = [];
        const start = Math.max(1, currentPage - 1);
        const end = Math.min(currentPage + 1, totalPages - 1); // 最終ページは含めない
        for (let i = start; i <= end; i++) pages.push(i);
        pages.push('...');
        return pages;
    };

    // Desired category order based on slug
    const categoryOrder = [
        'ai', 'video', 'photo', 'web', 'tools', 'hpmj'
    ];

    // Display name overrides (slug → label)
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
            <ul className="journal-grid">
                {paginatedPosts.length > 0 ? (
                    paginatedPosts.map((post) => {
                        const imageUrl = getFeaturedImageUrl(post);

                        // Find all categories for badges
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
                        onClick={() => updateParams(currentPage - 1, selectedCategory)}
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
                                    onClick={() => updateParams(page, selectedCategory)}
                                >
                                    {page}
                                </button>
                        )}
                    </div>
                    <button
                        className={`pagination-arrow${currentPage === totalPages ? ' disabled' : ''}`}
                        onClick={() => updateParams(currentPage + 1, selectedCategory)}
                        disabled={currentPage === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
