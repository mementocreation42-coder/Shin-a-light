import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Shine a Light — DAISUKE KOBAYASHI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '80px',
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 60%, #2a1a0a 100%)',
                    color: '#fff',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: '#ff9b3a',
                            boxShadow: '0 0 32px #ff9b3a',
                        }}
                    />
                    <span style={{ fontSize: 28, letterSpacing: 4, opacity: 0.85 }}>SHINE A LIGHT</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 96, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2 }}>
                        <span>DAISUKE</span>
                        <span>KOBAYASHI</span>
                    </div>
                    <div style={{ fontSize: 30, opacity: 0.7, letterSpacing: 1 }}>
                        Video / Photo / Web / AI — from Tokushima, JP
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, opacity: 0.5 }}>
                    <span>shinealight.jp</span>
                    <span>Portfolio · Journal · Lab</span>
                </div>
            </div>
        ),
        { ...size }
    );
}
