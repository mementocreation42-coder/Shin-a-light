import Image from 'next/image';
import { universeLinks } from './data';

function UniverseCard({ link }: { link: (typeof universeLinks)[0] }) {
    return (
        <a
            href={link.url}
            target={link.sameTab ? '_self' : '_blank'}
            rel={link.sameTab ? undefined : 'noopener noreferrer'}
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
    );
}

export default function UniverseGrid() {
    const mainLinks = universeLinks.filter((l) => l.section !== 'sns');
    const snsLinks  = universeLinks.filter((l) => l.section === 'sns');

    return (
        <>
            <div className="universe-grid">
                {mainLinks.map((link) => (
                    <UniverseCard key={link.url} link={link} />
                ))}
            </div>

            <div className="universe-sns-section">
                <p className="universe-sns-label">Social Media</p>
                <div className="universe-grid universe-grid--sns">
                    {snsLinks.map((link) => (
                        <UniverseCard key={link.url} link={link} />
                    ))}
                </div>
            </div>
        </>
    );
}
