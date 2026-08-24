// /tools — 一覧
// スターター。リポジトリの Nav / Footer / globals.css に合わせて調整すること。未検証。
import Link from "next/link";
import type { Metadata } from "next";
import s from "./tools.module.css";
import {
    tools, toolCategories, toolLog,
    getAge, getNextSlotDate, getDaysToNextSlot, getToolsByCategory,
} from "@/data/tools";

export const metadata: Metadata = {
    title: "Tools — お先に\"ちょっと未来\"をサバイブする装備と知恵",
    description: "ちょっと先の未来を、先に暮らしに入れてみる。いま使っているモノと考えを、年齢のぶんだけ。",
};

const fmt = (d: Date) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;

export default function ToolsPage() {
    const now = new Date();
    const age = getAge(now);
    const next = getNextSlotDate(now);
    const days = getDaysToNextSlot(now);
    const live = tools.filter((t) => t.status !== "retired");
    const swaps = toolLog.filter((l) => l.kind === "swap").length;

    return (
        <main className={s.wrap}>
            <header className={s.hero}>
                <p className={s.eyebrow}>Tools</p>
                <h1 className={s.title}>
                    お先に&ldquo;ちょっと未来&rdquo;を<br />サバイブする装備と知恵
                    <span className={s.num}>{live.length}</span>
                </h1>
                <p className={s.lede}>
                    ちょっと先の未来が好きで、それを先に暮らしに入れてみている。そのために今使っているモノと考えを、年齢のぶんだけ並べた。
                    {age}歳のいまは{live.length}。{next.getFullYear()}年{next.getMonth() + 1}月{next.getDate()}日に{age + 1}になる。枠の中身は、入れ替わる。
                </p>
                <div className={s.stat}>
                    <div><span className={s.k}>Slots = Age</span><span className={s.v}>{age}<small>歳</small></span></div>
                    <div><span className={s.k}>Next #{age + 1}</span><span className={s.v}>{fmt(next)}<small>あと{days}日</small></span></div>
                    <div><span className={s.k}>Swaps</span><span className={s.v}>{swaps}<small>回</small></span></div>
                    <div><span className={s.k}>Updated</span><span className={s.v}>{toolLog.length ? toolLog[toolLog.length - 1].date.replaceAll("-", ".") : "—"}</span></div>
                </div>
            </header>

            <nav className={s.tabs} aria-label="カテゴリ">
                {toolCategories.map((c) => (
                    <a key={c.key} href={`#${c.slug}`} className={`${s.tab} ${s["c" + c.key]}`}>
                        <b>{c.key}</b>{c.label}<span>{getToolsByCategory(c.key).filter((t) => t.status !== "retired").length}</span>
                    </a>
                ))}
            </nav>

            {toolCategories.map((c) => {
                const items = getToolsByCategory(c.key).filter((t) => t.status !== "retired");
                return (
                    <section key={c.key} id={c.slug} className={`${s.group} ${s["c" + c.key]}`}>
                        <div className={s.ghead}>
                            <span className={s.letter}>{c.key}</span>
                            <span className={s.gname}>
                                <span className={s.glabel}>{c.label} / {c.labelJa}</span>
                                <span className={s.gtag}>{c.tagline}</span>
                            </span>
                            <span className={s.cnt}>{items.length} / {live.length}</span>
                        </div>
                        <div className={s.grid}>
                            {items.map((t) => (
                                <Link key={t.slot} href={`/tools/${t.slot}`} className={s.card}>
                                    <div className={s.ph} data-slot={t.slot}>{/* <img src={t.photo} alt={t.name} /> */}</div>
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
