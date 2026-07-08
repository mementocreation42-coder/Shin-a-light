'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { YouTubeVideo } from '@/lib/youtube';

function formatViews(views: number): string {
    if (views >= 10000) return `${Math.floor(views / 1000) / 10}万回`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return `${views}回`;
}

export default function VideoCard({ video }: { video: YouTubeVideo }) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // モーダル表示中は背景スクロールを止め、Esc で閉じる
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open]);

    return (
        <li className={`video-card ${video.isShort ? 'is-short' : ''}`}>
            <div className="video-thumb">
                <button
                    type="button"
                    className="video-thumb-btn"
                    onClick={() => setOpen(true)}
                    aria-label={`${video.title} を再生`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={video.thumbnail} alt={video.title} loading="lazy" />
                    {video.isShort && <span className="video-badge">SHORT</span>}
                    <span className="video-play" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
                        </svg>
                    </span>
                </button>
            </div>

            <div className="video-info">
                <h2 className="video-title">
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                        {video.title}
                    </a>
                </h2>
                <div className="video-meta">
                    <span>{video.published}</span>
                    {video.views !== null && (
                        <>
                            <span className="video-meta-dot">・</span>
                            <span>{formatViews(video.views)}</span>
                        </>
                    )}
                </div>
            </div>

            {mounted &&
                open &&
                createPortal(
                    <div
                        className="video-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={video.title}
                        onClick={() => setOpen(false)}
                    >
                        <button
                            type="button"
                            className="video-modal-close"
                            onClick={() => setOpen(false)}
                            aria-label="閉じる"
                        >
                            ×
                        </button>
                        <div
                            className={`video-modal-inner ${video.isShort ? 'is-short' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <iframe
                                className="video-modal-iframe"
                                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </li>
    );
}
