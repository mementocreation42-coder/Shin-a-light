'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function AuthorStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      setStuck(rect.top <= 12);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className={`journal-article-author-strip${stuck ? ' journal-article-author-strip--stuck' : ''}`}
    >
      <img src="/images/profile.jpg" alt="DAISUKE KOBAYASHI" className="journal-article-author-avatar" />
      <div className="journal-article-author-text">
        <span className="journal-article-author-name">DAISUKE KOBAYASHI</span>
        <span className="journal-article-author-bio">映像・写真・Web・AI・健康 / 徳島</span>
      </div>
      <Link href="/#about" className="journal-article-author-link">About →</Link>
    </div>
  );
}
