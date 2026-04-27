import type { Metadata } from 'next';
import Image from 'next/image';
import { universeLinks } from './data';
import NewsletterForm from '@/components/NewsletterForm';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'SAL - すべての活動をここから',
    description: 'SAL ecosystem — all activities and projects in one place.',
    alternates: {
        canonical: '/universe',
    },
};

export default function UniversePage() {
    return (
        <>
<div className="universe-page">
            <header className="universe-hero">
                <h1 className="universe-hero-title">SAL</h1>
                <p className="universe-hero-sub">疲れた身体を整え、ともに創り、自然に触れ、自身の時間を取り戻す知恵と技術を。</p>
            </header>

            <div className="universe-grid">
                {universeLinks.map((link) => (
                    <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="universe-card"
                        style={{
                            ['--card-accent' as string]: link.accent,
                            ['--card-gradient' as string]: link.gradient,
                        }}
                    >
                        <div
                            className="universe-card-visual"
                            style={{ background: link.gradient }}
                        >
                            {link.image ? (
                                <Image
                                    src={link.image}
                                    alt={link.title}
                                    fill
                                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                    className="universe-card-image"
                                />
                            ) : (
                                <span className="universe-card-glyph">{link.glyph}</span>
                            )}
                        </div>
                        <div className="universe-card-body">
                            <div className="universe-card-domain">{link.domain}</div>
                            <h3 className="universe-card-title">{link.title}</h3>
                            <p className="universe-card-desc">{link.description}</p>
                        </div>
                    </a>
                ))}
            </div>

            <section className="universe-newsletter">
                <div className="universe-newsletter-inner">
                    <p className="universe-newsletter-label">NEWSLETTER</p>
                    <h2 className="universe-newsletter-title">知恵と技術を、定期的に届ける</h2>
                    <p className="universe-newsletter-desc">
                        SALの活動・思考・近況をまとめてお届けします！
                    </p>
                    <NewsletterForm />
                </div>
            </section>
        </div>
        <Footer />
        </>
    );
}
