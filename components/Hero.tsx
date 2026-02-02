export default function Hero() {
    return (
        <section id="hero" className="section hero">
            {/* Vimeo Background Video */}
            <div className="hero-video-container">
                <iframe
                    src="https://player.vimeo.com/video/1013002269?background=1&autoplay=1&loop=1&muted=1&quality=1080p"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                />
            </div>
            <div className="hero-overlay" />
            <div className="hero-content">
                <h1 className="hero-title">Shine a Light</h1>
                <p className="hero-quote">
                    <span className="quote-line-1">There is strong shadow</span>
                    <span className="quote-line-2">where there is much light.</span>
                </p>
            </div>
        </section>
    );
}
