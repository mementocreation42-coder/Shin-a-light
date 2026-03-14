import type { Metadata } from 'next';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata: Metadata = {
    title: 'Newsletter | Shine a Light',
    description: 'AI、映像、写真、Web、健康——各分野の知見や発見を不定期でお届けします。',
    alternates: {
        canonical: '/newsletter',
    },
};

const tags = [
    { slug: 'ai',     label: 'AI' },
    { slug: 'video',  label: 'Video' },
    { slug: 'photo',  label: 'Photo' },
    { slug: 'web',    label: 'Web' },
    { slug: 'health', label: '健康' },
];

export default function NewsletterPage() {
    return (
        <main className="nl-page">
            <div className="nl-inner">

                {/* Hero */}
                <div className="nl-hero">
                    <p className="nl-eyebrow">Newsletter</p>
                    <h1 className="nl-title">
                        領域を横断する<br />クリエイティブのB面を。
                    </h1>
                </div>

                {/* Tags + Description */}
                <div className="nl-topics-block">
                    <div className="nl-tags">
                        {tags.map((t) => (
                            <span key={t.slug} className="nl-capsule" data-category={t.slug}>
                                {t.label}
                            </span>
                        ))}
                    </div>
                    <p className="nl-desc">
                        AIツールの活用法・最新動向、映像制作のTipsや機材レビュー、写真表現・撮影テクニック、Web開発の知見など、各分野の"効く"知見や発見を不定期でお届けします！
                    </p>
                </div>

                {/* Form */}
                <div className="nl-form-wrapper">
                    <NewsletterForm />
                </div>

            </div>
        </main>
    );
}
