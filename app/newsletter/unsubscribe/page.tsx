import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isDbConfigured } from '@/lib/db';
import { findByUnsubToken, unsubscribeByToken } from '@/lib/newsletter';

export const metadata: Metadata = {
    title: '配信解除',
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

/**
 * 解除は必ずボタンを押させる（GET では解除しない）。
 * メールクライアントやセキュリティ製品が本文中のURLを先読みすることがあり、
 * リンクを開いただけで解除する作りだと、本人の意思と無関係に解除されてしまう。
 */
async function doUnsubscribe(formData: FormData) {
    'use server';
    const token = String(formData.get('token') ?? '');
    await unsubscribeByToken(token);
    redirect(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}&done=1`);
}

export default async function UnsubscribePage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string; done?: string }>;
}) {
    const { token, done } = await searchParams;

    let subscriber: { email: string; status: string } | null = null;
    if (token && isDbConfigured()) {
        try {
            subscriber = await findByUnsubToken(token);
        } catch (error) {
            console.error('[Newsletter] unsubscribe lookup failed:', error);
        }
    }

    // 解除直後
    if (done && subscriber) {
        return (
            <main className="nl-page">
                <div className="nl-inner">
                    <div className="nl-success">
                        <div className="nl-success-icon">✓</div>
                        <h1 className="nl-success-title">配信を解除しました</h1>
                        <p className="nl-success-desc">
                            今後このアドレスへの配信は行いません。<br />
                            お読みいただきありがとうございました。
                        </p>
                        <div className="nl-result-actions">
                            <Link href="/" className="nl-result-link">サイトへ</Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // トークンが無効
    if (!subscriber) {
        return (
            <main className="nl-page">
                <div className="nl-inner">
                    <div className="nl-success nl-result--error">
                        <div className="nl-success-icon">×</div>
                        <h1 className="nl-success-title">リンクが正しくありません</h1>
                        <p className="nl-success-desc">
                            URLが途中で切れている可能性があります。
                            解除できない場合はお問い合わせください。
                        </p>
                        <div className="nl-result-actions">
                            <Link href="/contact" className="nl-result-link">お問い合わせ</Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // すでに解除済み
    if (subscriber.status === 'unsubscribed') {
        return (
            <main className="nl-page">
                <div className="nl-inner">
                    <div className="nl-success">
                        <div className="nl-success-icon">✓</div>
                        <h1 className="nl-success-title">すでに解除済みです</h1>
                        <p className="nl-success-desc">
                            このアドレスへの配信はすでに停止しています。
                        </p>
                        <div className="nl-result-actions">
                            <Link href="/" className="nl-result-link">サイトへ</Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // 確認画面
    return (
        <main className="nl-page">
            <div className="nl-inner">
                <div className="nl-success">
                    <h1 className="nl-success-title nl-result-title--plain">配信を解除しますか？</h1>
                    <p className="nl-success-desc">次のアドレスへの配信を停止します。</p>
                    <p className="nl-unsub-email">{subscriber.email}</p>

                    <form action={doUnsubscribe}>
                        <input type="hidden" name="token" value={token} />
                        <button type="submit" className="email-submit-btn">解除する</button>
                    </form>

                    <div className="nl-result-actions">
                        <Link href="/" className="nl-result-link">解除せずに戻る</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
