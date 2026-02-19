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
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-12">
                <Link href="/lab" className="text-sm text-gray-500 hover:text-white mb-6 inline-block transition-colors">
                    ← Back to Lab
                </Link>
                <h1 className="text-3xl md:text-5xl font-bold mb-6">{project.title}</h1>
                <p className="text-gray-400 max-w-2xl leading-relaxed">{project.description}</p>
            </div>

            <div className="border-t border-white/10 pt-12">
                <div className="w-full">
                    <LabProjectRenderer componentKey={project.componentKey} />
                </div>
            </div>
        </div>
    );
}
