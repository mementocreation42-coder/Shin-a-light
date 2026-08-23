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
import { effectiveStatus, publishedHojokin } from '@/data/hojokin';
import {
    IconCamera,
    IconGear,
    IconYen,
    IconCompass,
    IconCalendar,
    IconUsers,
    IconHand,
    IconZap,
    IconBell,
    IconSparkles,
    IconPencil,
    IconHammer,
    IconRocket,
} from './icons';

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
const CTA_HREF = '/pro/contact';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
    構想する: <IconPencil />,
    つくる: <IconHammer />,
    走らせる: <IconRocket />,
};

/** 補助金一覧の「公募中」件数。締切を過ぎた行を落とすため日次で再生成する */
export const revalidate = 86400;

const proWorks = PRO_WORK_SLUGS.map((slug) => works.find((w) => w.slug === slug)).filter(
    (w): w is NonNullable<typeof w> => Boolean(w),
);

/** '2018-' のような継続表記から「◯年目」 */
function continuingYears(year: string | undefined, now: number): number {
    const m = year?.match(/^(\d{4})\s*[-–]\s*$/);
    return m ? Math.max(1, now - Number(m[1]) + 1) : 1;
}


/** FAQ 本文中の「/pro/...」をリンクにする（データ側はプレーンテキストのまま） */
function linkifyProPaths(text: string): React.ReactNode {
    const parts = text.split(/(\/pro\/[a-z-]+)/g);
    return parts.map((part, i) =>
        /^\/pro\/[a-z-]+$/.test(part) ? (
            <Link key={i} href={part} className="pro-faq-link">
                {part}
            </Link>
        ) : (
            part
        ),
    );
}

