'use client';

import React, { useState } from 'react';

interface EmailCaptureFormProps {
    productId: string;
    downloadPath?: string;
}

export default function EmailCaptureForm({ productId, downloadPath }: EmailCaptureFormProps) {
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

            const [downloadResponse] = await Promise.all([
                fetch('/api/download', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, productId }),
                }),
                fetch('/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, referer: `store/${productId}` }),
                }),
            ]);

            const data = await downloadResponse.json();

            if (!downloadResponse.ok) {
                throw new Error(data.error || 'エラーが発生しました。');
            }

            setStatus('success');

            // Automatically trigger download if path is provided
            if (downloadPath) {
                const a = document.createElement('a');
                a.href = downloadPath;
                a.download = downloadPath.split('/').pop() || 'download';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

        } catch (error) {
            console.error('Submission error:', error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'エラーが発生しました。もう一度お試しください。');
        }
    };

    if (status === 'success') {
        return (
            <div className="email-capture-success">
                <div className="success-icon">✓</div>
                <h3>登録ありがとうございます！</h3>
                <p>ダウンロードが開始されました。</p>
                {downloadPath ? (
                    <a href={downloadPath} className="download-fallback-link" download>
                        うまくダウンロードされない場合はこちらをクリック
                    </a>
                ) : (
                    <p className="error-text">ダウンロードファイルが見つかりません。</p>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="email-capture-form">
            <h3 className="email-capture-title">無料でダウンロードする</h3>
            <p className="email-capture-desc">
                メールアドレスをご登録いただくと、そのままダウンロードが開始されます。
                <br /><br />
                <span style={{ color: '#999', fontSize: '12px' }}>🍖 スパムは送りません。<br />💌 SAL LETTERを不定期でお届けします。</span>
            </p>

            <div className="email-input-group">
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
                    {status === 'loading' ? '処理中...' : 'ダウンロード'}
                </button>
            </div>

            {status === 'error' && (
                <p className="email-error-text">{errorMessage}</p>
            )}
        </form>
    );
}
