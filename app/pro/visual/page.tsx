import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { works } from '@/data/works';
import {
    VISUAL_PAINS,
    VISUAL_REASONS,
    VISUAL_SERVICES,
    VISUAL_WORK_SLUGS,
    VISUAL_STEPS,
    VISUAL_PLANS,
    VISUAL_FAQS,
} from '@/data/pro-visual';

const TITLE = '連続的な映像・写真クリエイション — ビジュアルコミュニケーション戦略';
const DESCRIPTION =
    '一本の映像で終わらせず、年間を通して映像と写真を積み上げ、事業の「見え方」を設計・制作・運用する。年間の視覚設計、定期撮影、映像のシリーズ化、写真アーカイブ、媒体ごとの仕上げ、振り返りまで。徳島から全国対応。';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: '/pro/visual',
    },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: '/pro/visual',
        siteName: 'Shine a Light',
        locale: 'ja_JP',
        type: 'website',
        images: ['/opengraph-image'],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/opengraph-image'],
    },
};

/** CTA は /pro と同じ1本 */
const CTA_HREF = '/?c=produce#contact';

const visualWorks = VISUAL_WORK_SLUGS.map((slug) => works.find((w) => w.slug === slug)).filter(
    (w): w is NonNullable<typeof w> => Boolean(w),
);

/** '2018-' のような継続表記から「◯年目」を出す。単年なら null */
function continuingYears(year: string, now: number): number | null {
    const m = year.match(/^(\d{4})\s*[-–]\s*$/);
    if (!m) return null;
    const start = Number(m[1]);
    return Math.max(1, now - start + 1);
}

