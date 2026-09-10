import Link from 'next/link';
import Image from 'next/image';
import AdminNav from '@/components/admin/AdminNav';
import { toolCategories } from '@/data/tools';
import { getToolRows, getToolsMerged, resolveToolPhoto } from '@/lib/toolsStore';
import { isDbConfigured } from '@/lib/db';
import styles from '../admin.module.css';

export const metadata = {
    title: { absolute: 'Tools | Shine a Light' },
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

const STATUS_JA: Record<string, string> = { draft: '下書き', live: '公開', retired: '引退' };

export default async function AdminToolsPage() {
    const [all, rows] = await Promise.all([getToolsMerged(), getToolRows()]);
    const dbConfigured = isDbConfigured();

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.logo}>SAL</Link>
                    <span className={styles.logoBadge}>ADMIN</span>
                    <AdminNav />
                </div>
                <div className={styles.headerRight}>
                    <Link href="/tools" target="_blank" className={styles.ghostBtn}>公開ページを見る ↗</Link>
                </div>
            </header>
            <main className={styles.main}>
                <h1 style={{ fontSize: 18, marginBottom: 4 }}>Tools</h1>
                <p style={{ fontSize: 12, color: '#a0a0a0', marginBottom: 20 }}>
                    /tools の45枠。枠を開いて本文と写真2枚を編集します。編集した枠は「CMS」の印が付き、「元に戻す」でコード側の値に戻せます。
                </p>
                {!dbConfigured && (
                    <p style={{ fontSize: 12, color: '#f75d5d', marginBottom: 16 }}>
                        DATABASE_URL が未設定のため保存できません（表示はコード側の値になります）。
                    </p>
                )}

                {toolCategories.map((c) => {
                    const items = all.filter((t) => t.category === c.key);
                    return (
                        <section key={c.key} style={{ marginBottom: 32 }}>
                            <h2 style={{ fontSize: 12, letterSpacing: 2, color: '#a0a0a0', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                                {c.label} <span style={{ letterSpacing: 0, color: '#666' }}>/ {c.labelJa}</span>
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
                                {items.map((t) => {
                                    const photo = resolveToolPhoto(t.photo);
                                    const overridden = rows.has(t.slot);
                                    return (
                                        <Link
                                            key={t.slot}
                                            href={`/admin/tools/${t.slot}`}
                                            style={{
                                                display: 'flex',
                                                gap: 12,
                                                background: '#2a2a2a',
                                                border: '1px solid #3a3a3a',
                                                borderRadius: 10,
                                                padding: 10,
                                                textDecoration: 'none',
                                                color: 'inherit',
                                            }}
                                        >
                                            <span style={{ position: 'relative', width: 64, height: 80, flex: 'none', borderRadius: 6, overflow: 'hidden', background: '#1e1e1e' }}>
                                                {photo ? (
                                                    <Image src={photo} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 10, color: '#666' }}>no photo</span>
                                                )}
                                            </span>
                                            <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff764d', letterSpacing: 1 }}>
                                                    {t.slot}
                                                    <span style={{ marginLeft: 8, color: '#a0a0a0', letterSpacing: 0 }}>{STATUS_JA[t.status] ?? t.status}</span>
                                                    {overridden && (
                                                        <span style={{ marginLeft: 6, fontSize: 9, background: '#ff764d', color: '#1e1e1e', fontWeight: 700, padding: '1px 6px', borderRadius: 999, letterSpacing: 0 }}>CMS</span>
                                                    )}
                                                </span>
                                                <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>{t.name}</span>
                                                <span style={{ fontSize: 11, color: '#a0a0a0', lineHeight: 1.5 }}>{t.oneLine || '（一言なし）'}</span>
                                                <span style={{ fontSize: 10, color: t.why ? '#87d37c' : '#666' }}>{t.why ? '本文あり' : '本文なし'}</span>
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </main>
        </div>
    );
}
