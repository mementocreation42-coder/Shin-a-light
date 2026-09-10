'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MediaPicker from '@/components/admin/MediaPicker';
import type { ToolSlotInput } from '@/lib/toolsStore';

interface Props {
    slot: string;
    categoryLabel: string;
    /** 表示中の値（DB の上書きがあればそれ、無ければコード側） */
    initial: ToolSlotInput;
    /** コード側の値（「元に戻す」で戻る先の説明に使う） */
    defaults: ToolSlotInput;
    overridden: boolean;
    dbConfigured: boolean;
    /** 表示できる写真の URL（無ければ null）。サイト内パスは public に無いと出せない */
    photoPreview: string | null;
    photo2Preview: string | null;
}

const field: React.CSSProperties = {
    width: '100%',
    background: '#1e1e1e',
    border: '1px solid #3a3a3a',
    borderRadius: 8,
    color: '#fff',
    padding: '9px 12px',
    fontSize: 14,
    fontFamily: 'inherit',
    lineHeight: 1.6,
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: '#a0a0a0', letterSpacing: 1, marginBottom: 6 };
const block: React.CSSProperties = { marginBottom: 18 };

const STATUS_LABEL: Record<ToolSlotInput['status'], string> = {
    draft: '下書き（一覧に出るが本文は未執筆扱い）',
    live: '公開',
    retired: '引退（一覧から外す）',
};

