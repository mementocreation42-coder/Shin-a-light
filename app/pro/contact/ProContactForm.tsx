'use client';

import { useState, FormEvent } from 'react';

const TOPICS = [
    '映像・写真（単発）',
    '年間のビジュアル戦略',
    'Webサイト・メディア',
    'システム開発・自動化',
    '補助金を使った制作',
    'まだ決まっていない・相談から',
];

const BUDGETS = ['まだ分からない', '〜10万円', '10〜30万円', '30〜100万円', '100万円〜'];

export default function ProContactForm() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        setMessage('');

        const fd = new FormData(e.currentTarget);
        const topic = fd.get('topic') as string;
        const company = (fd.get('company') as string)?.trim();
        const budget = fd.get('budget') as string;
        const body = [
            fd.get('message') as string,
            '',
            '---',
            `相談の種類: ${topic}`,
            `予算感: ${budget}`,
            company ? `会社・屋号: ${company}` : null,
            '送信元: /pro/contact',
        ]
            .filter((v) => v !== null)
            .join('\n');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fd.get('name'),
                    email: fd.get('email'),
                    subject: `[Pro相談] ${topic}`,
                    message: body,
                }),
            });
            const result = await res.json();
            if (res.ok && result.status === 'mail_sent') {
                setStatus('success');
                setMessage('送信しました。数日以内にご返信します。');
                (e.target as HTMLFormElement).reset();
            } else {
                setStatus('error');
                setMessage(result.message || '送信に失敗しました。時間をおいて再度お試しください。');
            }
        } catch {
            setStatus('error');
            setMessage('送信に失敗しました。時間をおいて再度お試しください。');
        }
    };

    return (
        <form className="pro-form" onSubmit={handleSubmit}>
            <div className="pro-form-row">
                <label className="pro-form-field">
                    <span className="pro-form-label">お名前 *</span>
                    <input type="text" name="name" required autoComplete="name" />
                </label>
                <label className="pro-form-field">
                    <span className="pro-form-label">会社・屋号（任意）</span>
                    <input type="text" name="company" autoComplete="organization" />
                </label>
            </div>

            <label className="pro-form-field">
                <span className="pro-form-label">メールアドレス *</span>
                <input type="email" name="email" required autoComplete="email" />
            </label>

            <div className="pro-form-row">
                <label className="pro-form-field">
                    <span className="pro-form-label">相談の種類</span>
                    <select name="topic" defaultValue={TOPICS[5]}>
                        {TOPICS.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="pro-form-field">
                    <span className="pro-form-label">予算感（任意）</span>
                    <select name="budget" defaultValue={BUDGETS[0]}>
                        {BUDGETS.map((b) => (
                            <option key={b} value={b}>
                                {b}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <label className="pro-form-field">
                <span className="pro-form-label">相談内容 *</span>
                <textarea
                    name="message"
                    rows={7}
                    required
                    placeholder="「こんなことできる？」の段階で構いません。困っていること・やってみたいことを、そのまま書いてください。"
                />
            </label>

            <div className="pro-form-actions">
                <button type="submit" className="pro-cta-button" disabled={status === 'submitting'}>
                    {status === 'submitting' ? '送信中…' : '送信する'}
                </button>
                <span className="pro-form-note">数日以内にご返信します。売り込みのご連絡はしません。</span>
            </div>

            {message && (
                <p className={`pro-form-status ${status === 'success' ? 'is-success' : 'is-error'}`} role="status">
                    {message}
                </p>
            )}
        </form>
    );
}
