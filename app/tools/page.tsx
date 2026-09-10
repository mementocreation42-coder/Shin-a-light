// /tools — 一覧
// スターター。リポジトリの Nav / Footer / globals.css に合わせて調整すること。未検証。
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import s from "./tools.module.css";
import { toolCategories, toolLog } from "@/data/tools";
import { getToolsMerged, resolveToolPhoto } from "@/lib/toolsStore";

// 本文・写真は管理画面（/admin/tools）で上書きできる。保存時に revalidatePath するが、念のため1時間で作り直す
export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Tools — お先に\"ちょっと未来\"をサバイブする装備と知恵",
    description: "ちょっと先の未来を、先に暮らしに入れてみる。いま使っているモノと考えを、年齢のぶんだけ。",
};

export default async function ToolsPage() {
    const all = await getToolsMerged();
    const live = all.filter((t) => t.status !== "retired");

    return (
        <main className={s.wrap}>
            <header className={s.hero}>
                <p className={s.eyebrow}>Tools</p>
                <h1 className={s.title}>
                    お先に&ldquo;ちょっと未来&rdquo;を<br />サバイブする装備と知恵
                    <span className={s.num}>{live.length}</span>
                </h1>
            </header>

            <nav className={s.tabs} aria-label="カテゴリ">
                {toolCategories.map((c) => (
                    <a key={c.key} href={`#${c.slug}`} className={`${s.tab} ${s["c" + c.key]}`}>
                        <b>{c.key}</b>{c.label}<span>{live.filter((t) => t.category === c.key).length}</span>
                    </a>
                ))}
            </nav>

            {toolCategories.map((c) => {
                const items = live.filter((t) => t.category === c.key);
                return (
                    <section key={c.key} id={c.slug} className={`${s.group} ${s["c" + c.key]}`}>
                        <div className={s.ghead}>
                            <span className={s.glabel}>{c.label} <em>/ {c.labelJa}</em></span>
                            <h2 className={s.gtag}>{c.tagline}</h2>
                            <span className={s.cnt}>{items.length} / {live.length}</span>
                        </div>
                        <div className={s.grid}>
                            {items.map((t) => (
                                <Link key={t.slot} href={`/tools/${t.slot}`} className={s.card}>
                                    <div className={s.ph} data-slot={t.slot}>
                                        {resolveToolPhoto(t.photo) && (
                                            <Image src={resolveToolPhoto(t.photo)!} alt={t.name} fill sizes="(max-width: 560px) 50vw, (max-width: 900px) 33vw, 240px" style={{ objectFit: "cover" }} />
                                        )}
                                    </div>
                                    <div className={s.body}>
                                        <span className={s.id}>{t.slot}</span>
                                        <span className={s.nm}>{t.name}</span>
                                        {t.oneLine && <span className={s.one}>{t.oneLine}</span>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            })}

            <section className={s.log}>
                <h3>Changelog<small>枠内の入れ替えと、年に1枠の追加。</small></h3>
                <ol>
                    {[...toolLog].reverse().map((l, i) => (
                        <li key={i}><span>{l.date.replaceAll("-", ".")}</span><span>{l.slot ?? "—"}</span><span>{l.text}</span></li>
                    ))}
                </ol>
            </section>
        </main>
    );
}
