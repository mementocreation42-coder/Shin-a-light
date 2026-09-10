// /tools/[slot] — アイテム
// スターター。未検証。Next 15+ なので params は Promise。
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import s from "../tools.module.css";
import { tools, toolCategories } from "@/data/tools";
import { getToolMerged, getToolsMerged, neighborsIn, resolveToolPhoto } from "@/lib/toolsStore";

// 本文・写真は管理画面（/admin/tools）で上書きできる。保存時に revalidatePath するが、念のため1時間で作り直す
export const revalidate = 3600;

type Props = { params: Promise<{ slot: string }> };

export function generateStaticParams() {
    return tools.map((t) => ({ slot: t.slot }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slot } = await params;
    const t = await getToolMerged(slot);
    if (!t) return {};
    return {
        title: `${t.slot} ${t.name} — Tools`,
        description: t.oneLine || t.name,
    };
}

export default async function ToolPage({ params }: Props) {
    const { slot } = await params;
    const t = await getToolMerged(slot);
    if (!t) notFound();
    const cat = toolCategories.find((c) => c.key === t.category)!;
    const { prev, next } = neighborsIn(await getToolsMerged(), t.slot);
    const photo = resolveToolPhoto(t.photo);
    const photo2 = resolveToolPhoto(t.photo2);

    return (
        <main className={`${s.wrap} ${s["c" + t.category]}`}>
            <article className={s.item}>
                {/* 写真は 2 枚。1 枚目はモノ、2 枚目は使っている場面や別アングル */}
                <div className={s.photos}>
                    <div className={`${s.big} ${s.big1}`} data-slot={t.slot}>
                        {photo && <Image src={photo} alt={t.name} fill sizes="(max-width: 900px) 100vw, 480px" style={{ objectFit: "cover" }} />}
                    </div>
                    <div className={`${s.big} ${s.big2}`} data-slot={t.slot}>
                        {photo2 && <Image src={photo2} alt={`${t.name}（2枚目）`} fill sizes="(max-width: 900px) 100vw, 480px" style={{ objectFit: "cover" }} />}
                    </div>
                </div>
                <div>
                    <div className={s.crumb}>
                        <Link href="/tools">Tools</Link><span>/</span>
                        <Link href={`/tools#${cat.slug}`}>{cat.label} <em>{cat.labelJa}</em></Link>
                    </div>
                    <p className={s.slotno}><b>{t.slot}</b><span>{t.addedAtAge}歳の枠</span></p>
                    <h1 className={s.h1}>{t.name}</h1>
                    {t.oneLine && <p className={s.lede}>{t.oneLine}</p>}

                    {!t.why && !t.future && (
                        <p className={s.draft}>この枠の話は、まだ書いていない。撮って、書いて、順に埋めていく。</p>
                    )}
                    {t.why && <div className={s.blk}><h4>なぜこれか</h4><p>{t.why}</p></div>}
                    {t.future && <div className={s.blk}><h4>どこが &ldquo;ちょっと未来&rdquo; か</h4><p>{t.future}</p></div>}

                    {(t.spec.weightG || t.spec.material || t.spec.years || t.spec.source) && (
                        <div className={s.blk}><h4>Spec</h4>
                            <dl className={s.spec}>
                                {t.spec.weightG != null && <><dt>重量</dt><dd>{t.spec.weightG} g</dd></>}
                                {t.spec.material && <><dt>素材</dt><dd>{t.spec.material}</dd></>}
                                {t.spec.years != null && <><dt>使用年数</dt><dd>{t.spec.years} 年</dd></>}
                                {t.spec.source && <><dt>入手先</dt><dd>{t.spec.source}</dd></>}
                            </dl>
                        </div>
                    )}

                    {(t.links.buy || t.links.podcast || t.links.note || t.links.instagram) && (
                        <div className={s.blk}><h4>Links</h4>
                            <div className={s.links}>
                                {t.links.buy && <a href={t.links.buy} target="_blank" rel="noopener">購入先</a>}
                                {t.links.podcast && <a href={t.links.podcast} target="_blank" rel="noopener">Podcast で話した回</a>}
                                {t.links.note && <a href={t.links.note} target="_blank" rel="noopener">note の記事</a>}
                                {t.links.instagram && <a href={t.links.instagram} target="_blank" rel="noopener">Instagram リール</a>}
                            </div>
                        </div>
                    )}

                </div>
            </article>

            {/* 前後送りと一覧へ。記事の下に横一列 */}
            <nav className={s.pager} aria-label="前後の枠">
                {prev ? (
                    <Link href={`/tools/${prev.slot}`} className={s.pagerPrev}>
                        <span>← {prev.slot}</span><b>{prev.name}</b>
                    </Link>
                ) : <span />}
                <Link href="/tools" className={s.pagerAll}>Tools 一覧へ</Link>
                {next ? (
                    <Link href={`/tools/${next.slot}`} className={s.pagerNext}>
                        <span>{next.slot} →</span><b>{next.name}</b>
                    </Link>
                ) : <span />}
            </nav>
        </main>
    );
}
