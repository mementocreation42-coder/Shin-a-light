import Image from 'next/image';
import { universeLinks, tagMeta } from './data';

function PhotoTile({ link }: { link: (typeof universeLinks)[0] }) {
    return (
        <a
            href={link.url}
            target={link.sameTab ? '_self' : '_blank'}
            rel={link.sameTab ? undefined : 'noopener noreferrer'}
            className={`uv-tile${link.wide ? ' uv-tile--wide' : ''}`}
            style={{ ['--card-accent' as string]: link.accent }}
        >
            <div className="uv-tile-media" style={{ background: link.gradient }}>
                {link.image && (
                    <Image
                        src={link.image}
                        alt={link.title}
                        fill
                        sizes={link.wide ? '(min-width: 760px) 720px, 100vw' : '(min-width: 760px) 352px, 100vw'}
                        className="uv-tile-image"
                    />
                )}
            </div>
            <span className="uv-tile-arrow" aria-hidden="true">
                {link.sameTab ? '→' : '↗'}
            </span>
            <div className="uv-tile-content">
                <span className="uv-tile-domain">{link.domain}</span>
                <h3 className="uv-tile-title">{link.title}</h3>
                <p className="uv-tile-desc">{link.description}</p>
                <div className="uv-tile-tags">
                    {link.tags.map((t) => (
                        <span
                            key={t}
                            className="uv-tag"
                            style={{ ['--tag-color' as string]: tagMeta[t].color }}
                        >
                            {tagMeta[t].label}
                        </span>
                    ))}
                </div>
            </div>
        </a>
    );
}

export default function UniverseGrid() {
    const mainLinks = universeLinks.filter((l) => l.section !== 'sns');
    const snsLinks  = universeLinks.filter((l) => l.section === 'sns');

    return (
        <div className="uv">
            <div className="uindex-head">
                <span className="uindex-eyebrow">ECOSYSTEM</span>
                <span className="uindex-count">
                    {String(universeLinks.length).padStart(2, '0')} destinations
                </span>
            </div>

            <div className="uv-grid">
                {mainLinks.map((link) => (
                    <PhotoTile key={link.url} link={link} />
                ))}
            </div>

            <div className="uv-sns">
                <p className="uv-sns-label">Social</p>
                <div className="uv-sns-grid">
                    {snsLinks.map((link) => (
                        <a
                            key={link.url}
                            href={link.url}
                            target={link.sameTab ? '_self' : '_blank'}
                            rel={link.sameTab ? undefined : 'noopener noreferrer'}
                            className="uv-sns-card"
                            style={{ ['--card-accent' as string]: link.accent }}
                        >
                            <span
                                className="uv-sns-glyph"
                                style={{ background: link.gradient }}
                            >
                                {link.glyph === '🎙' ? (
                                    <svg
                                        className="uv-sns-glyph-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <rect x="9" y="2" width="6" height="12" rx="3" />
                                        <path d="M5 10a7 7 0 0 0 14 0" />
                                        <line x1="12" y1="17" x2="12" y2="21" />
                                        <line x1="8" y1="21" x2="16" y2="21" />
                                    </svg>
                                ) : (
                                    link.glyph
                                )}
                            </span>
                            <span className="uv-sns-meta">
                                <span className="uv-sns-domain">{link.domain}</span>
                                <span className="uv-sns-title">{link.title}</span>
                            </span>
                            <span className="uv-sns-arrow" aria-hidden="true">↗</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
