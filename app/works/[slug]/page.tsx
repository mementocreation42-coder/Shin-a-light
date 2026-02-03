import Link from 'next/link';
import { notFound } from 'next/navigation';
import { works, getWorkBySlug, getAdjacentWorks } from '@/data/works';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return works.map((work) => ({
        slug: work.slug,
    }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const work = getWorkBySlug(slug);
    if (!work) return { title: 'Work Not Found' };
    return {
        title: `${work.title} - Shine a Light`,
        description: work.overview,
    };
}

export default async function WorkDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const work = getWorkBySlug(slug);

    if (!work) {
        notFound();
    }

    const { prev, next } = getAdjacentWorks(slug);

    return (
        <div className="work-detail">
            {/* Hero */}
            <header className="work-hero">
                <div className="work-hero-inner">
                    <Link href="/#works" className="back-link">
                        ← Back to Works
                    </Link>
                    <p className="work-category">{work.category}</p>
                    <h1 className="work-detail-title">{work.title}</h1>
                    <p className="work-year">{work.year}</p>
                </div>
            </header>

            {/* Main Visual */}
            <section className="work-visual">
                {work.vimeoId ? (
                    <div className="video-container">
                        <iframe
                            src={`https://player.vimeo.com/video/${work.vimeoId}?autoplay=0&loop=1&background=0`}
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : work.youtubeId ? (
                    <div className="video-container">
                        <iframe
                            src={`https://www.youtube.com/embed/${work.youtubeId}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className={`work-main-image ${work.color}`}>
                        <img src={work.image} alt={work.title} />
                    </div>
                )}
            </section>

            {/* Content */}
            <section className="work-content">
                <div className="content-grid">
                    {/* Info Column */}
                    <aside className="work-meta">
                        <div className="meta-block">
                            <p className="meta-label">Client</p>
                            <p className="meta-value">{work.client}</p>
                        </div>
                        <div className="meta-block">
                            <p className="meta-label">Role</p>
                            <p className="meta-value">{work.role}</p>
                        </div>
                        <div className="meta-block">
                            <p className="meta-label">Year</p>
                            <p className="meta-value">{work.year}</p>
                        </div>
                        <div className="meta-block">
                            <p className="meta-label">Tools</p>
                            <p className="meta-value">{work.tools}</p>
                        </div>
                    </aside>

                    {/* Description Column */}
                    <article className="work-description">
                        <h2>Overview</h2>
                        <p>{work.overview}</p>

                        <h2>Process</h2>
                        <p>{work.process}</p>

                        <h2>Result</h2>
                        <p>{work.result}</p>
                    </article>
                </div>
            </section>

            {/* Gallery */}
            {work.gallery && work.gallery.length > 0 && (
                <section className="work-gallery">
                    <h2 className="gallery-title">Gallery</h2>
                    <div className="gallery-grid">
                        {work.gallery.map((image, index) => (
                            <div key={index} className="gallery-item">
                                <img src={image} alt={`${work.title} gallery ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Navigation */}
            <nav className="work-nav">
                {prev && (
                    <Link href={`/works/${prev.slug}`}>
                        <span className="nav-label">Previous</span>
                        <span className="nav-title">{prev.title}</span>
                    </Link>
                )}
                {next && (
                    <Link href={`/works/${next.slug}`}>
                        <span className="nav-label">Next</span>
                        <span className="nav-title">{next.title}</span>
                    </Link>
                )}
            </nav>
        </div>
    );
}
