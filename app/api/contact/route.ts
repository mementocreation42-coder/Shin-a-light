import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/mailer';
import { getAppSetting } from '@/lib/appSettings';

/**
 * お問い合わせの送信。
 *
 * 宛先は 環境変数 CONTACT_TO → DB（app_settings の contact_to）の順で探し、
 * 見つかればニュースレターと同じ送信サービス（Resend / Brevo。DKIM 済みで
 * 到達率が高い）で直接メールを送る。どちらも無い場合のみ、従来の
 * WordPress Contact Form 7 に中継する（CF7 は wp_mail 頼みで、届かないことがある）。
 */

// journal.shinealight.jp はパーマリンク形式の /wp-json/ が無効なため、
// クエリ形式 (?rest_route=) の REST エンドポイントを使う。
const CF7_ENDPOINT =
    'https://journal.shinealight.jp/index.php?rest_route=/contact-form-7/v1/contact-forms/16255/feedback';

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function sendDirect(to: string, name: string, email: string, subject: string, message: string) {
    const fullSubject = `[お問い合わせ] ${subject}`;
    const text =
        `お名前: ${name}\n` +
        `メール: ${email}\n\n` +
        `${message}\n`;
    const html =
        `<p><strong>お名前:</strong> ${escapeHtml(name)}<br />` +
        `<strong>メール:</strong> ${escapeHtml(email)}</p>` +
        `<pre style="font-family:inherit;white-space:pre-wrap;">${escapeHtml(message)}</pre>`;

    await sendEmail({
        to,
        subject: fullSubject,
        text,
        html,
        // 受信メールにそのまま返信すると、問い合わせた本人に届く
        replyTo: email,
    });
}

async function sendViaCf7(name: string, email: string, subject: string, message: string) {
    // Contact Form 7 のデフォルトフィールド名にマッピング
    const body = new FormData();
    body.append('_wpcf7', '16255');
    body.append('_wpcf7_version', '5.9');
    body.append('_wpcf7_locale', 'ja');
    body.append('_wpcf7_unit_tag', 'wpcf7-f16255-o1');
    body.append('_wpcf7_container_post', '0');
    body.append('your-name', name);
    body.append('your-email', email);
    body.append('your-subject', `[お問い合わせ] ${subject}`);
    body.append('your-message', message);

    const cf7Res = await fetch(CF7_ENDPOINT, { method: 'POST', body });
    return cf7Res.json();
}

export async function POST(req: NextRequest) {
    try {
        const { name, email, subject, message } = await req.json();

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

        const cleanSubject =
            typeof subject === 'string' && subject.trim()
                ? subject.trim()
                : 'Message from Shine a Light Portfolio';

        const contactTo = process.env.CONTACT_TO ?? (await getAppSetting('contact_to'));
        if (contactTo) {
            await sendDirect(contactTo, name, email, cleanSubject, message);
            return NextResponse.json({ status: 'mail_sent' });
        }

        const result = await sendViaCf7(name, email, cleanSubject, message);
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
