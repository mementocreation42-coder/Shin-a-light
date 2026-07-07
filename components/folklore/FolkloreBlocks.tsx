import Image from 'next/image';
import Link from 'next/link';
import type { FolkloreBlock } from '@/data/folklore';
import HistoryParallax from './HistoryParallax';
import HorizontalScroll from './HorizontalScroll';
import Reveal from './Reveal';

/** Split a text body on blank lines into paragraphs. */
function paragraphs(text: string): string[] {
    return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

/**
 * 画像。src が空のときは「取材予定」のプレースホルダーを表示する。
 * 実素材が入り次第 data 側の URL を差し替えるだけでよい。
 */
function Media({
    src,
    alt,
    width,
    height,
    sizes,
    label = 'Photo',
}: {
    src: string;
    alt: string;
    width: number;
    height: number;
    sizes?: string;
    label?: string;
}) {
    if (!src) {
        return (
            <div
                className="fl-ph"
                style={{ aspectRatio: `${width} / ${height}` }}
                role="img"
                aria-label={`${alt}（写真は取材予定）`}
            >
                <span className="fl-ph-label">{label}</span>
                <span className="fl-ph-note">取材予定</span>
            </div>
        );
    }
    return <Image src={src} alt={alt} width={width} height={height} sizes={sizes} />;
}

export default function FolkloreBlocks({ blocks }: { blocks: FolkloreBlock[] }) {
    return (
        <>
            {blocks.map((block, i) => (
                <BlockRenderer key={i} block={block} />
            ))}
        </>
    );
}

function BlockRenderer({ block }: { block: FolkloreBlock }) {
    switch (block.type) {
        case 'narrative':
            return (
                <section className="fl-block fl-narrative">
                    <Reveal className="fl-inner">
                        {block.eyebrow && <p className="fl-eyebrow">{block.eyebrow}</p>}
                        {paragraphs(block.text).map((p, i) => (
                            <p key={i} className="fl-narrative-text">
                                {p}
                            </p>
                        ))}
                    </Reveal>
                </section>
            );

        case 'fullMedia':
            return (
                <figure className="fl-block fl-fullmedia">
                    {block.kind === 'video' && block.src ? (
                        <video
                            className="fl-fullmedia-el"
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster={block.poster || undefined}
                        >
                            <source src={block.src} type="video/mp4" />
                        </video>
                    ) : (
                        <Media
                            src={block.kind === 'video' ? '' : block.src}
                            alt={block.caption || ''}
                            width={1920}
                            height={1080}
                            sizes="100vw"
                            label={block.kind === 'video' ? 'Footage' : 'Photo'}
                        />
                    )}
                    {block.caption && <figcaption className="fl-caption">{block.caption}</figcaption>}
                </figure>
            );

        case 'parallax':
            return (
                <HistoryParallax
                    data={{
                        background: block.background,
                        eyebrow: block.eyebrow,
                        title: block.title,
                        lead: block.lead,
                        motifs: block.motifs,
                    }}
                />
            );

        case 'horizontal':
            return (
                <HorizontalScroll
                    data={{ eyebrow: block.eyebrow, title: block.title, panels: block.panels }}
                />
            );

        case 'history':
            return (
                <section className="fl-block fl-history">
                    <div className="fl-inner">
                        <Reveal>
                            {block.eyebrow && <p className="fl-eyebrow fl-chapter">{block.eyebrow}</p>}
                            <h2 className="fl-heading">{block.heading}</h2>
                        </Reveal>
                        {block.image !== undefined && (
                            <Reveal className="fl-history-image">
                                <Media
                                    src={block.image}
                                    alt={block.heading}
                                    width={1200}
                                    height={720}
                                    sizes="(max-width: 768px) 100vw, 760px"
                                />
                            </Reveal>
                        )}
                        <div className="fl-history-text">
                            {paragraphs(block.body).map((p, i) => (
                                <Reveal key={i}>
                                    <p>{p}</p>
                                </Reveal>
                            ))}
                        </div>
                        {block.sources && block.sources.length > 0 && (
                            <Reveal className="fl-sources">
                                <p className="fl-sources-label">出典・参考資料</p>
                                <ul>
                                    {block.sources.map((s, i) => (
                                        <li key={i}>
                                            <a href={s.url} target="_blank" rel="noopener noreferrer">
                                                {s.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        )}
                    </div>
                </section>
            );

        case 'interview':
            return (
                <section className="fl-block fl-interview">
                    <div className="fl-inner">
                        {block.eyebrow && (
                            <Reveal>
                                <p className="fl-eyebrow fl-chapter">{block.eyebrow}</p>
                            </Reveal>
                        )}
                        <div className="fl-interview-grid">
                            {block.portrait !== undefined && (
                                <Reveal className="fl-portrait">
                                    <Media
                                        src={block.portrait}
                                        alt={block.name}
                                        width={900}
                                        height={1100}
                                        sizes="(max-width: 768px) 100vw, 40vw"
                                        label="Portrait"
                                    />
                                </Reveal>
                            )}
                            <Reveal delay={0.15}>
                                <blockquote className="fl-quote">
                                    <p>{block.quote}</p>
                                    <footer>
                                        <span className="fl-quote-name">{block.name}</span>
                                        {block.role && <span className="fl-quote-role">{block.role}</span>}
                                    </footer>
                                </blockquote>
                            </Reveal>
                        </div>
                    </div>
                </section>
            );

        case 'craft':
            return (
                <section className="fl-block fl-craft">
                    <div className="fl-inner">
                        <Reveal>
                            {block.eyebrow && <p className="fl-eyebrow fl-chapter">{block.eyebrow}</p>}
                            <h2 className="fl-heading">{block.heading}</h2>
                        </Reveal>
                        <ul className="fl-craft-grid">
                            {block.items.map((item, i) => (
                                <li key={i} className="fl-craft-item">
                                    <Reveal delay={(i % 3) * 0.1}>
                                        {item.image !== undefined && (
                                            <div className="fl-craft-image">
                                                <Media
                                                    src={item.image}
                                                    alt={item.title}
                                                    width={800}
                                                    height={600}
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                            </div>
                                        )}
                                        <span className="fl-craft-num">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <h3 className="fl-craft-title">{item.title}</h3>
                                        <p className="fl-craft-text">{item.text}</p>
                                    </Reveal>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            );

        case 'gallery':
            return (
                <section className="fl-block fl-gallery">
                    <div className="fl-gallery-grid">
                        {block.images.map((src, i) => (
                            <Reveal key={i} className="fl-gallery-item" delay={(i % 2) * 0.1}>
                                <Media
                                    src={src}
                                    alt={`gallery ${i + 1}`}
                                    width={1200}
                                    height={800}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </Reveal>
                        ))}
                    </div>
                </section>
            );

        case 'shadow':
            return (
                <section className="fl-block fl-shadow">
                    <Reveal className="fl-inner">
                        {block.eyebrow && <p className="fl-eyebrow fl-chapter">{block.eyebrow}</p>}
                        <h2 className="fl-heading fl-shadow-heading">{block.heading}</h2>
                        {paragraphs(block.text).map((p, i) => (
                            <p key={i} className="fl-shadow-text">
                                {p}
                            </p>
                        ))}
                    </Reveal>
                </section>
            );

        case 'related':
            return (
                <section className="fl-block fl-related">
                    <div className="fl-inner">
                        <h2 className="fl-eyebrow">{block.heading}</h2>
                        <ul className="fl-related-list">
                            {block.links.map((link, i) => (
                                <li key={i}>
                                    <Link href={link.href} className="fl-related-link">
                                        {link.label}
                                        <span aria-hidden>→</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            );

        default:
            return null;
    }
}
