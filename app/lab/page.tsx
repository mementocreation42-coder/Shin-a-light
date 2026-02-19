import Link from 'next/link';
import type { Metadata } from 'next';
import { labProjects } from './data';

export const metadata: Metadata = {
    title: 'Lab - Shine a Light',
    description: 'Experimental system development projects.',
    alternates: {
        canonical: '/lab',
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
