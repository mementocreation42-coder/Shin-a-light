import Link from 'next/link';
import { labProjects } from './data';

export const metadata = {
    title: 'Lab - Shine a Light',
    description: 'Experimental system development projects.',
};

export default function LabPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-20">
                <span className="block text-sm font-mono text-gray-500 mb-4">04</span>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">LAB</h1>
                <p className="mt-6 text-gray-400 max-w-2xl">
                    System development, experimental tools, and prototypes.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {labProjects.map((project) => (
                    <Link href={`/lab/${project.slug}`} key={project.slug} className="block group">
                        <div className="border border-white/10 p-8 h-full hover:border-white/30 transition-colors bg-white/5 hover:bg-white/10">
                            <h2 className="text-xl font-bold mb-4 group-hover:text-orange-500 transition-colors">{project.title}</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">{project.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
