import Link from 'next/link';
import Image from 'next/image';
import { works } from '@/data/works';

export default function Works() {
    return (
        <section id="works" className="section">
            <div className="section-inner">
                <div className="section-header">
                    <span className="section-number">02</span>
                    <h2>Works &amp; Projects</h2>
                </div>
                <div className="works-grid">
                    {works.map((work) => (
                        <Link key={work.slug} href={`/works/${work.slug}`} className={`work-card ${work.color}`}>
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
                    ))}
                </div>
            </div>
        </section>
    );
}
