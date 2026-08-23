import type { Metadata } from 'next';
import ProContactForm from './ProContactForm';

export const metadata: Metadata = {
    title: '相談する（無料） — Shine a Light Pro',
    description:
        '映像・写真・Web・システム開発・補助金対応の相談窓口。まだ形になっていない段階の「こんなことできる？」からどうぞ。数日以内にご返信します。',
    alternates: { canonical: '/pro/contact' },
};

export default function ProContactPage() {
    return (
        <div className="pro-page">
            <header className="pro-hero pro-contact-hero">
                <p className="b-side-mark">B-side of Shine a Light</p>
                <p className="pro-eyebrow">For clients — 相談窓口</p>
                <h1 className="pro-hero-title">
                    まず、話を
                    <br />
                    聞かせてください。
                </h1>
                <p className="pro-hero-lead">
                    「こんなことできる？」の段階が、いちばん面白い相談です。
                    形になっていなくて大丈夫。
                </p>
            </header>

            <section className="pro-section pro-contact-section">
                <div className="pro-inner">
                    <ProContactForm />
                </div>
            </section>
        </div>
    );
}
