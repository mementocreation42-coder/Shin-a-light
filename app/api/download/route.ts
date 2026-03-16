import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, productId } = body;

        if (!email || !productId) {
            return NextResponse.json({ error: 'Email and Product ID are required' }, { status: 400 });
        }

        // Validate basic email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // 1. Log to a local file (The lead pipeline)
        const fs = require('fs');
        const path = require('path');
        const logEntry = `${new Date().toISOString()},${email},${productId}\n`;
        const logPath = path.join(process.cwd(), 'data', 'leads.csv');

        try {
            // Ensure data directory exists
            const dataDir = path.join(process.cwd(), 'data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }
            fs.appendFileSync(logPath, logEntry);
        } catch (err) {
            console.error('Failed to log lead:', err);
        }

        console.log(`[DOWNLOAD CAPTURE] Successfully captured email: ${email} for product: ${productId}`);

        // 2. Send email with download link via Resend (The delivery pipeline)
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey && !resendApiKey.startsWith('re_XXX')) {
            // We need to look up the product to get the download path
            const { products } = require('@/data/products');
            const product = products.find((p: any) => p.id === productId);

            if (product && product.downloadPath) {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                const downloadUrl = `${baseUrl}${product.downloadPath}`;

                try {
                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${resendApiKey}`,
                        },
                        body: JSON.stringify({
                            from: 'Shine a Light <info@shinealight.jp>',
                            to: email,
                            subject: `ダウンロードリンクをお送りします - ${product.name}`,
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                    <h1 style="font-size: 24px; margin-bottom: 8px;">ダウンロードありがとうございます</h1>
                                    <p style="color: #666; margin-bottom: 32px;">${product.name} のダウンロードリンクをお送りします。</p>
                                    
                                    <div style="background: #f5f5f5; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
                                        <p style="margin: 0 0 8px 0; font-weight: bold;">${product.name}</p>
                                        <p style="margin: 0; color: #666;">以下のリンクをクリックしてファイルを保存してください：</p>
                                    </div>
                                    
                                    <a href="${downloadUrl}" 
                                       style="display: inline-block; background: #1e1e1e; color: white; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                                        Download Now
                                    </a>
                                    
                                    <p style="color: #999; font-size: 12px; margin-top: 40px;">
                                        Shine a Light のコンテンツをご活用いただければ幸いです。<br>
                                        ご不明な点がございましたら info@shinealight.jp までご連絡ください。
                                    </p>
                                </div>
                            `,
                        }),
                    });
                    console.log(`Free download email sent to ${email}`);
                } catch (emailError) {
                    console.error('Failed to send free download email:', emailError);
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Email recorded and delivery initiated' });
    } catch (error) {
        console.error('Error processing download request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
