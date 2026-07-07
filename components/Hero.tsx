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
                <p className="hero-subtitle">
                    徳島を拠点に活動するクリエイター／プロデューサー 小林大介
                </p>
            </div>
        </section>
    );
}
