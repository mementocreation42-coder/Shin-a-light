import NewsletterForm from '@/components/NewsletterForm';

/**
 * ページ末尾に置く共通のニュースレター導線。
 * 本体の /newsletter ページより軽く、その場で登録まで完結させる。
 */
export default function NewsletterCta({
    title = 'SAL LETTER',
    lede = '映像・写真・AI・釣り・健康 —— 暮らしを軽くするヒントを、不定期で届けています。',
}: {
    title?: string;
    lede?: string;
}) {
    return (
        <section className="nl-cta" aria-label="ニュースレター登録">
            <div className="nl-cta-inner">
                <p className="fl-eyebrow">Newsletter</p>
                <h2 className="nl-cta-title">{title}</h2>
                <p className="nl-cta-lede">{lede}</p>
                <NewsletterForm />
                <p className="nl-cta-note">
                    🎁 登録者には写真現像プリセット「selpico3」をプレゼント。
                </p>
            </div>
        </section>
    );
}
