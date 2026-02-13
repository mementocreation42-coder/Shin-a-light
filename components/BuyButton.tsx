'use client';

import { useState } from 'react';

interface BuyButtonProps {
    productId: string;
    price: number;
    label?: string;
}

export default function BuyButton({ productId, price, label }: BuyButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleBuy = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'エラーが発生しました');
                return;
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch {
            setError('接続エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                className="buy-now-btn product-buy-btn"
                onClick={handleBuy}
                disabled={loading}
                style={{ opacity: loading ? 0.6 : 1 }}
            >
                {loading
                    ? 'Processing...'
                    : label || `Buy Now — ¥${price.toLocaleString()}`}
            </button>
            {error && (
                <p style={{ color: 'var(--accent-orange)', fontSize: 12, marginTop: 8 }}>
                    {error}
                </p>
            )}
        </div>
    );
}
