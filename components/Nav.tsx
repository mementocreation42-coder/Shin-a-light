'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const close = () => setIsOpen(false);

    return (
        <nav className="nav">
            <Link href="/" className="nav-logo" onClick={close}>
                SAL
            </Link>

            {/* Desktop links */}
            <ul className="nav-links">
                <li><Link href="/#about">About</Link></li>
                <li><Link href="/#works">Works</Link></li>
                <li><Link href="/journal">Journal</Link></li>
                <li><Link href="/store">Store</Link></li>
                <li><Link href="/#contact">Contact</Link></li>
                <li><Link href="/newsletter" className="nav-letter-tag">Letter</Link></li>
            </ul>

            {/* Hamburger button */}
            <button
                className={`nav-hamburger ${isOpen ? 'is-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="メニューを開く"
            >
                <span />
                <span />
                <span />
            </button>

            {/* Mobile menu */}
            <div className={`nav-mobile ${isOpen ? 'is-open' : ''}`}>
                <ul className="nav-mobile-links">
                    <li><Link href="/#about" onClick={close}>About</Link></li>
                    <li><Link href="/#works" onClick={close}>Works</Link></li>
                    <li><Link href="/journal" onClick={close}>Journal</Link></li>
                    <li><Link href="/store" onClick={close}>Store</Link></li>
                    <li><Link href="/#contact" onClick={close}>Contact</Link></li>
                    <li><Link href="/newsletter" className="nav-letter-tag" onClick={close}>Letter</Link></li>
                </ul>
            </div>
        </nav>
    );
}
