'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GalleryPhoto } from '@/lib/wordpress';
import styles from './PhotoGallery.module.css';

type PhotoItem = { photo: GalleryPhoto; index: number };

// 画面幅からカラム数を決める（CSSのブレークポイントと一致）
function columnsForWidth(w: number): number {
    if (w <= 560) return 3;
    if (w <= 900) return 4;
    return 5;
}

function useColumnCount(): number {
    // SSR・初期描画はデスクトップ想定（=5）でレンダリングし、マウント後に補正
    const [cols, setCols] = useState(5);
    useEffect(() => {
        const update = () => setCols(columnsForWidth(window.innerWidth));
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    return cols;
}

// 各写真を「一番背の低い列」に順に積む（テトリス的に隙間なく詰める）
function distribute(items: PhotoItem[], cols: number): PhotoItem[][] {
    const columns: PhotoItem[][] = Array.from({ length: cols }, () => []);
    const heights = new Array(cols).fill(0);
    for (const item of items) {
        const { width, height } = item.photo;
        // 列幅は等しいので、相対的な高さ = height / width
        const ratio = width > 0 ? height / width : 1;
        let target = 0;
        for (let c = 1; c < cols; c++) {
            if (heights[c] < heights[target]) target = c;
        }
        columns[target].push(item);
        heights[target] += ratio;
    }
    return columns;
}

export default function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
    const [index, setIndex] = useState<number | null>(null);
    const cols = useColumnCount();

    const close = useCallback(() => setIndex(null), []);
    const prev = useCallback(
        () => setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
        [photos.length]
    );
    const next = useCallback(
        () => setIndex((i) => (i === null ? i : (i + 1) % photos.length)),
        [photos.length]
    );

    useEffect(() => {
        if (index === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [index, close, prev, next]);

    if (photos.length === 0) {
        return <p className={styles.empty}>まだ写真がありません。</p>;
    }

    const active = index === null ? null : photos[index];

    // 日付メタデータから年ごとにグループ化（新しい年が先頭・通し番号は維持）
    const groups: { year: string; items: { photo: GalleryPhoto; index: number }[] }[] = [];
    photos.forEach((photo, i) => {
        const year = new Date(photo.date).getFullYear().toString();
        const last = groups[groups.length - 1];
        if (last && last.year === year) last.items.push({ photo, index: i });
        else groups.push({ year, items: [{ photo, index: i }] });
    });

    return (
        <>
            {groups.map((group) => (
                <section key={group.year} className={styles.yearGroup}>
                    <h2 className={styles.yearHeading}>
                        <span className={styles.yearNum}>{group.year}</span>
                        <span className={styles.yearCount}>{group.items.length}</span>
                    </h2>
                    <div className={styles.masonry}>
                        {distribute(group.items, cols).map((column, c) => (
                            <div className={styles.col} key={c}>
                                {column.map(({ photo, index: i }) => (
                                    <button
                                        key={photo.id}
                                        className={styles.item}
                                        onClick={() => setIndex(i)}
                                        aria-label={photo.caption || `写真 ${i + 1}`}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={photo.thumbUrl}
                                            alt={photo.caption}
                                            width={photo.width}
                                            height={photo.height}
                                            loading="lazy"
                                            decoding="async"
                                            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                                        />
                                        {photo.caption && <span className={styles.caption}>{photo.caption}</span>}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            <AnimatePresence>
                {active && (
                    <motion.div
                        className={styles.lightbox}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={close}
                    >
                        <button className={styles.close} onClick={close} aria-label="閉じる">×</button>
                        <button
                            className={`${styles.nav} ${styles.navPrev}`}
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                            aria-label="前へ"
                        >‹</button>
                        <motion.figure
                            key={active.id}
                            className={styles.stage}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={active.url} alt={active.caption} className={styles.stageImg} />
                            {active.caption && <figcaption className={styles.stageCaption}>{active.caption}</figcaption>}
                        </motion.figure>
                        <button
                            className={`${styles.nav} ${styles.navNext}`}
                            onClick={(e) => { e.stopPropagation(); next(); }}
                            aria-label="次へ"
                        >›</button>
                        <span className={styles.counter}>{index! + 1} / {photos.length}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
