import type { Metadata } from 'next';
import Link from 'next/link';
import EnterForm from './EnterForm';
import './[token]/gallery.css';

export const metadata: Metadata = {
  title: 'MEMENTO お渡しページ — Shine a Light',
  robots: { index: false, follow: false },
};

/**
 * 撮ってあげた人が写真を受け取る入口。
 * 撮影後にお渡しするコード（ギャラリーの token）を入れると /g/<token> へ進む。
 */
export default function GalleryEntryPage() {
  return (
    <main className="g-page g-entry">
      <header className="g-head">
        <p className="g-eyebrow">MEMENTO · Shine a Light</p>
        <h1>写真のお受け取り</h1>
        <p className="g-sub">Your photos from the session</p>
        <p className="g-note">
          撮影後にお渡ししたアクセスコードを入力してください。
          ウェブサイズの写真は無料でお持ち帰りいただけます。気に入った一枚があれば、圧縮していない原本も購入できます。
        </p>
        <p className="g-jp">
          Enter the access code you received after the shoot. Web-size photos are free to keep; uncompressed originals are available for purchase.
        </p>
      </header>
      <EnterForm />
      <p className="g-foot">
        コードをなくした場合は <Link href="/#contact">Contact</Link> からご連絡ください。<br />
        出張写真〈MEMENTO〉については <Link href="/photos">Photos</Link> をご覧ください。
      </p>
    </main>
  );
}