export default function VisualPage() {
    const thisYear = new Date().getFullYear();

    return (
        <div className="pro-page visual-page">
            {/* 1. ヒーロー */}
            <header className="pro-hero">
                <p className="b-side-mark">B-side of Shine a Light</p>
                <p className="pro-eyebrow">For clients — ビジュアルコミュニケーション戦略</p>
                <h1 className="pro-hero-title">
                    一本の映像より、
                    <br />
                    続いていく見え方を。
                </h1>
                <p className="pro-hero-lead">
                    映像や写真を「納品物」ではなく、事業の見え方を決めていく継続的な活動として設計します。
                    年間の視覚設計、定期の撮影、映像のシリーズ化、写真のアーカイブ、出し先ごとの仕上げまで。
                    同じ人間が撮り続けるから、色も視点も揃っていきます。
                </p>
                <div className="pro-hero-actions">
                    <Link href={CTA_HREF} className="pro-cta-button">
                        相談する（無料）
                    </Link>
                    <span className="pro-hero-note">まず一本から始めて、年間に移ることもできます。</span>
                </div>
                <p className="pro-hero-secondary">
                    <Link href="/pro/approach">この考え方の背景 — 受け皿から逆算する企画の考え方 →</Link>
                </p>
            </header>

            {/* 2. 共感 */}
            <section className="pro-section pro-empathy">
                <div className="pro-inner">
                    <h2 className="pro-heading">こんな相談から始まることが多いです</h2>
                    <ul className="pro-pain-list">
                        {VISUAL_PAINS.map((pain) => (
                            <li key={pain}>{pain}</li>
                        ))}
                    </ul>
                    <p className="pro-empathy-close">
                        単発の制作が悪いのではありません。ただ、一本の映像は「その時点」を映すだけで、事業は動き続けます。
                        見え方も、動き続けるものとして扱う必要があります。
                    </p>
                </div>
            </section>

            {/* 3. なぜ連続か */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">なぜ「連続」なのか</h2>
                    <p className="pro-sub">ビジュアルを戦略として扱うときの、三つの前提です。</p>
                    <ol className="visual-reasons">
                        {VISUAL_REASONS.map((r, i) => (
                            <li key={r.title} className="visual-reason">
                                <span className="visual-reason-no">{String(i + 1).padStart(2, '0')}</span>
                                <div>
                                    <h3 className="visual-reason-title">{r.title}</h3>
                                    <p>{r.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* 4. 提供の形 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">年間で引き受ける範囲</h2>
                    <p className="pro-sub">設計から振り返りまで。撮影だけを切り出すこともできますが、通すほど効きます。</p>
                    <div className="visual-service-grid">
                        {VISUAL_SERVICES.map((s) => (
                            <div key={s.label} className="visual-service-card">
                                <p className="visual-service-label">{s.label}</p>
                                <h3 className="visual-service-title">{s.title}</h3>
                                <p className="visual-service-body">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. 実例 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">続けてきた仕事</h2>
                    <p className="pro-sub">
                        牟岐町とは 2018 年から。同じ土地と人を撮り続けることで、映像も写真も「その町らしさ」として積み上がっています。
                    </p>
                    <ul className="pro-work-grid">
                        {visualWorks.map((work) => {
                            const years = continuingYears(work.year, thisYear);
                            return (
                                <li key={work.slug}>
                                    <Link href={`/works/${work.slug}`} className="pro-work-card">
                                        <div className="pro-work-thumb">
                                            <Image
                                                src={work.image}
                                                alt={work.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                style={{ objectFit: 'cover' }}
                                            />
                                            {years && years > 1 && (
                                                <span className="visual-work-years">{years}年目</span>
                                            )}
                                        </div>
                                        <div className="pro-work-info">
                                            <p className="pro-work-client">
                                                {work.client}
                                                <span className="pro-work-year">{work.year}</span>
                                            </p>
                                            <h3 className="pro-work-title">{work.title}</h3>
                                            <p className="pro-work-role">{work.role}</p>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="pro-work-more">
                        <Link href="/#works">すべての実績を見る →</Link>
                    </p>
                </div>
            </section>

            {/* 6. 進め方 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">進め方</h2>
                    <p className="pro-sub">棚卸しから始め、撮って、出して、振り返る。この輪を一年回します。</p>
                    <ol className="pro-steps">
                        {VISUAL_STEPS.map((step) => (
                            <li key={step.no} className="pro-step">
                                <span className="pro-step-no">{step.no}</span>
                                <div className="pro-step-body">
                                    <h3 className="pro-step-title">{step.title}</h3>
                                    <p>{step.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* 7. オファー */}
            <section className="pro-section pro-plans-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">ご依頼の形と費用</h2>
                    <p className="pro-sub">判断の目安としての金額です。撮影日数と出し先の数で変わります。</p>
                    <div className="pro-plan-grid">
                        {VISUAL_PLANS.map((plan) => (
                            <div
                                key={plan.name}
                                className={`pro-plan-card${plan.recommended ? ' is-recommended' : ''}`}
                            >
                                {plan.recommended && <span className="pro-plan-badge">おすすめ</span>}
                                <h3 className="pro-plan-name">{plan.name}</h3>
                                <p className="pro-plan-tagline">{plan.tagline}</p>
                                <p className="pro-plan-price">{plan.price}</p>
                                <p className="pro-plan-price-note">{plan.priceNote}</p>
                                <ul className="pro-plan-includes">
                                    {plan.includes.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <p className="pro-plan-foot">
                        表示はすべて税別・交通費および宿泊費は別途です。海部郡の事業者は、制作費に補助金が使える場合があります（
                        <Link href="/pro/hojokin" className="systems-inline-link">
                            一覧はこちら
                        </Link>
                        ）。
                    </p>
                </div>
            </section>

            {/* 8. FAQ */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">よくあるご質問</h2>
                    <dl className="pro-faq">
                        {VISUAL_FAQS.map((faq) => (
                            <div key={faq.q} className="pro-faq-item">
                                <dt>{faq.q}</dt>
                                <dd>{faq.a}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* 9. CTA — 行動は1種類 */}
            <section className="pro-section pro-final">
                <div className="pro-inner">
                    <h2 className="pro-final-title">今の見え方を、一度一緒に見ませんか。</h2>
                    <p className="pro-final-lead">
                        サイトと SNS の URL をいただければ、最初の棚卸しはこちらで済ませてからお話しします。
                        数日以内にご返信します。
                    </p>
                    <Link href={CTA_HREF} className="pro-cta-button">
                        相談する（無料）
                    </Link>
                    <p className="pro-final-note">小林大介 / Shine a Light｜徳島県牟岐町</p>
                </div>
            </section>
        </div>
    );
}
