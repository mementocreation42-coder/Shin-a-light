import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: '有効なメールアドレスを入力してください。' },
                { status: 400 }
            );
        }

        const gasUrl = process.env.GAS_WEBHOOK_URL;
        if (!gasUrl) {
            console.error('[Newsletter] GAS_WEBHOOK_URL is not set');
            return NextResponse.json(
                { error: 'サーバー設定エラーです。' },
                { status: 500 }
            );
        }

        // ユーザーの実IPを取得（Vercel環境）
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
            req.headers.get('x-real-ip') ??
            '127.0.0.1';

        // GAS Web App に POST（リダイレクトを自動追跡）
        const gasRes = await fetch(gasUrl, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                referer: req.headers.get('referer') ?? 'https://www.shinealight.jp/newsletter',
                ip_address: ip,
            }),
        });

        if (!gasRes.ok) {
            throw new Error(`GAS responded with ${gasRes.status}`);
        }

        console.log('[Newsletter] Registered:', email);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Newsletter] Error:', error);
        return NextResponse.json(
            { error: '送信に失敗しました。しばらくしてからお試しください。' },
            { status: 500 }
        );
    }
}
