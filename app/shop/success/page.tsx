import Link from 'next/link';

export default function SuccessPage() {
    return (
        <div className="shop-page">
            <section className="shop-hero" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <div className="shop-hero-inner">
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'var(--accent-orange)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 32px',
                            fontSize: 36,
                        }}
                    >
                        ✓
                    </div>
                    <h1 className="shop-title" style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>
                        Thank You!
                    </h1>
                    <p
                        className="shop-subtitle"
                        style={{
                            maxWidth: 480,
                            margin: '0 auto',
                            lineHeight: 1.8,
                            fontSize: 14,
                            marginBottom: 40,
                        }}
                    >
                        ご購入ありがとうございます。
                        <br />
                        デジタル商品のダウンロードリンクをメールでお送りしました。
                        <br />
                        届かない場合は迷惑メールフォルダをご確認ください。
                    </p>
                    <Link
                        href="/shop"
                        style={{
                            display: 'inline-block',
                            padding: '12px 32px',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
                        ← Back to Shop
                    </Link>
                </div>
            </section>
        </div>
    );
}
