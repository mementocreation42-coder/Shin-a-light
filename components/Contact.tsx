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
                    映像制作、Web関連のほか、形式にとらわれないコラボレーションのご相談もお待ちしております。
                    <br className="contact-break" />
                    どうぞお気軽にお問い合わせください。
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

