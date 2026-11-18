import type { Metadata } from 'next';
import CopyCodeButton from './CopyCodeButton';

export const metadata: Metadata = {
    title: 'GoldRoom の利用コード',
    // コード付きの URL。検索結果に出さない
    robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

// メールの「コードを入れる」から来るページ。メールのアプリはカスタム URL（goldroom://）を消すことがあるので、
// いったんここで受けて、GoldRoom を開くボタンとコピーを出す。
export default async function GoldroomActivatePage({
    searchParams,
}: {
    searchParams: Promise<{ code?: string }>;
}) {
    const { code } = await searchParams;
    const valid = typeof code === 'string' && /^GR1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(code);

    return (
        <main className="nl-page">
            <div className="nl-inner">
                <div className="nl-hero">
                    <p className="nl-eyebrow">GoldRoom</p>
                    <h1 className="nl-title">利用コード</h1>
                </div>
                <div className="nl-form-wrapper" style={{ textAlign: 'center' }}>
                    {valid ? (
                        <>
                            <p style={{ marginBottom: 24 }}>
                                GoldRoom を「アプリケーション」に入れてから、下のボタンを押してください。
                            </p>
                            <p style={{ marginBottom: 16 }}>
                                <a className="email-submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }} href={`goldroom://activate?code=${encodeURIComponent(code)}`}>
                                    GoldRoom で開く
                                </a>
                            </p>
                            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>開かないときは、コードをコピーして GoldRoom に貼り付けてください。</p>
                            <CopyCodeButton code={code} />
                        </>
                    ) : (
                        <p>コードが読み取れませんでした。メールのリンクをもう一度開いてください。</p>
                    )}
                </div>
            </div>
        </main>
    );
}
