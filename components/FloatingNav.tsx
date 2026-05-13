'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function FloatingNav() {
  const pathname = usePathname();
  const isJournalArticle = /^\/journal\/\d+/.test(pathname);
  const [visible, setVisible] = useState(false);
  const footerRef = useRef<IntersectionObserver | null>(null);
  const footerVisible = useRef(false);

  useEffect(() => {
    // ヘッダーの高さを取得して「ヘッダーが消えた」判定に使う
    const nav = document.querySelector('.nav') as HTMLElement | null;
    const navHeight = nav?.offsetHeight ?? 64;

    const onScroll = () => {
      const scrolled = window.scrollY > navHeight;
      setVisible(scrolled && !footerVisible.current);
    };

    // フッターが見えたら消す
    const footer = document.querySelector('footer');
    if (footer) {
      footerRef.current = new IntersectionObserver(
        ([entry]) => {
          footerVisible.current = entry.isIntersecting;
          setVisible(!entry.isIntersecting && window.scrollY > navHeight);
        },
        { threshold: 0.05 }
      );
      footerRef.current.observe(footer);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      footerRef.current?.disconnect();
    };
  }, []);

  if (isJournalArticle) return null;

  return (
    <div className={`floating-nav ${visible ? 'floating-nav--visible' : ''}`} aria-hidden={!visible}>
      <Link href="/journal" className="floating-nav__link">
        Journal
      </Link>
      <span className="floating-nav__divider" />
      <Link href="/universe" className="floating-nav__link">
        Universe
      </Link>
      <span className="floating-nav__divider" />
      <Link href="/newsletter" className="floating-nav__link floating-nav__link--accent">
        Newsletter
      </Link>
    </div>
  );
}
