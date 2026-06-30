import Link from 'next/link';
import Image from 'next/image';
import { projects, clientWorks, type Work } from '@/data/works';

function ProjectsList({ items }: { items: Work[] }) {
    return (
        <ul className="projects-list">
            {items.map((work) => (
                <li key={work.slug} className="project-item">
                    <Link href={`/works/${work.slug}`} className="project-card">
                        <div className="project-image">
                            <Image
                                src={work.image}
                                alt={work.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 900px"
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div className="project-info">
                            <p className="project-category">{work.category}</p>
                            <h3 className="project-name">{work.title}</h3>
                            <span className="project-cta">View →</span>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function WorkGrid({ items }: { items: Work[] }) {
    return (
        <ul className="works-grid">
            {items.map((work) => (
                <li key={work.slug} className={`work-card-wrapper`}>
                    <Link href={`/works/${work.slug}`} className={`work-card ${work.color}`}>
                        <div className="work-thumb">
                            <Image
                                src={work.image}
                                alt={work.title}
                                fill
                                className="work-image"
                                sizes="(max-width: 768px) 100vw, (max-width: 900px) 50vw, 33vw"
                            />
                        </div>
                        <div className="work-info">
                            <h3>{work.title}</h3>
                            <p>{work.category}</p>
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default function Works() {
    return (
        <section id="works" className="section">
            <div className="section-inner narrow">
                <div className="section-header" id="projects">
                    <h2>Projects</h2>
                </div>
                <p className="works-lead">
                    企画から開発・デザイン・運営まで、自ら立ち上げ、走らせ続けているプロジェクト。
                </p>
                <ProjectsList items={projects} />

                <div className="section-header works-subhead">
                    <h2>Works</h2>
                </div>
                <p className="works-lead">
                    クライアントと共に手がけた映像・ビジュアル・メディアの仕事。
                </p>
                <WorkGrid items={clientWorks} />
            </div>
        </section>
    );
}
