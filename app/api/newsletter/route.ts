import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import { registerSubscriber, isValidEmail } from '@/lib/newsletter';
import { renderConfirmEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/mailer';

/**
 * 購読登録。
 *
 * 名簿の正は自前の DB（subscribers テーブル）。
 * ただし DATABASE_URL が無い環境（DB移行前の本番）では、従来どおり
 * スプレッドシート(GAS)に書いて受け付ける。どこにも残らないまま
 * 成功を返すのが最悪なので、GAS も無ければエラーにする。
 * DB を繋いだ環境では GAS には書かない。過去のスプレッドシートの分は
 * scripts/import-subscribers.mjs で手作業で取り込む。
 */

/** 登録元のパスだけを残す。クエリ文字列は個人情報が混ざりうるので捨てる */
function sourcePath(referer: string | null): string | undefined {
    if (!referer) return undefined;
    try {
        return new URL(referer).pathname;
    } catch {
        return undefined;
    }
}

export async function POST(req: NextRequest) {
    let email: string;
    try {
        ({ email } = await req.json());
    } catch {
        return NextResponse.json({ error: 'リクエストの形式が不正です。' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
        return NextResponse.json(
            { error: '有効なメールアドレスを入力してください。' },
            { status: 400 }
        );
    }

    // ユーザーの実IPを取得（Vercel環境）
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        req.headers.get('x-real-ip') ??
        '127.0.0.1';
    const referer = req.headers.get('referer') ?? 'https://www.shinealight.jp/newsletter';

    if (!isDbConfigured()) {
        // DB 移行前の環境。従来どおり GAS(スプレッドシート)に残す。
        // 確認メールは送れないので doubleOptIn: false を返し、
        // フォームは従来の完了文言を出す。
        const gasUrl = process.env.GAS_WEBHOOK_URL;
        if (!gasUrl) {
            console.error('[Newsletter] Neither DATABASE_URL nor GAS_WEBHOOK_URL is set');
            return NextResponse.json(
                { error: '現在登録を受け付けられません。しばらくしてからお試しください。' },
                { status: 503 }
            );
        }
        try {
            const gasRes = await fetch(gasUrl, {
                method: 'POST',
                redirect: 'follow',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, referer, ip_address: ip }),
            });
            if (!gasRes.ok) throw new Error(`GAS responded with ${gasRes.status}`);
        } catch (error) {
            console.error('[Newsletter] GAS write failed:', error);
            return NextResponse.json(
                { error: '送信に失敗しました。しばらくしてからお試しください。' },
                { status: 500 }
            );
        }
        console.log('[Newsletter] Registered via GAS:', email);
        return NextResponse.json({ success: true, doubleOptIn: false });
    }

    let confirmToken: string | null;
    try {
        ({ confirmToken } = await registerSubscriber({
            email,
            source: sourcePath(referer),
            ipAddress: ip,
            userAgent: req.headers.get('user-agent') ?? undefined,
        }));
    } catch (error) {
        console.error('[Newsletter] DB write failed:', error);
        return NextResponse.json(
            { error: '送信に失敗しました。しばらくしてからお試しください。' },
            { status: 500 }
        );
    }

    // トークンが返るのは確認メールを送るべきときだけ。
    // 購読中のアドレスや、直前に送ったばかりの再送信では null になる。
    if (confirmToken) {
        const origin = process.env.SITE_URL ?? req.nextUrl.origin;
        const mail = renderConfirmEmail(
            `${origin}/newsletter/confirm?token=${encodeURIComponent(confirmToken)}`
        );
        try {
            await sendEmail({
                to: email,
                subject: '【Shine a Light】登録の確認をお願いします',
                html: mail.html,
                text: mail.text,
            });
        } catch (error) {
            // 名簿には pending で残っているので、あとから再送信できる。
            // ここで 500 を返すと利用者が何度も登録し直すことになるため飲み込む。
            console.error('[Newsletter] confirm mail failed:', error);
        }
    }

    // 登録済みだったかどうかは返さない。他人のアドレスの登録状況を
    // 調べられてしまうため、いずれの場合も同じ応答にする。
    // doubleOptIn は「確認メールの仕組みが動いているか」であり、
    // 個別の登録状況ではないので返してよい。フォームの完了文言の切り替えに使う。
    console.log('[Newsletter] Registered:', email);
    return NextResponse.json({ success: true, doubleOptIn: true });
}
