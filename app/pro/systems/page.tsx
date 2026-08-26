import type { Metadata } from 'next';
import Link from 'next/link';
import {
    SYSTEMS_PAINS,
    SYSTEMS_TYPES,
    SYSTEMS_PROOF,
    SYSTEMS_STEPS,
    SYSTEMS_PRINCIPLES,
    SYSTEMS_PLANS,
    SYSTEMS_UNFIT,
    SYSTEMS_FAQS,
} from '@/data/pro-systems';

const TITLE = '各社に合わせた、小さなシステム開発 — 業務の自動化・巡回通知・AI活用';
const DESCRIPTION =
    '汎用ツールに仕事を合わせるのではなく、御社の仕事の流れに合わせて小さく組む。業務の自動化、情報の巡回と通知、数字の見える化、発信の裏側、AIアシスタントまで。企画した人間がそのまま設計・実装・運用します。徳島から全国対応。';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: '/pro/systems',
    },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: '/pro/systems',
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

/** CTA は /pro と同じ1本。Contact のカテゴリを企画・プロデュースに寄せる */
const CTA_HREF = '/pro/contact';

export default function SystemsPage() {
    return (
        <div className="pro-page systems-page">
            {/* 1. ヒーロー */}
            <header className="pro-hero">
                <p className="b-side-mark">B-side of Shine a Light</p>
                <p className="pro-eyebrow">For clients — システム開発</p>
                <h1 className="pro-hero-title">
                    仕事に合わせて、
                    <br />
                    小さく組む。
                </h1>
                <p className="pro-hero-lead">
                    便利なはずのツールが、自分たちの仕事の順番と合わない。
                    開発会社に頼むほどの規模ではない。そのあいだにある「毎回面倒なこと」を、
                    御社の仕事の流れに合わせたシステムにします。話を聞いた人間が、そのまま設計し、実装し、運用します。
                </p>
                <div className="pro-hero-actions">
                    <Link href={CTA_HREF} className="pro-cta-button">
                        相談する（無料）
                    </Link>
                    <span className="pro-hero-note">「何を頼めばいいか分からない」段階で構いません。</span>
                </div>
                <p className="pro-hero-secondary">
                    <Link href="/pro">企画・映像・Web を含めた全体の引き受け範囲はこちら →</Link>
                </p>
            </header>

            {/* 2. 共感 */}
            <section className="pro-section pro-empathy">
                <div className="pro-inner">
                    <h2 className="pro-heading">こんな相談から始まることが多いです</h2>
                    <ul className="pro-pain-list">
                        {SYSTEMS_PAINS.map((pain) => (
                            <li key={pain}>{pain}</li>
                        ))}
                    </ul>
                    <p className="pro-empathy-close">
                        既製品が悪いのではありません。ただ、仕事の流れは会社ごとに違います。
                        流れを道具に合わせるのではなく、道具を流れに合わせる。そのための開発です。
                    </p>
                </div>
            </section>

            {/* 3. つくるもの */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">つくるもの</h2>
                    <p className="pro-sub">業種ではなく、困りごとの形で分けています。ひとつの案件で複数にまたがることもあります。</p>
                    <div className="systems-type-grid">
                        {SYSTEMS_TYPES.map((t) => (
                            <div key={t.label} className="systems-type-card">
                                <p className="systems-type-label">{t.label}</p>
                                <h3 className="systems-type-title">{t.title}</h3>
                                <p className="systems-type-body">{t.body}</p>
                                <ul className="systems-type-examples">
                                    {t.examples.map((ex) => (
                                        <li key={ex}>{ex}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. 実例 — 自分で使っているもの */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">自分の仕事で、先に使っています</h2>
                    <p className="pro-sub">
                        お客様に提案する前に、自分の事業で動かしているものです。クライアント案件の社内システムは、ここには載せていません。
                    </p>
                    <ul className="systems-proof-list">
                        {SYSTEMS_PROOF.map((p) => (
                            <li key={p.title} className="systems-proof-item">
                                <div className="systems-proof-head">
                                    <h3 className="systems-proof-title">
                                        {p.href ? <Link href={p.href}>{p.title}</Link> : p.title}
                                    </h3>
                                    <span className="systems-proof-status">{p.status}</span>
                                </div>
                                <p className="systems-proof-what">{p.what}</p>
                                <p className="systems-proof-stack">{p.stack}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* 5. 進め方 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">進め方</h2>
                    <p className="pro-sub">要件定義書からは始めません。今の仕事を見せてもらうところから。</p>
                    <ol className="pro-steps">
                        {SYSTEMS_STEPS.map((step) => (
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

            {/* 6. つくり方の方針 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">つくり方の約束</h2>
                    <p className="pro-sub">技術の話ではなく、頼む側が安心していられるための線です。</p>
                    <dl className="systems-principles">
                        {SYSTEMS_PRINCIPLES.map((pr) => (
                            <div key={pr.title} className="systems-principle">
                                <dt>{pr.title}</dt>
                                <dd>{pr.body}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* 7. オファー */}
            <section className="pro-section pro-plans-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">ご依頼の形と費用</h2>
                    <p className="pro-sub">
                        まず小さく試し、続けるかを決めてから本開発に進む形を基本にしています。金額は目安です。
                    </p>
                    <div className="pro-plan-grid">
                        {SYSTEMS_PLANS.map((plan) => (
                            <div
                                key={plan.name}
                                className={`pro-plan-card${plan.recommended ? ' is-recommended' : ''}`}
                            >
                                {plan.recommended && <span className="pro-plan-badge">基本</span>}
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
                        表示はすべて税別。外部サービスの利用料（サーバー、送信 API、AI の API など）は実費で別途です。
                        予算の上限が決まっている場合は、その範囲で「まず何を解くか」から組み直します。
                    </p>
                </div>
            </section>

            {/* 8. 向かない場合 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">既製品のほうがいい場合も、そうお伝えします</h2>
                    <p className="pro-sub">何でも自作するのが正解ではありません。最初の相談で、別の選択肢が向くと判断したら率直にお伝えします。</p>
                    <ul className="systems-unfit">
                        {SYSTEMS_UNFIT.map((u) => (
                            <li key={u}>{u}</li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* 9. FAQ */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">よくあるご質問</h2>
                    <dl className="pro-faq">
                        {SYSTEMS_FAQS.map((faq) => (
                            <div key={faq.q} className="pro-faq-item">
                                <dt>{faq.q}</dt>
                                <dd>
                                    {faq.a}
                                    {faq.q.startsWith('補助金') && (
                                        <>
                                            {' '}
                                            <Link href="/pro/hojokin" className="systems-inline-link">
                                                徳島で使える補助金一覧 →
                                            </Link>
                                        </>
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* 10. CTA — 行動は1種類 */}
            <section className="pro-section pro-final">
                <div className="pro-inner">
                    <h2 className="pro-final-title">「ここが毎回面倒」から、話してください。</h2>
                    <p className="pro-final-lead">
                        スプレッドシートの画面共有ひとつで、最初の相談は足ります。
                        仕組みにすべきかどうかの判断も含めて、数日以内にご返信します。
                    </p>
                    <Link href={CTA_HREF} className="pro-cta-button">
                        相談する（無料）
                    </Link>
                    <p className="pro-final-note">小林大介 / Shine a Light｜徳島</p>
                </div>
            </section>
        </div>
    );
}
