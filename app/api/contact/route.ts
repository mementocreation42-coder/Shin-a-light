import { NextRequest, NextResponse } from 'next/server';

// journal.shinealight.jp はパーマリンク形式の /wp-json/ が無効なため、
// クエリ形式 (?rest_route=) の REST エンドポイントを使う。
const CF7_ENDPOINT =
    'https://journal.shinealight.jp/index.php?rest_route=/contact-form-7/v1/contact-forms/16255/feedback';

export async function POST(req: NextRequest) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { status: 'validation_failed', message: '必須項目が入力されていません。' },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { status: 'validation_failed', message: '有効なメールアドレスを入力してください。' },
                { status: 400 }
            );
        }

        // Contact Form 7 のデフォルトフィールド名にマッピング
        const body = new FormData();
        body.append('_wpcf7', '16255');
        body.append('_wpcf7_version', '5.9');
        body.append('_wpcf7_locale', 'ja');
        body.append('_wpcf7_unit_tag', 'wpcf7-f16255-o1');
        body.append('_wpcf7_container_post', '0');
        body.append('your-name', name);
        body.append('your-email', email);
        body.append('your-subject', 'Message from Shine a Light Portfolio');
        body.append('your-message', message);

        const cf7Res = await fetch(CF7_ENDPOINT, {
            method: 'POST',
            body,
        });

        const result = await cf7Res.json();

        if (result.status === 'mail_sent') {
            return NextResponse.json({ status: 'mail_sent' });
        }

        return NextResponse.json(
            {
                status: result.status ?? 'mail_failed',
                message: result.message ?? '送信に失敗しました。時間をおいて再度お試しください。',
            },
            { status: 502 }
        );
    } catch (error) {
        console.error('[Contact] Error:', error);
        return NextResponse.json(
            { status: 'error', message: '通信中にエラーが発生しました。' },
            { status: 500 }
        );
    }
}
