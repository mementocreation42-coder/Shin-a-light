import React from 'react';
import Link from 'next/link';
import { getPosts, getFeaturedImageUrl, stripHtml, formatDate } from '@/lib/wordpress';

export const revalidate = 60;

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function JournalPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1', 10);
    const { posts, totalPages } = await getPosts(currentPage, 12);

    return (
        <main className="journal-page">
            <div className="section-inner">
                <div className="section-header">
                    <span className="section-number">Journal</span>
                    <h1>Hyperpast Journal</h1>
                </div>

                <p className="journal-description">
                    過去の出来事、技術、思想を未来の視点から再解釈するために書き残すブログメディア。
                </p>

                <div className="journal-grid">
                    {posts.map((post) => {
                        const imageUrl = getFeaturedImageUrl(post);
                        return (
                            <Link
                                key={post.id}
                                href={`/journal/${post.slug}`}
                                className="journal-card"
                            >
                                {imageUrl && (
                                    <div
                                        className="journal-card-image"
                                        style={{ backgroundImage: `url(${imageUrl})` }}
                                    />
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
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="journal-pagination">
                        {currentPage > 1 ? (
                            <Link href={`/journal?page=${currentPage - 1}`} className="pagination-arrow">
                                ← Prev
                            </Link>
                        ) : (
                            <span className="pagination-arrow disabled">← Prev</span>
                        )}

                        <div className="pagination-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((pageNum) => {
                                    if (pageNum === 1 || pageNum === totalPages) return true;
                                    return Math.abs(pageNum - currentPage) <= 1;
                                })
                                .map((pageNum, idx, array) => {
                                    const prevNum = array[idx - 1];
                                    return (
                                        <React.Fragment key={pageNum}>
                                            {prevNum && pageNum - prevNum > 1 && (
                                                <span className="pagination-ellipsis">...</span>
                                            )}
                                            <Link
                                                href={`/journal?page=${pageNum}`}
                                                className={`pagination-link ${pageNum === currentPage ? 'active' : ''}`}
                                            >
                                                {pageNum}
                                            </Link>
                                        </React.Fragment>
                                    );
                                })}
                        </div>

                        {currentPage < totalPages ? (
                            <Link href={`/journal?page=${currentPage + 1}`} className="pagination-arrow">
                                Next →
                            </Link>
                        ) : (
                            <span className="pagination-arrow disabled">Next →</span>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
