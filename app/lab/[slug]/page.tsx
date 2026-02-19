import { notFound } from 'next/navigation';
import Link from 'next/link';
import { labProjects } from '../data';
import LabProjectRenderer from '@/components/lab/LabProjectRenderer';

// In Next.js 15+, params is a Promise
type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return labProjects.map((project) => ({
        slug: project.slug,
    }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const project = labProjects.find((p) => p.slug === slug);
    if (!project) return { title: 'Not Found' };
    return {
        title: `${project.title} - Lab | Shine a Light`,
        description: project.description,
    };
}

export default async function LabDetailPage({ params }: Props) {
    const { slug } = await params;
    const project = labProjects.find((p) => p.slug === slug);

    if (!project) {
        notFound();
    }

    return (
        <div className="lab-section">
            <div className="lab-header">
                <Link href="/lab" className="back-link">
                    ← Back to Lab
                </Link>
                <h1 className="lab-title" style={{ fontSize: '32px', marginTop: '24px' }}>{project.title}</h1>
                <p className="lab-card-desc" style={{ fontSize: '16px', maxWidth: '800px' }}>{project.description}</p>
            </div>

            <div style={{ borderTop: 'var(--border)', paddingTop: '48px' }}>
                <div className="w-full">
                    <LabProjectRenderer componentKey={project.componentKey} />
                </div>
            </div>
        </div>
    );
}
