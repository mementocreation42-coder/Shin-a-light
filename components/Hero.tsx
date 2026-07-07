import { SKILL_GROUPS } from '@/data/skills';

export default function Hero() {
    return (
        <section id="hero" className="section hero">
            {/* Local Background Video */}
            <div className="hero-video-container">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="hero-video"
                    poster="/images/hero_poster.jpg"
                >
                    <source src="/videos/hero.mp4" type="video/mp4" />
                </video>
            </div>
            <div className="hero-overlay" />
            <div className="hero-content">
                <h1 className="hero-title">Shine a Light</h1>
                <p className="hero-quote">
                    <span className="quote-line-1">There is strong shadow</span>
                    <span className="quote-line-2">where there is much light.</span>
                </p>
            </div>
            <div className="hero-bottom">
                <p className="hero-subtitle">
                    徳島を拠点に活動するクリエイター／プロデューサー 小林大介
                </p>
                <div className="hero-skills">
                    {SKILL_GROUPS.map((group) => (
                        <div key={group.label} className="hero-skill-group">
                            <h2 className="hero-skill-head">{group.label}</h2>
                            <ul className="hero-skill-list">
                                {group.items.map((item) => (
                                    <li key={item} className="hero-skill-item">{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
