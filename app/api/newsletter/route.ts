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

        // TODO: ここにResend / Beehiiv等のAPI連携を追加
        // 例) Resend Audiences:
        // await resend.contacts.create({ email, audienceId: process.env.RESEND_AUDIENCE_ID });
        //
        // 例) Beehiiv:
        // await fetch(`https://api.beehiiv.com/v2/publications/${id}/subscriptions`, {
        //     method: 'POST',
        //     headers: { Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}` },
        //     body: JSON.stringify({ email }),
        // });

        console.log('[Newsletter] New subscriber:', email);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Newsletter] Error:', error);
        return NextResponse.json(
            { error: 'サーバーエラーが発生しました。' },
            { status: 500 }
        );
    }
}
