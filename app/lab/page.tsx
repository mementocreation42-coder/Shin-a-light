import Link from 'next/link';
import type { Metadata } from 'next';
import { labProjects } from './data';

export const metadata: Metadata = {
    title: 'Lab — 実験的システム開発',
    description: '小林大介が手がける実験的なシステム・プロトタイプ・インタラクティブ作品の研究室。',
    alternates: {
        canonical: '/lab',
    },
    openGraph: {
        title: 'Lab — 実験的システム開発 | Shine a Light',
        description: '実験的なシステム・プロトタイプ・インタラクティブ作品。',
        url: '/lab',
        siteName: 'Shine a Light',
        locale: 'ja_JP',
        type: 'website',
        images: ['/opengraph-image'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Lab — 実験的システム開発 | Shine a Light',
        description: '実験的なシステム・プロトタイプ・インタラクティブ作品。',
        images: ['/opengraph-image'],
    },
};

export default function LabPage() {
    return (
        <div className="lab-section">
            <div className="lab-header">
                <h1 className="lab-title">LAB</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
                    System development, experimental tools, and prototypes.
                </p>
            </div>

            <div className="lab-grid">
                {labProjects.map((project) => (
                    <Link href={`/lab/${project.slug}`} key={project.slug} className="lab-card group">
                        <h2 className="lab-card-title">{project.title}</h2>
                        <p className="lab-card-desc">{project.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