export default function ProPage() {
    const today = new Date();
    const mugiYears = continuingYears(works.find((w) => w.slug === 'mugi-promotion-video')?.year, today.getFullYear());
    const hojokinRows = publishedHojokin(today);
    const hojokinOpen = hojokinRows.filter((h) => effectiveStatus(h, today) === '公募中').length;
    const hojokinUpcoming = hojokinRows.filter((h) => effectiveStatus(h, today) === '予告').length;

    return (
        <div className="pro-page">
            {/* 1. ヒーロー — 変化の一文 */}
            <header className="pro-hero">
                <p className="b-side-mark">B-side of Shine a Light</p>
                <p className="pro-eyebrow">For clients — 企画・プロデュース</p>
                <h1 className="pro-hero-title">
                    まだ光の当たっていないものを、
                    <br />
                    最も映える形にして手渡す。
                </h1>
                <p className="pro-hero-lead">
                    映像も、写真も、Webも、システムも。
                    ぜんぶ、一人で引き受けます。
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
                        まずは考え方を読む — 企画書をそのまま公開しています →
                    </Link>
                </p>

                {/* 任せて大丈夫、の根拠を3点だけ。数字は works.ts から */}
                <dl className="pro-trust">
                    <div>
                        <dt><IconCalendar />牟岐町と</dt>
                        <dd>{mugiYears}年目</dd>
                    </div>
                    <div>
                        <dt><IconUsers />引き受けてきた相手</dt>
                        <dd>自治体・企業・個人事業</dd>
                    </div>
                    <div>
                        <dt><IconHand />体制</dt>
                        <dd>企画から運用まで、一人で通す</dd>
                    </div>
                </dl>
            </header>

            {/* 1.5 細分化の索引 — LP の中を掘れることを最初に見せる */}
            <section className="pro-section pro-index-section">
                <div className="pro-inner">
                    <p className="pro-index-lead">詳しく見たい方向から、どうぞ。</p>
                    <ul className="pro-index">
                        <li>
                            <Link href="/pro/visual" className="pro-index-card">
                                <span className="pro-index-thumb">
                                    <Image src="/images/photos/DSC00161.jpg" alt="" fill sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                                </span>
                                <span className="pro-index-label"><IconCamera />映像・写真</span>
                                <span className="pro-index-title">続けて撮る映像・写真</span>
                                <span className="pro-index-sub">年間で見え方をつくる</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/pro/systems" className="pro-index-card">
                                <span className="pro-index-thumb">
                                    <Image src="/images/photos/DSC00066.jpg" alt="" fill sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                                </span>
                                <span className="pro-index-label"><IconGear />システム</span>
                                <span className="pro-index-title">小さなシステム開発</span>
                                <span className="pro-index-sub">自動化・通知・AI・立ち上げ</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/pro/hojokin" className="pro-index-card">
                                <span className="pro-index-thumb">
                                    <Image src="/images/photos/DJI_0005.jpg" alt="" fill sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                                </span>
                                <span className="pro-index-label"><IconYen />補助金</span>
                                <span className="pro-index-title">使える補助金の一覧</span>
                                <span className="pro-index-sub">海部郡向け・一次資料で確認</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/pro/approach" className="pro-index-card">
                                <span className="pro-index-thumb">
                                    <Image src="/images/photos/DJI_0017.jpg" alt="" fill sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                                </span>
                                <span className="pro-index-label"><IconCompass />考え方</span>
                                <span className="pro-index-title">企画書を、そのまま公開</span>
                                <span className="pro-index-sub">受け皿から逆算する</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </section>

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
                        だから、最初から最後まで、ひとりで通します。
                    </p>
                </div>
            </section>

            {/* 3. 提供内容 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">引き受ける範囲</h2>
                    <p className="pro-sub">考える、つくる、届ける。ぜんぶ。</p>
                    <div className="pro-service-grid">
                        {PRO_SERVICES.map((group) => (
                            <div key={group.label} className="pro-service-card">
                                <h3 className="pro-service-label">
                                    {SERVICE_ICONS[group.label] ?? null}
                                    {group.label}
                                </h3>
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

            {/* 3.3 ビジュアル戦略 — 単発ではなく続ける映像・写真。詳細は /pro/visual */}
            <section className="pro-section pro-visual">
                <div className="pro-inner">
                    <h2 className="pro-heading">映像と写真は、続けてこそ効く</h2>
                    <p className="pro-sub">
                        一本つくって終わり、にしない。年間で「見え方」を育てます。
                    </p>
                    <div className="pro-visual-box has-thumb">
                        <span className="pro-visualbox-thumb">
                            <Image src="/images/photos/DJI_0012.jpg" alt="牟岐町の海岸の空撮" fill sizes="(max-width: 900px) 100vw, 260px" style={{ objectFit: 'cover' }} />
                        </span>
                        <p>
                            牟岐町は 2018 年から撮り続けて9年目。
                            サイトでも SNS でも印刷物でも、どこで見ても「その町らしさ」がある状態をつくってきました。
                        </p>
                        <ul className="pro-visual-points">
                            <li>年間の視覚設計（トーン・被写体・出す場所）</li>
                            <li>月次・季節ごとの定期撮影と映像のシリーズ化</li>
                            <li>探せる写真アーカイブと、媒体ごとの仕上げ</li>
                            <li>四半期の振り返りと翌期の設計</li>
                        </ul>
                    </div>
                    <p className="pro-inline-link">
                        <Link href="/pro/visual">ビジュアル戦略の詳細（考え方・範囲・実例・費用） →</Link>
                    </p>
                </div>
            </section>

            {/* 3.5 システム開発 — 制作と同じ人間が、業務の仕組みまで組む。詳細は /pro/systems */}
            <section className="pro-section pro-systems">
                <div className="pro-inner">
                    <h2 className="pro-heading">各社に合わせた、システム開発も</h2>
                    <p className="pro-sub">
                        映像と同じ人間が、業務の裏側まで。御社の仕事に合わせて小さく組みます。
                    </p>
                    <div className="pro-systems-grid">
                        <div className="pro-systems-card">
                            <p className="pro-systems-label"><IconZap />自動化</p>
                            <p>問い合わせ → 見積 → 請求。手作業の連鎖を、一本につなげます。</p>
                        </div>
                        <div className="pro-systems-card">
                            <p className="pro-systems-label"><IconBell />巡回・通知</p>
                            <p>役所の募集や取引先の更新。変わったときだけ、通知が届くように。</p>
                        </div>
                        <div className="pro-systems-card">
                            <p className="pro-systems-label"><IconSparkles />発信の裏側と AI</p>
                            <p>CMS・メルマガ・AI下書き。自分の事業で使っているものから提案します。</p>
                        </div>
                    </div>
                    <p className="pro-inline-link">
                        <Link href="/pro/systems">システム開発の詳細（つくるもの・実例・進め方・費用） →</Link>
                    </p>
                </div>
            </section>

            {/* 4. 進め方 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">進め方</h2>
                    <p className="pro-sub">相談から改善まで、5ステップ。</p>
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
                            この進め方の背景にある考え方を、企画書のかたちで公開しています →
                        </Link>
                    </p>
                </div>
            </section>

            {/* 5. 証拠 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">これまでの仕事</h2>
                    <p className="pro-sub">自治体から個人事業まで。</p>
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
                        <Link href="/#works">すべての実績を見る →</Link>
                    </p>
                </div>
            </section>

            {/* 6. オファー */}
            <section className="pro-section pro-plans-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">ご依頼の形と費用</h2>
                    <p className="pro-sub">
                        目安の金額です。正確なお見積りは、打ち合わせのあとに。
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

            {/* 6.5 補助金 — 費用の不安を下げる。詳細は /pro/hojokin に逃がす */}
            <section className="pro-section pro-hojokin">
                <div className="pro-inner">
                    <h2 className="pro-heading">制作費に、補助金を使う</h2>
                    <p className="pro-sub">
                        海部郡の事業者なら、制作費の半分〜2/3が戻ることも。制度探しから実績報告まで手伝います。
                    </p>
                    <div className="pro-hojokin-box">
                        <dl className="pro-hojokin-stats">
                            <div>
                                <dt>公募中</dt>
                                <dd>{hojokinOpen}件</dd>
                            </div>
                            <div>
                                <dt>受付予定</dt>
                                <dd>{hojokinUpcoming}件</dd>
                            </div>
                        </dl>
                        <div className="pro-hojokin-body">
                            <p>
                                国・県・町の制度を一次資料で確認して、締切・補助率・窓口つきで一覧にしています。
                            </p>
                            <Link href="/pro/hojokin" className="pro-hojokin-link">
                                海部郡で動画・Webに使える補助金を見る →
                            </Link>
                        </div>
                    </div>
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
                                <dd>{linkifyProPaths(faq.a)}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* 7.5 つくる人 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">つくる人</h2>
                    <div className="pro-profile">
                        <span className="pro-profile-photo">
                            <Image
                                src="/images/profile.jpg"
                                alt="小林大介のポートレート"
                                fill
                                sizes="(max-width: 900px) 60vw, 220px"
                                style={{ objectFit: 'cover' }}
                            />
                        </span>
                        <div className="pro-profile-body">
                            <p className="pro-profile-name">
                                小林 大介
                                <span className="pro-profile-name-en">DAISUKE KOBAYASHI</span>
                            </p>
                            <p className="pro-profile-title">
                                ビデオグラファー／Webエンジニア・徳島県牟岐町
                            </p>
                            <p className="pro-profile-bio">
                                愛知からオーストラリアを経て、「釣りがしたいから」で徳島・牟岐町へ。
                                撮る、書く、つくるを分業に預けないのは、
                                大事なことを途中で薄れさせないため。
                                牟岐町の映像とメディアを9年つくり続けています。
                            </p>
                            <ul className="pro-profile-tags">
                                <li>映像</li>
                                <li>写真</li>
                                <li>執筆</li>
                                <li>Web</li>
                                <li>システム</li>
                                <li>AI活用</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. CTA — 行動は1種類 */}
            <section className="pro-section pro-final">
                <div className="pro-inner">
                    <h2 className="pro-final-title">まず、話を聞かせてください。</h2>
                    <p className="pro-final-lead">
                        「こんなことできる？」の段階が、いちばん面白い相談です。
                    </p>
                    <Link href={CTA_HREF} className="pro-cta-button">
                        相談する（無料）
                    </Link>
                    <p className="pro-final-note">数日以内にご返信します ｜ 小林大介 / Shine a Light（徳島県牟岐町）</p>
                </div>
            </section>
        </div>
    );
}
