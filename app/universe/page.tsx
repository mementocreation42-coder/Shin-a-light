import type { Metadata } from 'next';
import Image from 'next/image';
import { universeLinks } from './data';

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
                <p className="universe-hero-sub">すべての活動をここから</p>
            </header>

            <div className="universe-grid">
                {universeLinks.map((link) => (
                    <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="universe-card"
                        style={{ ['--card-accent' as string]: link.accent }}
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
                            <span className="universe-card-arrow" aria-hidden="true">↗</span>
                        </div>
                        <div className="universe-card-body">
                            <div className="universe-card-domain">{link.domain}</div>
                            <h3 className="universe-card-title">{link.title}</h3>
                            <p className="universe-card-desc">{link.description}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
