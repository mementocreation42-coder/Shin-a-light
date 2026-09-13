import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Stripe from 'stripe';
import { loadGallery, type Gallery } from '@/lib/gallery';
import BuyOriginal from '@/components/gallery/BuyOriginal';
import './gallery.css';

interface Props { params: Promise<{ token: string }>; searchParams: Promise<{ session_id?: string; unlock?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = await loadGallery((await params).token);
  return { title: g ? `${g.title} — Shine a Light` : 'Gallery', robots: { index: false, follow: false } };
}

/** 何が解放されているか: 'all' | 写真 id の集合 */
async function unlocked(g: Gallery, sp: { session_id?: string; unlock?: string }): Promise<Set<string> | 'all'> {
  if (g.free) return 'all';
  if (sp.unlock && sp.unlock === g.unlockKey) return 'all';
  if (sp.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-01-28.clover' });
      const s = await stripe.checkout.sessions.retrieve(sp.session_id);
      if (s.payment_status === 'paid' && s.metadata?.gallery === g.token) {
        return s.metadata.scope === 'all' ? 'all' : new Set([s.metadata.scope ?? '']);
      }
    } catch { /* 無効なセッションは未解放扱い */ }
  }
  return new Set();
}

export default async function GalleryPage({ params, searchParams }: Props) {
  const g = await loadGallery((await params).token);
  if (!g) notFound();
  const sp = await searchParams;
  const open = await unlocked(g, sp);
  const isOpen = (id: string) => open === 'all' || open.has(id);
  const anyOpen = open === 'all' || open.size > 0;

  return (
    <main className="g-page">
      <header className="g-head">
        <p className="g-eyebrow">Shine a Light · Tokushima, Japan</p>
        <h1>{g.title}</h1>
        <p className="g-sub">{g.place} · {g.date} · {g.photos.length} photos</p>
        {g.free ? (
          <>
            <p className="g-note g-ok">These photos are a gift — everything is free to download, originals included: 10-bit AVIF (Display P3) and full-size JPEG, nothing compressed.</p>
            <p className="g-jp">この写真は無料でお渡しします。ウェブサイズも原本も、そのままダウンロードしてください。</p>
          </>
        ) : anyOpen ? (
          <p className="g-note g-ok">Thank you. Your originals are unlocked below — 10-bit AVIF (Display P3) and full-size JPEG, nothing compressed.</p>
        ) : (
          <>
            <p className="g-note">
              The web-size versions are yours to keep, free. If you like a photo, you can get the <b>uncompressed original</b>:
              10-bit AVIF in Display P3 plus a full-size JPEG — the file straight out of my develop, not a social-media copy.
            </p>
            <p className="g-price">
              <BuyOriginal token={g.token} label={`Get all ${g.photos.length} originals · US$${g.price.all}`} />
              <span className="g-or">or US${g.price.single} per photo below</span>
            </p>
            <p className="g-jp">気に入った写真があれば、圧縮していない原本を購入できます。ウェブサイズは無料でお持ち帰りください。</p>
          </>
        )}
      </header>

      <section className="g-grid">
        {g.photos.map((p) => (
          <figure key={p.id} className="g-item">
            <picture>
              <source type="image/avif" srcSet={p.preview.avif} />
              {/* 原本の色を保つため next/image は通さない */}
              <img src={p.preview.jpg} alt={`${g.title} ${p.id}`} width={p.preview.w} height={p.preview.h} loading="lazy" decoding="async" />
            </picture>
            <figcaption>
              <span className="g-id">#{p.id}</span>
              <a className="g-free" href={p.preview.jpg} download>Save web size (free)</a>
              {isOpen(p.id) ? (
                <span className="g-orig">
                  <a href={p.orig.avif} download>Original AVIF</a>
                  <a href={p.orig.jpg} download>Original JPEG {p.orig.w}×{p.orig.h}</a>
                </span>
              ) : (
                <BuyOriginal token={g.token} photoId={p.id} label={`Original · US$${g.price.single}`} className="g-buywrap" />
              )}
            </figcaption>
          </figure>
        ))}
      </section>

      <footer className="g-foot">
        <p>{g.credit}. Please credit when you share. Questions: info@shinealight.jp</p>
        {!g.free && <p>Paid in person or by PayPal? I will send you an unlock link.</p>}
      </footer>
    </main>
  );
}
