import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { loadGallery } from '@/lib/gallery';

export async function POST(request: NextRequest) {
  const { token, photoId } = (await request.json().catch(() => ({}))) as { token?: string; photoId?: string };
  if (!token) return NextResponse.json({ error: 'token is required' }, { status: 400 });
  const g = await loadGallery(token);
  if (!g) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
  const photo = photoId ? g.photos.find((p) => p.id === photoId) : null;
  if (photoId && !photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('sk_test_XXX')) {
    return NextResponse.json({ error: 'Card payment is not enabled yet. Please pay in person or by PayPal and I will unlock the originals.' }, { status: 503 });
  }
  const stripe = new Stripe(key, { apiVersion: '2026-01-28.clover' });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.shinealight.jp';
  const amount = (photo ? g.price.single : g.price.all) * 100;
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      quantity: 1,
      price_data: {
        currency: g.price.currency,
        unit_amount: amount,
        product_data: {
          name: photo ? `Original photo #${photo.id} — ${g.title}` : `All originals (${g.photos.length} photos) — ${g.title}`,
          description: `${g.place}, ${g.date}. Uncompressed originals: 10-bit AVIF (Display P3) + full-size JPEG. ${g.credit}`,
        },
      },
    }],
    success_url: `${baseUrl}/g/${g.token}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/g/${g.token}`,
    metadata: { gallery: g.token, scope: photo ? photo.id : 'all' },
  });
  return NextResponse.json({ url: session.url });
}
