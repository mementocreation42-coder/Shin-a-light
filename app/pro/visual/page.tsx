// /pro/visual — ビジュアルコミュニケーション戦略の解説ページ。
// LP（売り込み）ではなく、考え方を伝える読み物として組む。CTAは末尾に控えめに1つだけ。
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteImages } from '@/lib/siteImages';
import {
    VISUAL_PAINS,
    VISUAL_REASONS,
    VISUAL_SERVICES,
} from '@/data/pro-visual';

const TITLE = 'ビジュアルコミュニケーション戦略とは — 連続する映像・写真の考え方';
const DESCRIPTION =
    '映像や写真を「納品物」ではなく、事業の見え方を決めていく継続的な戦略として扱う考え方の解説。なぜ単発では効かないのか、年間の視覚設計・定期撮影・アーカイブ・振り返りという構成要素、一年のサイクル、続けた実例まで。';

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
        type: 'article',
        images: ['/opengraph-image'],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/opengraph-image'],
    },
};

export default async function VisualPage() {
    const img = await getSiteImages();

    return (
        <div className="pro-page visual-page">
            {/* 1. ヒーロー — 解説ページの入口。CTAは置かない */}
            <header className="pro-hero">
                <p className="b-side-mark">B-side of Shine a Light</p>
                <p className="pro-eyebrow">Strategy — ビジュアルコミュニケーション戦略</p>
                <h1 className="pro-hero-title">
                    一本の映像より、
                    <br />
                    続いていく見え方を。
                </h1>
                <p className="pro-hero-lead">
                    ビジュアルコミュニケーション戦略とは、映像や写真を「納品物」ではなく、
                    事業の見え方を決めていく継続的な活動として設計・運用する考え方です。
                    このページでは、なぜ単発の制作では効かないのか、何を、どんなサイクルで積み上げるのかを解説します。
                </p>
            </header>

            {/* 1.5 写真帯 */}
            <section className="visual-strip-section">
                <ul className="visual-strip">
                    <li><Image src={img['visual-strip-1']} alt="森で撮影した子どもの写真" fill sizes="33vw" style={{ objectFit: 'cover' }} /></li>
                    <li><Image src={img['visual-strip-2']} alt="海岸線の空撮" fill sizes="33vw" style={{ objectFit: 'cover' }} /></li>
                    <li><Image src={img['visual-strip-3']} alt="商店街のスナップ" fill sizes="33vw" style={{ objectFit: 'cover' }} /></li>
                </ul>
            </section>

            {/* 2. 課題の構造 */}
            <section className="pro-section pro-empathy">
                <div className="pro-inner">
                    <h2 className="pro-heading">単発の制作で起きること</h2>
                    <p className="pro-sub">多くの事業で、ビジュアルはこういう状態になっています。</p>
                    <ul className="pro-pain-list">
                        {VISUAL_PAINS.map((pain) => (
                            <li key={pain}>{pain}</li>
                        ))}
                    </ul>
                    <p className="pro-empathy-close">
                        単発の制作が悪いのではありません。ただ、一本の映像は「その時点」を映すだけで、事業は動き続けます。
                        見え方も、動き続けるものとして扱う必要があります。これがこの戦略の出発点です。
                    </p>
                </div>
            </section>

            {/* 3. なぜ連続か — 戦略の核 */}
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

            {/* 4. 戦略の構成要素 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">戦略の構成要素</h2>
                    <p className="pro-sub">
                        設計・撮影・映像・写真・仕上げ・振り返り。六つの要素が一つのサイクルとして噛み合います。
                    </p>
                    <div className="visual-service-grid">
                        {VISUAL_SERVICES.map((s) => (
                            <div key={s.title} className="visual-service-card">
                                <p className="visual-service-label">{s.label}</p>
                                <h3 className="visual-service-title">{s.title}</h3>
                                <p>{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. 結び — 依頼への導線は控えめに1つ */}
            <section className="pro-section pro-final">
                <div className="pro-inner">
                    <h2 className="pro-final-title">今の見え方から、一緒に棚卸しを。</h2>
                    <p className="pro-final-lead">
                        この考え方で伴走するご依頼も受けています。費用の目安は
                        <Link href="/pro" className="pro-faq-link">/pro のご依頼の形と費用</Link>
                        へ。サイトと SNS の URL をいただければ、最初の棚卸しはこちらで済ませてからお話しします。
                    </p>
                    <Link href="/pro/contact" className="pro-cta-button">
                        相談する（無料）
                    </Link>
                    <p className="pro-final-note">小林大介 / Shine a Light</p>
                </div>
            </section>
        </div>
    );
}
