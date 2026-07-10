'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GalleryPhoto } from '@/lib/wordpress';
import { GALLERY_CATEGORIES } from '@/lib/galleryCategories';
import styles from './PhotoGallery.module.css';

const ALL = 'All';

// カテゴリの表示順（存在するものだけ・この順で並べる）
const CATEGORY_ORDER: readonly string[] = GALLERY_CATEGORIES;

// カテゴリ選択時に、タブ直下へ出すコンセプト文（All では出さない）
// contactLabel を持つカテゴリだけ、末尾に Contact への依頼導線を出す。
const CONCEPTS: Record<string, { tagline: string; body: string; contactLabel?: string }> = {
    Archive: {
        tagline: '光の射す場所にも、\n影のなかにも。',
        body:
            '徳島・牟岐町を拠点に、日々の光と自然、旅の途中で出会った風景を切り取った記録。' +
            '仕事の合間、名前のない時間にシャッターを切った、小林大介の個人的なアーカイブ。',
        contactLabel: '撮影・制作のご依頼・ご相談は',
    },
    MEMENTO: {
        tagline: '簡単に撮れる時代に、\n簡単に撮れない思い出を。',
        body:
            'MEMENTO ——〔思い出の品／形見／記憶〕。徳島を拠点に、家族のいまを自然光で残す出張写真。' +
            '過去は帰る場所ではなく、未来を創るための大切な時間。20年30年経って見返したとき、' +
            '素敵な思い出がよみがえる——そんな一枚を残します。',
        contactLabel: '出張写真撮影のご依頼・ご相談は',
    },
};

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

const PAGE_SIZE = 60; // 初期表示枚数（「もっと見る」で追加）

export default function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
    const [index, setIndex] = useState<number | null>(null);
    const [category, setCategory] = useState<string>(ALL);
    const [year, setYear] = useState<string>(ALL);
    const [limit, setLimit] = useState(PAGE_SIZE);
    const cols = useColumnCount();

    // 写真に含まれるカテゴリを、定義順で並べたタブ一覧
    const categories = useMemo(() => {
        const present = new Set(
            photos.map((p) => p.category).filter((c): c is string => !!c)
        );
        const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
        return ordered.length > 1 ? [ALL, ...ordered] : [];
    }, [photos]);

    // 選択中カテゴリの写真だけに絞り、日付の新しい順に並べる。
    // （カテゴリを跨ぐと同じ年が飛び飛びになり、年グループの key が重複するため）
    const inCategory = useMemo(() => {
        const list = category === ALL ? photos : photos.filter((p) => p.category === category);
        return [...list].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [photos, category]);

    // 選択中カテゴリに含まれる年の一覧（新しい順）
    const years = useMemo(() => {
        const set = new Set(inCategory.map((p) => new Date(p.date).getFullYear().toString()));
        return [...set].sort((a, b) => Number(b) - Number(a));
    }, [inCategory]);

    // カテゴリ＋年で絞り込んだ、実際に表示・前後送りする写真リスト
    const visible = useMemo(
        () =>
            year === ALL
                ? inCategory
                : inCategory.filter((p) => new Date(p.date).getFullYear().toString() === year),
        [inCategory, year]
    );

    const close = useCallback(() => setIndex(null), []);
    const prev = useCallback(
        () => setIndex((i) => (i === null ? i : (i - 1 + visible.length) % visible.length)),
        [visible.length]
    );
    const next = useCallback(
        () => setIndex((i) => (i === null ? i : (i + 1) % visible.length)),
        [visible.length]
    );

    // カテゴリ切り替え時はライトボックスを閉じ、年・表示枚数もリセット
    const changeCategory = useCallback((cat: string) => {
        setCategory(cat);
        setYear(ALL);
        setIndex(null);
        setLimit(PAGE_SIZE);
    }, []);

    // 年切り替え時はライトボックスを閉じ、表示枚数をリセット
    const changeYear = useCallback((y: string) => {
        setYear(y);
        setIndex(null);
        setLimit(PAGE_SIZE);
    }, []);

    // 初期表示は limit 枚まで。年グループ・グリッドはこの範囲で描画する。
    const shown = visible.slice(0, limit);
    const remaining = visible.length - shown.length;

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

    const active = index === null ? null : visible[index];

    // 日付メタデータから年ごとにグループ化（新しい年が先頭・通し番号は維持）。
    // index は visible 全体での位置（ライトボックスの前後送りに使う）。
    const groups: { year: string; items: { photo: GalleryPhoto; index: number }[] }[] = [];
    shown.forEach((photo, i) => {
        const year = new Date(photo.date).getFullYear().toString();
        const last = groups[groups.length - 1];
        if (last && last.year === year) last.items.push({ photo, index: i });
        else groups.push({ year, items: [{ photo, index: i }] });
    });

    return (
        <>
            {categories.length > 0 && (
                <div className={styles.tabs} role="tablist" aria-label="カテゴリ">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            role="tab"
                            aria-selected={category === cat}
                            className={`${styles.tab} ${category === cat ? styles.tabActive : ''}`}
                            onClick={() => changeCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* カテゴリ選択時だけ、タブ直下にコンセプト文を置く（All では出さない） */}
            {CONCEPTS[category] && (
                <div className={styles.mementoIntro}>
                    <p className={styles.mementoTagline}>
                        {CONCEPTS[category].tagline.split('\n').map((line, i) => (
                            <span key={i}>
                                {i > 0 && <br />}
                                {line}
                            </span>
                        ))}
                    </p>
                    <p className={styles.mementoBody}>{CONCEPTS[category].body}</p>
                    {CONCEPTS[category].contactLabel && (
                        <p className={styles.inquiry}>
                            <span>{CONCEPTS[category].contactLabel}</span>
                            <a href="/#contact">Contact →</a>
                        </p>
                    )}
                </div>
            )}

            {/* 年ごとにアクセスできる年ナビ（2年以上あるときだけ表示） */}
            {years.length > 1 && (
                <div className={styles.yearNav} role="tablist" aria-label="年で絞り込み">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={year === ALL}
                        className={`${styles.yearChip} ${year === ALL ? styles.yearChipActive : ''}`}
                        onClick={() => changeYear(ALL)}
                    >
                        すべて
                    </button>
                    {years.map((y) => (
                        <button
                            key={y}
                            type="button"
                            role="tab"
                            aria-selected={year === y}
                            className={`${styles.yearChip} ${year === y ? styles.yearChipActive : ''}`}
                            onClick={() => changeYear(y)}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            )}

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

            {remaining > 0 && (
                <div className={styles.moreWrap}>
                    <button
                        type="button"
                        className={styles.moreBtn}
                        onClick={() => setLimit((l) => l + PAGE_SIZE)}
                    >
                        もっと見る（残り{remaining}枚）
                    </button>
                </div>
            )}

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
                        <span className={styles.counter}>{index! + 1} / {visible.length}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
