import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { works } from '@/data/works';
import {
    PRO_SERVICES,
    PRO_STEPS,
    PRO_PLANS,
    PRO_FAQS,
    PRO_WORK_SLUGS,
} from '@/data/pro';

const TITLE = '企画から発信まで、通しで引き受ける — Shine a Light';
const DESCRIPTION =
    'まだ光の当たっていない土地・人・営みを、企画から映像・写真・Web・執筆・運営まで一貫して設計し、届く形にします。徳島を拠点に全国対応。';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: '/pro',
    },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: '/pro',
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

/** CTAはこの1本だけ。Contactのカテゴリを企画・プロデュースに寄せて着地させる */
const CTA_HREF = '/?c=produce#contact';

const proWorks = PRO_WORK_SLUGS.map((slug) => works.find((w) => w.slug === slug)).filter(
    (w): w is NonNullable<typeof w> => Boolean(w),
);

export default function ProPage() {
    return (
        <div className="pro-page">
            {/* 1. ヒーロー — 変化の一文 */}
            <header className="pro-hero">
                <p className="pro-eyebrow">For clients — 企画・プロデュース</p>
                <h1 className="pro-hero-title">
                    まだ光の当たっていないものを、
                    <br />
                    最も映える形にして手渡す。
                </h1>
                <p className="pro-hero-lead">
                    どこに頼めばいいか分からない、を終わらせます。
                    企画・映像・写真・Web・執筆・運営まで、分業に預けず一人の作り手が通して引き受けます。
                    徳島・牟岐町を拠点に、打ち合わせはオンラインで全国どこでも。
                </p>
                <div className="pro-hero-actions">
                    <Link href={CTA_HREF} className="pro-cta-button">
                        相談する（無料）
                    </Link>
                    <span className="pro-hero-note">まだ形になっていない段階のご相談で構いません。</span>
                </div>

                {/* 今すぐ相談しない人の出口。CTAとは階層を変え、行動を競合させない */}
                <p className="pro-hero-secondary">
                    <Link href="/pro/approach">
                        まずは考え方を読む — 企画書をそのまま公開しています →
                    </Link>
                </p>
            </header>

            {/* 2. 共感 — 部族の現状 */}
            <section className="pro-section pro-empathy">
                <div className="pro-inner">
                    <h2 className="pro-heading">こんなことが起きていませんか</h2>
                    <ul className="pro-pain-list">
                        <li>
                            制作会社に頼んだら綺麗に仕上がった。ただ、自分たちの言葉ではなくなっていた。
                        </li>
                        <li>
                            企画の人、撮る人、書く人、つくる人がバラバラで、最初に決めたことが最後まで残らない。
                        </li>
                        <li>
                            映像はできた。でも、どこにどう出せば届くのかは誰も引き受けてくれなかった。
                        </li>
                        <li>
                            伝えたい良さはある。それを言葉にするところから、誰かに手伝ってほしい。
                        </li>
                    </ul>
                    <p className="pro-empathy-close">
                        分業が悪いのではありません。ただ、人と土地の物語は、手から手へ渡るたびに少しずつ薄まります。
                        だから、通します。
                    </p>
                </div>
            </section>

            {/* 3. 提供内容 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">引き受ける範囲</h2>
                    <p className="pro-sub">構想から運用まで、途切れさせずに担当します。</p>
                    <div className="pro-service-grid">
                        {PRO_SERVICES.map((group) => (
                            <div key={group.label} className="pro-service-card">
                                <h3 className="pro-service-label">{group.label}</h3>
                                <ul className="pro-service-items">
                                    {group.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. 進め方 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">進め方</h2>
                    <p className="pro-sub">最初の相談から、届いたあとの改善まで。</p>
                    <ol className="pro-steps">
                        {PRO_STEPS.map((step) => (
                            <li key={step.no} className="pro-step">
                                <span className="pro-step-no">{step.no}</span>
                                <div className="pro-step-body">
                                    <h3 className="pro-step-title">{step.title}</h3>
                                    <p>{step.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                    <p className="pro-inline-link">
                        <Link href="/pro/approach">
                            この進め方の背景にある考え方を、企画書のかたちで公開しています →
                        </Link>
                    </p>
                </div>
            </section>

            {/* 5. 証拠 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">これまでの仕事</h2>
                    <p className="pro-sub">自治体・企業・個人事業まで。各案件の詳細は Works に。</p>
                    <ul className="pro-work-grid">
                        {proWorks.map((work) => (
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
                        ))}
                    </ul>
                    <p className="pro-work-more">
                        <Link href="/#works">すべての実績を見る →</Link>
                    </p>
                </div>
            </section>

            {/* 6. オファー */}
            <section className="pro-section pro-plans-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">ご依頼の形と費用</h2>
                    <p className="pro-sub">
                        内容によって変わるため、判断の目安としての金額です。正確なお見積りは打ち合わせのあとに。
                    </p>
                    <div className="pro-plan-grid">
                        {PRO_PLANS.map((plan) => (
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
                        表示はすべて税別・交通費および宿泊費は別途です。予算の上限が決まっている場合は、その範囲で組み直します。
                    </p>
                </div>
            </section>

            {/* 7. FAQ */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">よくあるご質問</h2>
                    <dl className="pro-faq">
                        {PRO_FAQS.map((faq) => (
                            <div key={faq.q} className="pro-faq-item">
                                <dt>{faq.q}</dt>
                                <dd>{faq.a}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* 8. CTA — 行動は1種類 */}
            <section className="pro-section pro-final">
                <div className="pro-inner">
                    <h2 className="pro-final-title">まず、話を聞かせてください。</h2>
                    <p className="pro-final-lead">
                        企画になる前の「こんなことはできる？」の段階が、いちばん面白い相談です。
                        いただいた内容を確認のうえ、数日以内にご返信します。
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
