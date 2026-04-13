import type { Metadata } from 'next';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata: Metadata = {
    title: 'Newsletter | Shine a Light',
    description: 'AI、映像、写真、Web、健康——各分野の知見や発見を不定期でお届けします。',
    alternates: {
        canonical: '/newsletter',
    },
    openGraph: {
        title: 'Newsletter | Shine a Light',
        description: 'AI、映像、写真、Web、健康——各分野の知見や発見を不定期でお届けします。',
        url: '/newsletter',
        siteName: 'Shine a Light',
        locale: 'ja_JP',
        type: 'website',
        images: [
            {
                url: '/images/profile.jpg',
                width: 587,
                height: 587,
                alt: 'Shine a Light Newsletter',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Newsletter | Shine a Light',
        description: 'AI、映像、写真、Web、健康——各分野の知見や発見を不定期でお届けします。',
        images: ['/images/profile.jpg'],
    },
};

const tags = [
    { slug: 'ai',     label: 'AI' },
    { slug: 'video',  label: 'Video' },
    { slug: 'photo',  label: 'Photo' },
    { slug: 'web',    label: 'Web' },
    { slug: 'tools',  label: 'Tools' },
    { slug: 'health', label: 'Health' },
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
                </div>

                {/* Form */}
                <div className="nl-form-wrapper">
                    <NewsletterForm />
                </div>

            </div>
        </main>
    );
}
