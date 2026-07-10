'use client';

import { useMemo, useRef, useState, type MouseEvent } from 'react';
import type { GalleryPhoto } from '@/lib/wordpress';
import {
    GALLERY_CATEGORIES,
    DEFAULT_GALLERY_CATEGORY,
    type GalleryCategory,
} from '@/lib/galleryCategories';
import { compressImage } from '@/lib/imageCompress';
import { readExifDate } from '@/lib/exifDate';

const FILTER_ALL = 'All';

interface UploadingItem {
    tempId: string;
    name: string;
    localUrl: string;
}

// レスポンスがJSONでない場合（413のプレーンテキスト等）でも落ちないよう安全に解析する
async function parseJsonSafe(res: Response): Promise<{ error?: string; id?: number; url?: string } | null> {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

const AUTH_EXPIRED_MSG = 'ログインの有効期限が切れました。ページを再読み込みするか、再ログインしてください。';

export default function PhotoManager({ initialPhotos }: { initialPhotos: GalleryPhoto[] }) {
    const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
    const [uploading, setUploading] = useState<UploadingItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    // アップロード時に付けるカテゴリ / 一覧の絞り込み
    const [uploadCategory, setUploadCategory] = useState<GalleryCategory>(DEFAULT_GALLERY_CATEGORY);
    const [filter, setFilter] = useState<string>(FILTER_ALL);
    // 複数選択（一括削除用）
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Shift範囲選択の起点（直前にクリックした写真ID）
    const lastSelectedRef = useRef<number | null>(null);

    const visiblePhotos = useMemo(
        () => (filter === FILTER_ALL ? photos : photos.filter((p) => (p.category ?? DEFAULT_GALLERY_CATEGORY) === filter)),
        [photos, filter]
    );

    // 表示するセクション（絞り込み中はそのカテゴリのみ、すべて時は全カテゴリを分けて表示）
    const sections: readonly GalleryCategory[] =
        filter === FILTER_ALL ? GALLERY_CATEGORIES : [filter as GalleryCategory];

    // 画面上の表示順（セクション順）の写真ID列。Shift範囲選択の基準に使う。
    const displayOrder = useMemo(
        () =>
            sections.flatMap((cat) =>
                visiblePhotos
                    .filter((p) => (p.category ?? DEFAULT_GALLERY_CATEGORY) === cat)
                    .map((p) => p.id)
            ),
        [sections, visiblePhotos]
    );

    async function uploadOne(original: File) {
        const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const localUrl = URL.createObjectURL(original);
        setUploading((u) => [...u, { tempId, name: original.name, localUrl }]);
        try {
            // 0. 圧縮前に撮影日(EXIF)を読む（canvas圧縮するとEXIFが失われるため）
            const shotDate = await readExifDate(original);

            // 0.5 アップロード前に必ず焼き直し（サイズ超過=413を防ぎ、WAF誤検知も回避しやすくする）
            const file = await compressImage(original, true);

            // 1. 画像をメディアにアップロード
            const fd = new FormData();
            fd.append('image', file);
            const upRes = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            const upData = await parseJsonSafe(upRes);
            if (upRes.status === 401) throw new Error(AUTH_EXPIRED_MSG);
            if (!upRes.ok) {
                throw new Error(upData?.error || (upRes.status === 413 ? '画像が大きすぎます。' : `アップロード失敗 (${upRes.status})`));
            }
            if (!upData?.id || !upData.url) throw new Error('アップロード応答が不正です。');
            const mediaUrl = upData.url;

            // 2. ギャラリー写真として登録（選択中カテゴリを付与）
            const category = uploadCategory;
            const pRes = await fetch('/api/admin/photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaId: upData.id, caption: '', date: shotDate, category }),
            });
            const pData = await parseJsonSafe(pRes);
            if (pRes.status === 401) throw new Error(AUTH_EXPIRED_MSG);
            if (!pRes.ok || !pData?.id) throw new Error(pData?.error || `登録失敗 (${pRes.status})`);
            const newId = pData.id;

            setPhotos((prev) => [
                { id: newId, caption: '', url: mediaUrl, thumbUrl: mediaUrl, width: 1600, height: 1067, date: shotDate ?? new Date().toISOString(), category },
                ...prev,
            ]);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : `${original.name} のアップロードに失敗しました`);
        } finally {
            setUploading((u) => u.filter((it) => it.tempId !== tempId));
            URL.revokeObjectURL(localUrl);
        }
    }

    function handleFiles(files: FileList | null) {
        if (!files) return;
        setError('');
        Array.from(files)
            .filter((f) => f.type.startsWith('image/'))
            .forEach((f) => void uploadOne(f));
    }

    async function saveCaption(id: number, caption: string) {
        setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
        try {
            const res = await fetch('/api/admin/photos', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, caption }),
            });
            if (res.status === 401) { setError(AUTH_EXPIRED_MSG); return; }
            if (!res.ok) setError('キャプションの保存に失敗しました');
        } catch {
            setError('キャプションの保存に失敗しました');
        }
    }

    async function saveCategory(id: number, category: GalleryCategory) {
        const snapshot = photos;
        setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, category } : p)));
        try {
            const res = await fetch('/api/admin/photos', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, category }),
            });
            if (res.status === 401) { setError(AUTH_EXPIRED_MSG); setPhotos(snapshot); return; }
            if (!res.ok) { setError('カテゴリの保存に失敗しました'); setPhotos(snapshot); }
        } catch {
            setError('カテゴリの保存に失敗しました');
            setPhotos(snapshot);
        }
    }

    async function removePhoto(id: number) {
        if (!confirm('この写真を削除しますか？')) return;
        const snapshot = photos;
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        try {
            const res = await fetch(`/api/admin/photos?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                setError(res.status === 401 ? AUTH_EXPIRED_MSG : '削除に失敗しました');
                setPhotos(snapshot);
            }
        } catch {
            setError('削除に失敗しました');
            setPhotos(snapshot);
        }
    }

    function toggleSelect(id: number) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    // クリック選択。Shift併用で、直前に選んだ写真から表示順で範囲選択する。
    function handleSelectClick(e: MouseEvent, id: number) {
        const anchor = lastSelectedRef.current;
        if (e.shiftKey && anchor !== null && anchor !== id) {
            const a = displayOrder.indexOf(anchor);
            const b = displayOrder.indexOf(id);
            if (a !== -1 && b !== -1) {
                const [lo, hi] = a < b ? [a, b] : [b, a];
                const range = displayOrder.slice(lo, hi + 1);
                setSelected((prev) => {
                    const next = new Set(prev);
                    range.forEach((x) => next.add(x));
                    return next;
                });
                lastSelectedRef.current = id;
                return;
            }
        }
        toggleSelect(id);
        lastSelectedRef.current = id;
    }

    async function removeSelected() {
        const ids = [...selected];
        if (ids.length === 0) return;
        if (!confirm(`選択した${ids.length}枚を削除しますか？`)) return;
        setBulkDeleting(true);
        const snapshot = photos;
        // 楽観的に一括で消す
        setPhotos((prev) => prev.filter((p) => !selected.has(p.id)));
        const failedIds: number[] = [];
        for (const id of ids) {
            try {
                const res = await fetch(`/api/admin/photos?id=${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    failedIds.push(id);
                    if (res.status === 401) { setError(AUTH_EXPIRED_MSG); break; }
                }
            } catch {
                failedIds.push(id);
            }
        }
        if (failedIds.length > 0) {
            // 失敗分は元に戻す
            const failedSet = new Set(failedIds);
            setPhotos(snapshot.filter((p) => !selected.has(p.id) || failedSet.has(p.id)));
            setError(`${failedIds.length}枚の削除に失敗しました`);
            setSelected(new Set(failedIds));
        } else {
            setSelected(new Set());
        }
        setBulkDeleting(false);
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 700 }}>フォトギャラリー</h1>
                <span style={{ fontSize: '12px', color: '#666' }}>{photos.length}枚</span>
            </div>

            {/* アップロード先カテゴリの選択 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>追加先カテゴリ</span>
                {GALLERY_CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setUploadCategory(cat)}
                        style={{
                            fontSize: '12px', padding: '5px 14px', borderRadius: '999px', cursor: 'pointer', fontFamily: 'inherit',
                            border: `1px solid ${uploadCategory === cat ? '#ff764d' : '#3a3a3a'}`,
                            background: uploadCategory === cat ? '#ff764d' : 'transparent',
                            color: uploadCategory === cat ? '#fff' : '#a0a0a0',
                            transition: 'all 0.15s',
                        }}
                    >{cat}</button>
                ))}
            </div>

            {/* アップロードゾーン */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                style={{
                    border: `2px dashed ${isDragging ? '#ff764d' : '#3a3a3a'}`,
                    background: isDragging ? 'rgba(255,118,77,0.05)' : 'transparent',
                    borderRadius: '10px', padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s', marginBottom: '24px',
                }}
            >
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
                <p style={{ fontSize: '14px', color: '#e0e0e0', margin: 0 }}>
                    <strong style={{ color: '#ff764d' }}>{uploadCategory}</strong> に写真を追加（クリック / ドラッグ&ドロップ）
                </p>
                <p style={{ fontSize: '11px', color: '#666', margin: '6px 0 0' }}>複数枚まとめてOK ・ JPG・PNG・WebP</p>
            </div>

            {/* 一覧の絞り込み */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                {[FILTER_ALL, ...GALLERY_CATEGORIES].map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setFilter(cat)}
                        style={{
                            fontSize: '12px', padding: '5px 14px', borderRadius: '999px', cursor: 'pointer', fontFamily: 'inherit',
                            border: `1px solid ${filter === cat ? '#ff764d' : '#3a3a3a'}`,
                            background: filter === cat ? 'rgba(255,118,77,0.12)' : 'transparent',
                            color: filter === cat ? '#ff764d' : '#a0a0a0',
                            transition: 'all 0.15s',
                        }}
                    >{cat === FILTER_ALL ? 'すべて' : cat}</button>
                ))}
            </div>

            {error && (
                <p style={{ color: '#e74c3c', fontSize: '13px', padding: '10px 14px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '6px' }}>{error}</p>
            )}

            {/* 一括削除バー（1枚以上選択中に画面下部へ固定表示） */}
            {selected.size > 0 && (
                <div style={{
                    position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)', zIndex: 50,
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: '#1e1e1e', border: '1px solid #3a3a3a', borderRadius: '999px',
                    padding: '10px 12px 10px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                }}>
                    <span style={{ fontSize: '13px', color: '#e0e0e0' }}>{selected.size}枚を選択中</span>
                    <button type="button" onClick={() => setSelected(new Set())} disabled={bulkDeleting}
                        style={{ fontSize: '12px', padding: '6px 14px', background: 'transparent', border: '1px solid #3a3a3a', color: '#a0a0a0', borderRadius: '999px', cursor: 'pointer', fontFamily: 'inherit' }}>
                        選択解除
                    </button>
                    <button type="button" onClick={() => void removeSelected()} disabled={bulkDeleting}
                        style={{ fontSize: '12px', fontWeight: 700, padding: '6px 18px', background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '999px', cursor: bulkDeleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: bulkDeleting ? 0.6 : 1 }}>
                        {bulkDeleting ? '削除中...' : `🗑 ${selected.size}枚を削除`}
                    </button>
                </div>
            )}

            {/* Archive / MEMENTO をセクションに分けて表示（絞り込み中は該当セクションのみ） */}
            {sections.map((cat) => {
                const catPhotos = visiblePhotos.filter((p) => (p.category ?? DEFAULT_GALLERY_CATEGORY) === cat);
                const catUploading = uploadCategory === cat ? uploading : [];
                if (catPhotos.length === 0 && catUploading.length === 0) return null;
                return (
                    <section key={cat} style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '0 0 14px', paddingBottom: '8px', borderBottom: '1px solid #333' }}>
                            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#ff764d', letterSpacing: '1px' }}>{cat}</h2>
                            <span style={{ fontSize: '11px', color: '#666' }}>{catPhotos.length}枚</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                            {catUploading.map((u) => (
                                <div key={u.tempId} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#2a2a2a' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={u.localUrl} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', opacity: 0.4, display: 'block' }} />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#ff764d' }}>アップロード中...</div>
                                </div>
                            ))}
                            {catPhotos.map((p) => {
                                const isSelected = selected.has(p.id);
                                return (
                                <div key={p.id} style={{ background: '#2a2a2a', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isSelected ? '#ff764d' : '#3a3a3a'}`, outline: isSelected ? '1px solid #ff764d' : 'none' }}>
                                    <div style={{ position: 'relative' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={p.url} alt={p.caption} onClick={(e) => handleSelectClick(e, p.id)} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', cursor: 'pointer', opacity: isSelected ? 0.85 : 1, userSelect: 'none' }} />
                                        <button onClick={(e) => handleSelectClick(e, p.id)}
                                            aria-label={isSelected ? '選択解除' : '選択'}
                                            style={{ position: 'absolute', top: '6px', left: '6px', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? '#ff764d' : 'rgba(0,0,0,0.55)', border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.5)', color: '#fff', cursor: 'pointer', fontSize: '13px', lineHeight: 1 }}>
                                            {isSelected ? '✓' : ''}
                                        </button>
                                        <button onClick={() => removePhoto(p.id)}
                                            style={{ position: 'absolute', top: '6px', right: '6px', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px', lineHeight: 1 }}
                                            aria-label="削除">×</button>
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue={p.caption}
                                        placeholder="キャプション（任意）"
                                        onBlur={(e) => { if (e.target.value !== p.caption) void saveCaption(p.id, e.target.value); }}
                                        style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', borderTop: '1px solid #3a3a3a', color: '#e0e0e0', fontFamily: 'inherit', fontSize: '12px', padding: '8px 10px', outline: 'none' }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderTop: '1px solid #3a3a3a' }}>
                                        <select
                                            value={p.category ?? DEFAULT_GALLERY_CATEGORY}
                                            onChange={(e) => void saveCategory(p.id, e.target.value as GalleryCategory)}
                                            aria-label="カテゴリ"
                                            style={{ fontSize: '11px', background: '#1e1e1e', border: '1px solid #3a3a3a', color: '#e0e0e0', borderRadius: '5px', padding: '4px 8px', fontFamily: 'inherit', cursor: 'pointer' }}
                                        >
                                            {GALLERY_CATEGORIES.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <span style={{ fontSize: '10px', color: '#666', marginLeft: 'auto' }}>{new Date(p.date).getFullYear()}年</span>
                                        <button onClick={() => removePhoto(p.id)}
                                            style={{ fontSize: '12px', padding: '5px 12px', background: 'transparent', border: '1px solid #3a3a3a', color: '#a0a0a0', borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e74c3c'; e.currentTarget.style.color = '#e74c3c'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = '#a0a0a0'; }}
                                            aria-label="この写真を削除">🗑</button>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </section>
                );
            })}

            {photos.length === 0 && uploading.length === 0 && (
                <p style={{ textAlign: 'center', color: '#555', fontSize: '13px', padding: '40px 0' }}>まだ写真がありません。上のエリアから追加してください。</p>
            )}
            {photos.length > 0 && visiblePhotos.length === 0 && uploading.length === 0 && (
                <p style={{ textAlign: 'center', color: '#555', fontSize: '13px', padding: '40px 0' }}>「{filter}」の写真はまだありません。</p>
            )}
        </div>
    );
}
