import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import ToolSlotEditor from '@/components/admin/ToolSlotEditor';
import { getTool, toolCategories } from '@/data/tools';
import { getToolRow, resolveToolPhoto, rowToInput, toolToInput } from '@/lib/toolsStore';
import { isDbConfigured } from '@/lib/db';
import styles from '../../admin.module.css';

export const metadata = {
    title: { absolute: 'Tools | Shine a Light' },
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function AdminToolSlotPage({ params }: { params: Promise<{ slot: string }> }) {
    const { slot } = await params;
    const base = getTool(slot);
    if (!base) notFound();
    const row = await getToolRow(base.slot);
    const cat = toolCategories.find((c) => c.key === base.category)!;
    const defaults = toolToInput(base);
    const initial = row ? rowToInput(row) : defaults;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/" className={styles.logo}>SAL</Link>
                    <span className={styles.logoBadge}>ADMIN</span>
                    <AdminNav />
                </div>
                <div className={styles.headerRight}>
                    <Link href="/admin/tools" className={styles.ghostBtn}>← 一覧</Link>
                    <Link href={`/tools/${base.slot}`} target="_blank" className={styles.ghostBtn}>公開ページを見る ↗</Link>
                </div>
            </header>
            <main className={styles.main}>
                <ToolSlotEditor
                    slot={base.slot}
                    categoryLabel={`${cat.label} / ${cat.labelJa}`}
                    initial={initial}
                    defaults={defaults}
                    overridden={Boolean(row)}
                    dbConfigured={isDbConfigured()}
                    photoPreview={resolveToolPhoto(initial.photo)}
                    photo2Preview={resolveToolPhoto(initial.photo2)}
                />
            </main>
        </div>
    );
}
