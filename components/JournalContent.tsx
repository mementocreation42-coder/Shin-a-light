'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { WPPost, WPCategory, getFeaturedImageUrl, stripHtml, formatDate } from '@/lib/wordpress';

interface JournalContentProps {
    initialPosts: WPPost[];
    categories: WPCategory[];
}

export default function JournalContent({ initialPosts, categories }: JournalContentProps) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    // Filter posts based on selected category
    const filteredPosts = useMemo(() => {
        if (!selectedCategory) {
            return initialPosts;
        }
        return initialPosts.filter(post =>
            post.categories.includes(selectedCategory)
        );
    }, [initialPosts, selectedCategory]);

    const handleCategoryClick = (categoryId: number | null) => {
        setSelectedCategory(categoryId);
    };

    // Desired category order based on slug
    const categoryOrder = [
        'ai', 'health', 'fishing', 'video', 'photo', 'web', 'gear', 'hpmj'
    ];

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
                        すべて
                    </button>
                    {sortedCategories.map((category) => (
                        <button
                            key={category.id}
                            className={`journal-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category.id)}
                            data-category={category.slug}
                        >
                            {category.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Posts Grid */}
            <ul className="journal-grid">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => {
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
                                                            {cat.name}
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
        </div>
    );
}
