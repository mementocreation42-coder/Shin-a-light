import Link from 'next/link';
import { notFound } from 'next/navigation';
import { folklore, getFolkloreBySlug } from '@/data/folklore';
import FolkloreBlocks from '@/components/folklore/FolkloreBlocks';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return folklore.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const item = getFolkloreBySlug(slug);
    if (!item) return { title: 'Folklore Not Found' };

    const ogImage = item.hero.poster || item.hero.src;
    return {
        title: `${item.title} — Folklore`,
        description: item.excerpt,
        alternates: {
            canonical: `/folklore/${slug}`,
        },
        openGraph: {
            title: `${item.title} - Folklore | Shine a Light`,
            description: item.excerpt,
            url: `/folklore/${slug}`,
            siteName: 'Shine a Light',
            locale: 'ja_JP',
            type: 'article',
            images: [{ url: ogImage, width: 1200, height: 630, alt: item.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${item.title} - Folklore | Shine a Light`,
            description: item.excerpt,
            images: [ogImage],
        },
    };
}

export default async function FolkloreDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const item = getFolkloreBySlug(slug);

    if (!item) {
        notFound();
    }

    return (
        <article className="folklore-detail">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: item.title,
                        image: [item.hero.poster || item.hero.src],
                        about: item.title,
                        articleSection: 'Folklore',
                        author: {
                            '@type': 'Person',
                            name: 'DAISUKE KOBAYASHI',
                            url: 'https://www.shinealight.jp',
                        },
                        description: item.excerpt,
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.shinealight.jp' },
                            { '@type': 'ListItem', position: 2, name: 'Folklore', item: 'https://www.shinealight.jp/folklore' },
                            { '@type': 'ListItem', position: 3, name: item.title },
                        ],
                    }),
                }}
            />

            {/* Hero */}
            <header className="folklore-hero">
                {item.hero.kind === 'video' ? (
                    <video
                        className="folklore-hero-media"
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={item.hero.poster || undefined}
                    >
                        <source src={item.hero.src} type="video/mp4" />
                    </video>
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="folklore-hero-media" src={item.hero.src} alt={item.title} />
                )}
                <div className="folklore-hero-overlay" />
                <div className="folklore-hero-content">
                    <Link href="/folklore" className="back-link">
                        ← Folklore
                    </Link>
                    <p className="folklore-hero-meta">
                        {item.region}
                        {item.year ? ` ・ ${item.year}` : ''}
                    </p>
                    <h1 className="folklore-hero-title">{item.title}</h1>
                    {item.titleEn && <p className="folklore-hero-title-en">{item.titleEn}</p>}
                    <p className="folklore-hero-hook">{item.hero.hook}</p>
                </div>
                <div className="folklore-hero-scroll" aria-hidden>
                    <span className="folklore-hero-scroll-label">Scroll</span>
                    <span className="folklore-hero-scroll-line" />
                </div>
            </header>

            {/* Blocks */}
            <FolkloreBlocks blocks={item.blocks} />
        </article>
    );
}
