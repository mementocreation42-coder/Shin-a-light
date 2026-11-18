import type { Metadata } from 'next';
import NewsletterForm from '@/components/NewsletterForm';

export const metadata: Metadata = {
    title: 'GoldRoom',
    description: 'Mac のための RAW 現像アプリ。ニュースレター読者に無料でお渡ししています。',
    alternates: { canonical: '/goldroom' },
};

// GoldRoom のアプリから「登録ページを開く」で来るページ。
// 新しい人は登録（確認メール → ウェルカムメールに GoldRoom）、購読中の人には利用コードを送り直す。
export default function GoldroomPage() {
    return (
        <main className="nl-page">
            <div className="nl-inner">
                <div className="nl-hero">
                    <p className="nl-eyebrow">GoldRoom</p>
                    <h1 className="nl-title">
                        Mac のための<br />RAW 現像アプリ。
                    </h1>
                </div>
                <div className="nl-form-wrapper">
                    <NewsletterForm
                        intent="goldroom"
                        benefits={[
                            '🎁 ニュースレター読者に無料でお渡ししています。',
                            '📬 登録すると、ダウンロードと利用コードがメールで届きます。',
                            '🔑 登録済みの方も、ここにメールアドレスを入れるとコードを送り直します。',
                        ]}
                    />
                </div>
            </div>
        </main>
    );
}
