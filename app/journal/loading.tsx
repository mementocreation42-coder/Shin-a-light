export default function JournalLoading() {
    return (
        <main className="journal-page">
            <div className="section-inner">
                <div className="section-header" style={{ justifyContent: 'center' }}>
                    <h1>Hyperpast Journal</h1>
                </div>

                {/* Category filter skeleton */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '48px', flexWrap: 'wrap' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{
                            width: `${60 + i * 12}px`, height: '34px',
                            background: '#2a2a2a', borderRadius: '20px',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                    ))}
                </div>

                {/* Post grid skeleton */}
                <div className="journal-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{
                            background: '#2a2a2a', borderRadius: '12px',
                            overflow: 'hidden', border: '1px solid #3a3a3a',
                        }}>
                            <div style={{
                                height: '180px', background: '#333',
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }} />
                            <div style={{ padding: '20px' }}>
                                <div style={{
                                    height: '12px', width: '80px', background: '#3a3a3a',
                                    borderRadius: '4px', marginBottom: '12px',
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }} />
                                <div style={{
                                    height: '16px', width: '100%', background: '#3a3a3a',
                                    borderRadius: '4px', marginBottom: '8px',
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }} />
                                <div style={{
                                    height: '16px', width: '60%', background: '#3a3a3a',
                                    borderRadius: '4px',
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
