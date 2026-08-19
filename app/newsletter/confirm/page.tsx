import type { Metadata } from 'next';
import Link from 'next/link';
import { isDbConfigured } from '@/lib/db';
import { confirmSubscriber } from '@/lib/newsletter';

export const metadata: Metadata = {
    title: '登録の確認',
    // 確認URLはトークン付き。検索結果に出さない
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function ConfirmPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;

    let result: 'confirmed' | 'already_active' | 'invalid' = 'invalid';
    if (token && isDbConfigured()) {
        try {
            result = await confirmSubscriber(token);
        } catch (error) {
            console.error('[Newsletter] confirm failed:', error);
        }
    }

    const view =
        result === 'confirmed'
            ? {
                  icon: '✓',
                  modifier: '',
                  title: '登録が完了しました',
                  desc: 'これから不定期にお届けします。いつでも解除できます。',
              }
            : result === 'already_active'
              ? {
                    icon: '✓',
                    modifier: '',
                    title: 'すでに登録済みです',
                    desc: 'このリンクは確認済みです。配信は有効になっています。',
                }
              : {
                    icon: '×',
                    modifier: 'nl-result--error',
                    title: 'リンクが正しくありません',
                    desc: 'URLが途中で切れている可能性があります。お手数ですが、もう一度登録をお試しください。',
                };

    return (
        <main className="nl-page">
            <div className="nl-inner">
                <div className={`nl-success ${view.modifier}`}>
                    <div className="nl-success-icon">{view.icon}</div>
                    <h1 className="nl-success-title">{view.title}</h1>
                    <p className="nl-success-desc">{view.desc}</p>
                    <div className="nl-result-actions">
                        <Link href={result === 'invalid' ? '/newsletter' : '/'} className="nl-result-link">
                            {result === 'invalid' ? '登録ページへ戻る' : 'サイトへ'}
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
