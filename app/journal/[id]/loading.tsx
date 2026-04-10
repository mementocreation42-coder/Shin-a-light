export default function ArticleLoading() {
    return (
        <main className="journal-article-page">
            <article className="journal-article">
                <div style={{ fontSize: '14px', color: '#ff764d', marginBottom: '24px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                    ← Back to Journal
                </div>

                <div className="journal-article-body">
                    {/* Hero image skeleton */}
                    <div style={{
                        margin: '-32px -32px 32px',
                        height: '300px', background: '#e0c5a8',
                        borderRadius: '16px 16px 0 0',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />

                    {/* Date */}
                    <div style={{
                        height: '14px', width: '120px', background: 'rgba(0,0,0,0.1)',
                        borderRadius: '4px', marginBottom: '16px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />

                    {/* Title */}
                    <div style={{
                        height: '28px', width: '90%', background: 'rgba(0,0,0,0.12)',
                        borderRadius: '4px', marginBottom: '10px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                    <div style={{
                        height: '28px', width: '60%', background: 'rgba(0,0,0,0.12)',
                        borderRadius: '4px', marginBottom: '32px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />

                    {/* Body lines */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{
                            height: '14px',
                            width: `${70 + Math.random() * 30}%`,
                            background: 'rgba(0,0,0,0.08)',
                            borderRadius: '3px',
                            marginBottom: '18px',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                    ))}
                </div>
            </article>
        </main>
    );
}
