import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2026-01-28.clover',
});

export async function POST(request: NextRequest) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email;
        const metadata = session.metadata;

        if (customerEmail && metadata?.downloadPath) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const downloadUrl = `${baseUrl}${metadata.downloadPath}`;

            try {
                // Send email with download link via Resend
                const resendApiKey = process.env.RESEND_API_KEY;
                if (resendApiKey && !resendApiKey.startsWith('re_XXX')) {
                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${resendApiKey}`,
                        },
                        body: JSON.stringify({
                            from: 'Shine a Light Shop <shop@shinealight.jp>',
                            to: customerEmail,
                            subject: `ご購入ありがとうございます - ${metadata.productName}`,
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                    <h1 style="font-size: 24px; margin-bottom: 8px;">ご購入ありがとうございます</h1>
                                    <p style="color: #666; margin-bottom: 32px;">Shine a Light Shop をご利用いただきありがとうございます。</p>
                                    
                                    <div style="background: #f5f5f5; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
                                        <p style="margin: 0 0 8px 0; font-weight: bold;">${metadata.productName}</p>
                                        <p style="margin: 0; color: #666;">以下のリンクからダウンロードしてください：</p>
                                    </div>
                                    
                                    <a href="${downloadUrl}" 
                                       style="display: inline-block; background: #ff764d; color: white; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                                        Download
                                    </a>
                                    
                                    <p style="color: #999; font-size: 12px; margin-top: 40px;">
                                        ※ このリンクは購入者様専用です。第三者への共有はお控えください。<br>
                                        ご不明な点がございましたら info@shinealight.jp までご連絡ください。
                                    </p>
                                </div>
                            `,
                        }),
                    });
                    console.log(`Download email sent to ${customerEmail}`);
                } else {
                    console.log(`[DEV] Would send email to ${customerEmail} with download: ${downloadUrl}`);
                }
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
            }
        }
    }

    return NextResponse.json({ received: true });
}