export default function ToolSlotEditor({
    slot,
    categoryLabel,
    initial,
    defaults,
    overridden,
    dbConfigured,
    photoPreview,
    photo2Preview,
}: Props) {
    const router = useRouter();
    const [v, setV] = useState<ToolSlotInput>(initial);
    const [picking, setPicking] = useState<'photo' | 'photo2' | null>(null);
    // 選び直した写真はその場で見せる（保存前）
    const [previews, setPreviews] = useState<{ photo: string | null; photo2: string | null }>({
        photo: photoPreview,
        photo2: photo2Preview,
    });
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<{ kind: 'ok' | 'ng'; text: string } | null>(null);

    const set = <K extends keyof ToolSlotInput>(k: K, val: ToolSlotInput[K]) => setV((s) => ({ ...s, [k]: val }));
    const setLink = (k: keyof ToolSlotInput['links'], val: string) => setV((s) => ({ ...s, links: { ...s.links, [k]: val } }));

    const save = async () => {
        setBusy(true);
        setMsg(null);
        const res = await fetch('/api/admin/tools', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot, ...v }),
        });
        const data = await res.json().catch(() => null);
        setBusy(false);
        if (!res.ok) {
            setMsg({ kind: 'ng', text: data?.error ?? '保存に失敗しました' });
            return;
        }
        setMsg({ kind: 'ok', text: '保存しました。公開ページは数秒で更新されます。' });
        router.refresh();
    };

    const reset = async () => {
        if (!confirm(`${slot} の編集内容を消して、コード側の値（${defaults.name}）に戻します。よろしいですか？`)) return;
        setBusy(true);
        setMsg(null);
        const res = await fetch(`/api/admin/tools?slot=${encodeURIComponent(slot)}`, { method: 'DELETE' });
        const data = await res.json().catch(() => null);
        setBusy(false);
        if (!res.ok) {
            setMsg({ kind: 'ng', text: data?.error ?? 'リセットに失敗しました' });
            return;
        }
        setV(defaults);
        setPreviews({ photo: null, photo2: null });
        setMsg({ kind: 'ok', text: 'コード側の値に戻しました。' });
        router.refresh();
    };

    const photoBox = (key: 'photo' | 'photo2', title: string, note: string) => {
        const url = previews[key];
        return (
            <div style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ position: 'relative', aspectRatio: key === 'photo' ? '4 / 5' : '4 / 3', background: '#1e1e1e' }}>
                    {url ? (
                        <Image src={url} alt="" fill sizes="(max-width: 900px) 100vw, 360px" style={{ objectFit: 'cover' }} />
                    ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#666', fontSize: 12, textAlign: 'center', padding: 16 }}>
                            写真なし
                            <br />
                            <span style={{ fontSize: 11 }}>{v[key] ? `（${v[key]} は public に無いため表示できません）` : ''}</span>
                        </div>
                    )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{title}</p>
                    <p style={{ fontSize: 11, color: '#a0a0a0', marginBottom: 10 }}>{note}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={() => setPicking(key)} disabled={busy || !dbConfigured} style={btnPrimary(busy || !dbConfigured)}>
                            メディアから選ぶ
                        </button>
                        {v[key] && (
                            <button
                                type="button"
                                onClick={() => {
                                    set(key, '');
                                    setPreviews((p) => ({ ...p, [key]: null }));
                                }}
                                disabled={busy}
                                style={btnGhost}
                            >
                                外す
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                <h1 style={{ fontSize: 18 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#ff764d', marginRight: 10 }}>{slot}</span>
                    {v.name || '（名前未設定）'}
                </h1>
                <span style={{ fontSize: 11, color: '#a0a0a0' }}>{categoryLabel}</span>
                {overridden && (
                    <span style={{ fontSize: 10, background: '#ff764d', color: '#1e1e1e', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                        CMS で編集済み
                    </span>
                )}
            </div>
            <p style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 20 }}>
                保存すると DB に入り、この枠はここで書いた内容で表示されます。「元に戻す」でコード側（data/tools.ts）の値に戻ります。
            </p>
            {!dbConfigured && (
                <p style={{ fontSize: 12, color: '#f75d5d', marginBottom: 16 }}>DATABASE_URL が未設定のため保存できません。</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)', gap: 28, alignItems: 'start' }}>
                <div style={{ display: 'grid', gap: 14 }}>
                    {photoBox('photo', '写真 1（縦）', 'モノそのもの。一覧のカードにも使う')}
                    {photoBox('photo2', '写真 2（横）', '使っている場面や別アングル')}
                </div>

                <div>
                    <div style={block}>
                        <label style={labelStyle}>名前</label>
                        <input style={field} value={v.name} onChange={(e) => set('name', e.target.value)} />
                    </div>
                    <div style={block}>
                        <label style={labelStyle}>一言（一覧カードに出る。15字前後）</label>
                        <input style={field} value={v.oneLine} onChange={(e) => set('oneLine', e.target.value)} />
                    </div>
                    <div style={block}>
                        <label style={labelStyle}>なぜこれか（300〜600字）</label>
                        <textarea style={{ ...field, minHeight: 180 }} value={v.why} onChange={(e) => set('why', e.target.value)} />
                    </div>
                    <div style={block}>
                        <label style={labelStyle}>どこが「ちょっと未来」か（1〜3文）</label>
                        <textarea style={{ ...field, minHeight: 90 }} value={v.future} onChange={(e) => set('future', e.target.value)} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 18 }}>
                        <div>
                            <label style={labelStyle}>重量（g）</label>
                            <input style={field} type="number" min={0} value={v.weightG ?? ''} onChange={(e) => set('weightG', e.target.value === '' ? null : Number(e.target.value))} />
                        </div>
                        <div>
                            <label style={labelStyle}>素材</label>
                            <input style={field} value={v.material} onChange={(e) => set('material', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>使用年数</label>
                            <input style={field} type="number" min={0} value={v.years ?? ''} onChange={(e) => set('years', e.target.value === '' ? null : Number(e.target.value))} />
                        </div>
                        <div>
                            <label style={labelStyle}>入手先</label>
                            <input style={field} value={v.source} onChange={(e) => set('source', e.target.value)} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 18 }}>
                        {(
                            [
                                ['buy', '購入先 URL'],
                                ['podcast', 'Podcast で話した回 URL'],
                                ['note', 'note の記事 URL'],
                                ['instagram', 'Instagram リール URL'],
                            ] as const
                        ).map(([k, label]) => (
                            <div key={k}>
                                <label style={labelStyle}>{label}</label>
                                <input style={field} value={v.links[k]} onChange={(e) => setLink(k, e.target.value)} placeholder="https://" />
                            </div>
                        ))}
                    </div>

                    <div style={block}>
                        <label style={labelStyle}>状態</label>
                        <select style={{ ...field, width: 'auto', minWidth: 260 }} value={v.status} onChange={(e) => set('status', e.target.value as ToolSlotInput['status'])}>
                            {(Object.keys(STATUS_LABEL) as ToolSlotInput['status'][]).map((s) => (
                                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
                        <button type="button" onClick={save} disabled={busy || !dbConfigured} style={{ ...btnPrimary(busy || !dbConfigured), flex: 'none', padding: '10px 22px' }}>
                            {busy ? '保存中…' : '保存する'}
                        </button>
                        {overridden && (
                            <button type="button" onClick={reset} disabled={busy} style={btnGhost}>
                                元に戻す（コード側の値）
                            </button>
                        )}
                        {msg && <span style={{ fontSize: 12, color: msg.kind === 'ok' ? '#87d37c' : '#f75d5d' }}>{msg.text}</span>}
                    </div>
                </div>
            </div>

            {picking && (
                <MediaPicker
                    title={picking === 'photo' ? '写真 1 を選ぶ' : '写真 2 を選ぶ'}
                    onClose={() => setPicking(null)}
                    onSelect={(item) => {
                        const key = picking;
                        setPicking(null);
                        set(key, item.source_url);
                        setPreviews((p) => ({ ...p, [key]: item.source_url }));
                    }}
                />
            )}
        </div>
    );
}

function btnPrimary(disabled: boolean): React.CSSProperties {
    return {
        flex: 1,
        background: '#ff764d',
        color: '#1e1e1e',
        border: 'none',
        borderRadius: 6,
        padding: '7px 12px',
        fontSize: 12,
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
    };
}

const btnGhost: React.CSSProperties = {
    background: 'transparent',
    color: '#a0a0a0',
    border: '1px solid #3a3a3a',
    borderRadius: 6,
    padding: '7px 10px',
    fontSize: 12,
    cursor: 'pointer',
};
