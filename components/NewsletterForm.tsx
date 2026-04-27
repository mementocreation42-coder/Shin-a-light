'use client';

import React, { useState } from 'react';

export default function NewsletterForm({ giftText, benefits }: { giftText?: string; benefits?: string[] } = {}) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setErrorMessage('メールアドレスを入力してください。');
            setStatus('error');
            return;
        }

        try {
            setStatus('loading');

            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'エラーが発生しました。');
            }

            setStatus('success');
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'エラーが発生しました。もう一度お試しください。');
        }
    };

    if (status === 'success') {
        return (
            <div className="nl-success">
                <div className="nl-success-icon">✓</div>
                <h3 className="nl-success-title">登録ありがとうございます！</h3>
                <p className="nl-success-desc">
                    最初のニュースレターをお楽しみに。
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="nl-form">
            <div className="nl-input-group">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                    }}
                    placeholder="your@email.com"
                    className="email-input"
                    disabled={status === 'loading'}
                    required
                />
                <button
                    type="submit"
                    className="email-submit-btn"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? '送信中...' : '登録する'}
                </button>
            </div>
            {status === 'error' && (
                <p className="email-error-text">{errorMessage}</p>
            )}
            {benefits && benefits.map((text, i) => (
                <p key={i} className="nl-gift">{text}</p>
            ))}
            {giftText && (
                <p className="nl-gift">{giftText}</p>
            )}
            <p className="nl-privacy">
                🍖 スパムは送りません。いつでも解除できます。
            </p>
        </form>
    );
}
