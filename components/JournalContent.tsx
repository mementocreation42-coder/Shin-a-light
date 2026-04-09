'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WPPost, WPCategory, getFeaturedImageUrl, stripHtml, formatDate } from '@/lib/wordpress';

interface JournalContentProps {
    initialPosts: WPPost[];
    categories: WPCategory[];
}

const POSTS_PER_PAGE = 12;

export default function JournalContent({ initialPosts, categories }: JournalContentProps) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter posts based on selected category
    const filteredPosts = useMemo(() => {
        if (!selectedCategory) {
            return initialPosts;
        }
        return initialPosts.filter(post =>
            post.categories.includes(selectedCategory)
        );
    }, [initialPosts, selectedCategory]);

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

    const paginatedPosts = useMemo(() => {
        const start = (currentPage - 1) * POSTS_PER_PAGE;
        return filteredPosts.slice(start, start + POSTS_PER_PAGE);
    }, [filteredPosts, currentPage]);

    const handleCategoryClick = (categoryId: number | null) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);
    };

    const getPageNumbers = (): (number | '...')[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | '...')[] = [1];
        if (currentPage > 3) pages.push('...');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
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
            if (indexA === -1) return 1; // Put unknown categories at the end
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
                                        <div className="journal-card-image">
                                            <Image
                                                src={imageUrl}
                                                alt={post.title.rendered.replace(/<[^>]*>/g, '')}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                style={{ objectFit: 'cover' }}
                                            />
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
                        onClick={() => setCurrentPage(p => p - 1)}
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
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                        )}
                    </div>
                    <button
                        className={`pagination-arrow${currentPage === totalPages ? ' disabled' : ''}`}
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
