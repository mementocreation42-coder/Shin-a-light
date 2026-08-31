'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/admin/admin.module.css';

/** 記事ネタのクイック追加（タイトル＋メモ）。保存先は WP の pending */
export default function IdeaQuickAdd() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [memo, setMemo] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    const input: React.CSSProperties = {
        background: '#1e1e1e',
        border: '1px solid #3a3a3a',
        borderRadius: 6,
        padding: '10px 12px',
        color: '#fff',
        fontSize: 13,
        fontFamily: 'inherit',
        width: '100%',
    };

    const add = async () => {
        if (!title.trim()) return;
        setAdding(true);
        setError('');
        const res = await fetch('/api/admin/ideas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, memo }),
        });
        if (res.ok) {
            setTitle('');
            setMemo('');
            router.refresh();
        } else {
            setError('追加に失敗しました');
        }
        setAdding(false);
    };

    return (
        <div
            style={{
                background: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: 10,
                padding: 16,
                marginBottom: 24,
                display: 'grid',
                gap: 10,
            }}
        >
            <input
                style={input}
                placeholder="ネタのタイトル（仮でOK）"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                style={{ ...input, resize: 'vertical' }}
                rows={2}
                placeholder="メモ（書くこと・キー文・受け皿など。空でもOK）"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                    onClick={add}
                    disabled={adding || !title.trim()}
                    className={styles.primaryBtn}
                    style={{ opacity: adding || !title.trim() ? 0.5 : 1 }}
                >
                    {adding ? '追加中…' : '＋ ネタを追加'}
                </button>
                {error && <span style={{ fontSize: 12, color: '#f75d5d' }}>{error}</span>}
            </div>
        </div>
    );
}
