'use client';

import { useRef, useState } from 'react';
import type { GalleryPhoto } from '@/lib/wordpress';
import { compressImage } from '@/lib/imageCompress';
import { readExifDate } from '@/lib/exifDate';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function uploadOne(original: File) {
        const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const localUrl = URL.createObjectURL(original);
        setUploading((u) => [...u, { tempId, name: original.name, localUrl }]);
        try {
            // 0. 圧縮前に撮影日(EXIF)を読む（canvas圧縮するとEXIFが失われるため）
            const shotDate = await readExifDate(original);

            // 0.5 アップロード前に縮小（サイズ超過=413エラーを防ぐ）
            const file = await compressImage(original);

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

            // 2. ギャラリー写真として登録
            const pRes = await fetch('/api/admin/photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaId: upData.id, caption: '', date: shotDate }),
            });
            const pData = await parseJsonSafe(pRes);
            if (pRes.status === 401) throw new Error(AUTH_EXPIRED_MSG);
            if (!pRes.ok || !pData?.id) throw new Error(pData?.error || `登録失敗 (${pRes.status})`);
            const newId = pData.id;

            setPhotos((prev) => [
                { id: newId, caption: '', url: mediaUrl, width: 1600, height: 1067, date: shotDate ?? new Date().toISOString() },
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

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 700 }}>フォトギャラリー</h1>
                <span style={{ fontSize: '12px', color: '#666' }}>{photos.length}枚</span>
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
                <p style={{ fontSize: '14px', color: '#e0e0e0', margin: 0 }}>クリック / ドラッグ&ドロップで写真を追加</p>
                <p style={{ fontSize: '11px', color: '#666', margin: '6px 0 0' }}>複数枚まとめてOK ・ JPG・PNG・WebP</p>
            </div>

            {error && (
                <p style={{ color: '#e74c3c', fontSize: '13px', padding: '10px 14px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '6px' }}>{error}</p>
            )}

            {/* グリッド */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginTop: '8px' }}>
                {uploading.map((u) => (
                    <div key={u.tempId} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#2a2a2a' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u.localUrl} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', opacity: 0.4, display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#ff764d' }}>アップロード中...</div>
                    </div>
                ))}
                {photos.map((p) => (
                    <div key={p.id} style={{ background: '#2a2a2a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #3a3a3a' }}>
                        <div style={{ position: 'relative' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.url} alt={p.caption} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 10px', borderTop: '1px solid #3a3a3a' }}>
                            <span style={{ fontSize: '10px', color: '#666' }}>{new Date(p.date).getFullYear()}年</span>
                            <button onClick={() => removePhoto(p.id)}
                                style={{ fontSize: '12px', padding: '5px 14px', background: 'transparent', border: '1px solid #3a3a3a', color: '#a0a0a0', borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e74c3c'; e.currentTarget.style.color = '#e74c3c'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = '#a0a0a0'; }}
                                aria-label="この写真を削除">🗑 削除</button>
                        </div>
                    </div>
                ))}
            </div>

            {photos.length === 0 && uploading.length === 0 && (
                <p style={{ textAlign: 'center', color: '#555', fontSize: '13px', padding: '40px 0' }}>まだ写真がありません。上のエリアから追加してください。</p>
            )}
        </div>
    );
}
