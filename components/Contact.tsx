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

        // Mapping our names to Contact Form 7 default field names
        const body = new FormData();
        body.append('_wpcf7', '16255');
        body.append('_wpcf7_version', '5.9');
        body.append('_wpcf7_locale', 'ja');
        body.append('_wpcf7_unit_tag', `wpcf7-f16255-o1`);
        body.append('_wpcf7_container_post', '0');
        body.append('your-name', formData.get('name') as string);
        body.append('your-email', formData.get('email') as string);
        body.append('your-subject', 'Message from Shine a Light Portfolio');
        body.append('your-message', formData.get('message') as string);

        try {
            const response = await fetch(
                'https://journal.shinealight.jp/wp-json/contact-form-7/v1/contact-forms/16255/feedback',
                {
                    method: 'POST',
                    body: body,
                }
            );

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
            <div className="section-inner">
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

                <div className="contact-info-footer" style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }} itemScope itemType="https://schema.org/LocalBusiness">
                    <p itemProp="name" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Shine a Light</p>
                    <address itemProp="address" itemScope itemType="https://schema.org/PostalAddress" style={{ fontStyle: 'normal', lineHeight: 1.6 }}>
                        <span itemProp="postalCode">〒775-0001</span><br />
                        <span itemProp="addressRegion">徳島県</span>
                        <span itemProp="addressLocality">海部郡牟岐町</span>
                        <span itemProp="streetAddress">大字河内1465</span>
                    </address>
                </div>
            </div>
        </section>
    );
}

