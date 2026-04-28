import type { Metadata } from 'next';
import UniverseGrid from './UniverseGrid';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata: Metadata = {
    title: 'SAL - すべての活動をここから',
    description: 'SAL ecosystem — all activities and projects in one place.',
    alternates: {
        canonical: '/universe',
    },
};

export default function UniversePage() {
    return (
        <div className="universe-page">
                <header className="universe-hero">
                    <h1 className="universe-hero-title">SAL</h1>
                    <p className="universe-hero-sub">疲れた身体を整え、ともに創り、自然に触れ、自身の時間を取り戻す知恵と技術を。</p>
                </header>

                <UniverseGrid />

                <section className="universe-newsletter">
                    <p className="universe-newsletter-label">NEWSLETTER</p>
                    <h2 className="universe-newsletter-title">サバイブする知恵と技術を</h2>
                    <p className="universe-newsletter-desc">
                        SALの活動・思考・近況をまとめてお届けします！
                    </p>
                    <div className="nl-tags" style={{ marginTop: '56px', marginBottom: '56px' }}>
                        {[
                            { slug: 'ai',     label: 'AI' },
                            { slug: 'video',  label: 'Video' },
                            { slug: 'photo',  label: 'Photo' },
                            { slug: 'web',    label: 'Web' },
                            { slug: 'tools',  label: 'Tools' },
                            { slug: 'health', label: 'Health' },
                        ].map((t) => (
                            <span key={t.slug} className="nl-capsule" data-category={t.slug}>
                                {t.label}
                            </span>
                        ))}
                    </div>
                    <div className="universe-newsletter-inner">
                        <NewsletterForm benefits={[
                            '🎁 登録者には、SAL謹製写真現像プリセット「selpico3」をプレゼント。',
                            '📬 映像・写真・健康・AI・自然、暮らしのヒントを不定期に届ける。',
                            '🔧 使っているツール・ワークフロー・機材の話を共有。',
                        ]} />
                    </div>
                </section>
        </div>
    );
}
