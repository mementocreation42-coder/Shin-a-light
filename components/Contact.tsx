'use client';

import { useState, FormEvent } from 'react';

export default function Contact() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        setMessage('');

        const formData = new FormData(e.currentTarget);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                    subject: formData.get('subject') as string,
                    message: formData.get('message') as string,
                }),
            });

            const result = await response.json();

            if (response.ok && result.status === 'mail_sent') {
                setStatus('success');
                setMessage('メッセージが送信されました。ありがとうございます！');
                (e.target as HTMLFormElement).reset();
            } else {
                setStatus('error');
                setMessage(result.message || '送信に失敗しました。時間をおいて再度お試しください。');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus('error');
            setMessage('通信中にエラーが発生しました。');
        }
    };

    return (
        <section id="contact" className="section">
            <div className="section-inner narrow">
                <div className="section-header">
                    <h2>Contact</h2>
                </div>
                <p className="contact-description">
                    企画・プロデュース／ディレクションを軸に、映像制作・写真撮影（出張撮影〈MEMENTO〉を含む）・
                    Web制作・執筆／取材まで、構想から発信までを一貫して設計・伴走します。
                    「まだ形にはなっていないけれど、こんなことはできる？」——そんな段階のご相談や、
                    形式にとらわれないコラボレーションも歓迎です。
                </p>
                <p className="contact-description contact-note">
                    徳島・牟岐町を拠点に、オンラインでのやり取りで全国どこでも対応します。
                    いただいた内容を確認のうえ、数日以内にご返信します。まずはお気軽にどうぞ。
                </p>
                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" name="name" required disabled={status === 'submitting'} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" required disabled={status === 'submitting'} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="subject">Category</label>
                        <select id="subject" name="subject" defaultValue="" required disabled={status === 'submitting'}>
                            <option value="" disabled>お問い合わせ内容を選択</option>
                            <option value="企画・プロデュース／ディレクション">企画・プロデュース／ディレクション</option>
                            <option value="映像制作">映像制作</option>
                            <option value="写真撮影">写真撮影</option>
                            <option value="思い出撮影（MEMENTO）">思い出撮影（MEMENTO）</option>
                            <option value="Web制作">Web制作</option>
                            <option value="執筆・取材">執筆・取材</option>
                            <option value="コラボレーション・その他">コラボレーション・その他</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea id="message" name="message" rows={5} required disabled={status === 'submitting'} />
                    </div>

                    {message && (
                        <div className={`form-message ${status}`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={status === 'submitting'}
                    >
                        {status === 'submitting' ? 'Sending...' : 'Send Message'}
                    </button>
                </form>


            </div>
        </section>
    );
}

