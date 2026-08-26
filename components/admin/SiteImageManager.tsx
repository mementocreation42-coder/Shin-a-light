'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import MediaPicker from '@/components/admin/MediaPicker';

interface SlotRow {
    slot: string;
    label: string;
    note: string;
    defaultUrl: string;
    url: string;
    isDefault: boolean;
}

export default function SiteImageManager() {
    const [slots, setSlots] = useState<SlotRow[]>([]);
    const [dbConfigured, setDbConfigured] = useState(true);
    const [picking, setPicking] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        return fetch('/api/admin/site-images')
            .then(async (res) => {
                if (!res.ok) throw new Error('fetch failed');
                const data = await res.json();
                setSlots(data.slots);
                setDbConfigured(data.dbConfigured);
            })
            .catch(() => setError('一覧の取得に失敗しました'));
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const save = async (slot: string, url: string, alt: string) => {
        setBusy(slot);
        setError('');
        const res = await fetch('/api/admin/site-images', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot, url, alt }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            setError(data?.error ?? '保存に失敗しました');
        }
        await load();
        setBusy(null);
    };

    const reset = async (slot: string) => {
        setBusy(slot);
        setError('');
        const res = await fetch(`/api/admin/site-images?slot=${encodeURIComponent(slot)}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            setError(data?.error ?? 'リセットに失敗しました');
        }
        await load();
        setBusy(null);
    };

    return (
        <div>
            <h1 style={{ fontSize: 18, marginBottom: 4 }}>サイト画像</h1>
            <p style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 20 }}>
                /pro 系ページの写真を、メディアライブラリから選んで差し替えます。保存すると数秒でページに反映されます。
            </p>
            {!dbConfigured && (
                <p style={{ fontSize: 12, color: '#f75d5d', marginBottom: 16 }}>
                    DATABASE_URL が未設定のため保存できません（表示はデフォルト画像になります）。
                </p>
            )}
            {error && <p style={{ fontSize: 12, color: '#f75d5d', marginBottom: 16 }}>{error}</p>}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: 16,
                }}
            >
                {slots.map((s) => (
                    <div
                        key={s.slot}
                        style={{
                            background: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: 10,
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#1e1e1e' }}>
                            <Image
                                src={s.url}
                                alt={s.label}
                                fill
                                sizes="(max-width: 768px) 100vw, 240px"
                                style={{ objectFit: 'cover' }}
                            />
                            {!s.isDefault && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        fontSize: 10,
                                        background: '#ff764d',
                                        color: '#1e1e1e',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: 999,
                                    }}
                                >
                                    差し替え済み
                                </span>
                            )}
                        </div>
                        <div style={{ padding: '10px 12px' }}>
                            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.label}</p>
                            <p style={{ fontSize: 11, color: '#a0a0a0', marginBottom: 10 }}>{s.note}</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => setPicking(s.slot)}
                                    disabled={busy !== null || !dbConfigured}
                                    style={{
                                        flex: 1,
                                        background: '#ff764d',
                                        color: '#1e1e1e',
                                        border: 'none',
                                        borderRadius: 6,
                                        padding: '7px 0',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        opacity: busy !== null || !dbConfigured ? 0.5 : 1,
                                    }}
                                >
                                    {busy === s.slot ? '保存中…' : 'メディアから選ぶ'}
                                </button>
                                {!s.isDefault && (
                                    <button
                                        onClick={() => reset(s.slot)}
                                        disabled={busy !== null}
                                        style={{
                                            background: 'transparent',
                                            color: '#a0a0a0',
                                            border: '1px solid #3a3a3a',
                                            borderRadius: 6,
                                            padding: '7px 10px',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        元に戻す
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {picking && (
                <MediaPicker
                    title="画像を選ぶ"
                    onClose={() => setPicking(null)}
                    onSelect={(item) => {
                        const slot = picking;
                        setPicking(null);
                        if (slot) save(slot, item.source_url, item.alt_text || '');
                    }}
                />
            )}
        </div>
    );
}
