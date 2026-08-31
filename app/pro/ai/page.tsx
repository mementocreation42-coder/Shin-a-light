// /pro/ai — AI研修・顧問。
// 「つくる」（システム開発）に対する「教える」。相手の実際の仕事を教材にする伴走型。
import type { Metadata } from 'next';
import Link from 'next/link';
import { AI_PAINS, AI_TOPICS, AI_PLANS, AI_FAQS } from '@/data/pro-ai';

const TITLE = 'AI研修・顧問 — 自分の仕事で使えるようになる';
const DESCRIPTION =
    '講義ではなく、あなたの実際の仕事を教材に、AIの使いどころと使い方を隣で教えます。単発ワークショップ、月イチ伴走、経営者1on1。徳島から全国対応（オンライン可）。';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: '/pro/ai',
    },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: '/pro/ai',
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

const CTA_HREF = '/pro/contact';

export default function AiPage() {
    return (
        <div className="pro-page ai-page">
            {/* 1. ヒーロー */}
            <header className="pro-hero">
                <p className="b-side-mark">B-side of Shine a Light</p>
                <p className="pro-eyebrow">For clients — AI研修・顧問</p>
                <h1 className="pro-hero-title">
                    自分の仕事で、
                    <br />
                    使えるようになる。
                </h1>
                <p className="pro-hero-lead">
                    講義ではなく、あなたの実際の仕事を教材にして、AIの使いどころと使い方を隣で教えます。
                    ツールの流行を追いかけるのではなく、明日の仕事がひとつ軽くなるところから。
                </p>
            </header>

            {/* 2. 共感 */}
            <section className="pro-section pro-empathy">
                <div className="pro-inner">
                    <h2 className="pro-heading">こんな状態に、心当たりはありませんか</h2>
                    <ul className="pro-pain-list">
                        {AI_PAINS.map((pain) => (
                            <li key={pain}>{pain}</li>
                        ))}
                    </ul>
                    <p className="pro-empathy-close">
                        道具は悪くありません。自分の仕事のどこで使うかが決まっていないだけです。
                        そこを一緒に決めるのが、この研修と顧問の仕事です。
                    </p>
                </div>
            </section>

            {/* 3. つくる と 教える */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">「つくる」と「教える」</h2>
                    <p className="pro-sub">同じAIでも、任せ方は仕事の種類で変わります。</p>
                    <div className="pro-systems-grid">
                        <div className="pro-systems-card">
                            <p className="pro-systems-label">毎回同じ作業</p>
                            <p>
                                仕組みにして渡すほうが早い。こちらでつくって運用します（
                                <Link href="/pro/systems" className="pro-faq-link">小さなシステム開発</Link>
                                ）。
                            </p>
                        </div>
                        <div className="pro-systems-card">
                            <p className="pro-systems-label">判断と言葉が要る仕事</p>
                            <p>
                                道具として自分で使えるようになるほうが早い。ここで教えます。
                                企画、文章、見積、お客さんへの返事——仕事の中心ほどこちらです。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. 教えること */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">教えること</h2>
                    <p className="pro-sub">機能の一覧ではなく、仕事の場面で分けています。</p>
                    <div className="pro-systems-grid">
                        {AI_TOPICS.map((t) => (
                            <div key={t.title} className="pro-systems-card">
                                <p className="pro-systems-label">{t.label}</p>
                                <p className="ai-topic-title">{t.title}</p>
                                <p>{t.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. 提供の形と費用 */}
            <section className="pro-section pro-plans-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">提供の形と費用</h2>
                    <p className="pro-sub">目安の金額です。人数と内容で変わります。</p>
                    <div className="pro-plan-grid">
                        {AI_PLANS.map((plan) => (
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
                        表示はすべて税別・出張の場合は交通費別途です。オンラインでも対面（徳島県内）でも行えます。
                    </p>
                </div>
            </section>

            {/* 6. FAQ */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">よくあるご質問</h2>
                    <dl className="pro-faq">
                        {AI_FAQS.map((faq) => (
                            <div key={faq.q} className="pro-faq-item">
                                <dt>{faq.q}</dt>
                                <dd>{faq.a}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* 7. CTA */}
            <section className="pro-section pro-final">
                <div className="pro-inner">
                    <h2 className="pro-final-title">お気軽にお問い合わせを。</h2>
                    <p className="pro-final-lead">
                        いま困っている仕事をひとつ教えてください。それを教材に、最初の相談を組み立てます。
                    </p>
                    <Link href={CTA_HREF} className="pro-cta-button">
                        相談する（無料）
                    </Link>
                </div>
            </section>
        </div>
    );
}
