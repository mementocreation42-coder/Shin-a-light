import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { folklore } from '@/data/folklore';

export const metadata: Metadata = {
    title: 'Folklore',
    description:
        '土地に根ざした自然・人・営みの伝承を、一つひとつ深く掘り下げる特集。阿波おどり、鮎釣り、川の暮らし——光が当たってこなかったものを照らす。',
    alternates: {
        canonical: '/folklore',
    },
    openGraph: {
        title: 'Folklore - Shine a Light',
        description: '土地に根ざした自然・人・営みの伝承を、一つひとつ深く掘り下げる特集。',
        url: '/folklore',
        siteName: 'Shine a Light',
        locale: 'ja_JP',
        type: 'website',
    },
};

export default function FolkloreIndex() {
    return (
        <div className="folklore-index">
            <header className="folklore-index-header">
                <p className="fl-eyebrow">Folklore</p>
                <h1 className="folklore-index-title">伝承を、照らす。</h1>
                <p className="folklore-index-lead">
                    土地に根ざした自然・人・営みの伝承を、一つひとつ深く掘り下げる特集。
                    記事の数ではなく、一本ごとの深さで。
                </p>
            </header>

            <ul className="folklore-list">
                {folklore.map((item) => (
                    <li key={item.slug} className="folklore-list-item">
                        <Link href={`/folklore/${item.slug}`} className="folklore-list-card">
                            <div className="folklore-list-image">
                                <Image
                                    src={item.hero.poster || item.hero.src}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <div className="folklore-list-info">
                                <p className="folklore-list-meta">
                                    {item.region}
                                    {item.year ? ` ・ ${item.year}` : ''}
                                </p>
                                <h2 className="folklore-list-name">
                                    {item.title}
                                    {item.titleEn && (
                                        <span className="folklore-list-name-en">{item.titleEn}</span>
                                    )}
                                </h2>
                                <p className="folklore-list-excerpt">{item.excerpt}</p>
                                <span className="folklore-list-cta">Read →</span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
