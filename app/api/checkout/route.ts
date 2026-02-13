import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getProductById } from '@/data/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
});

export async function POST(request: NextRequest) {
    try {
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const product = getProductById(productId);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_XXX')) {
            return NextResponse.json(
                { error: 'Stripe is not configured yet. Please set STRIPE_SECRET_KEY in .env.local' },
                { status: 503 }
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: product.name,
                            description: product.description,
                        },
                        unit_amount: product.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${baseUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/shop/${product.id}`,
            customer_email: undefined, // Stripe will ask for email
            metadata: {
                productId: product.id,
                productName: product.name,
                downloadPath: product.downloadPath || '',
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
