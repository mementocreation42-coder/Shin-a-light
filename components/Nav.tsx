'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

type NavLink = {
    label: string;
    href: string;
    /** section id for same-page anchor links */
    anchor?: string;
    className?: string;
};

const LINKS: NavLink[] = [
    { label: 'Journal', href: '/journal' },
    { label: 'Photos', href: '/photos' },
    { label: 'Videos', href: '/videos' },
    { label: 'Podcast', href: '/podcast' },
    { label: 'Contact', href: '/#contact', anchor: 'contact' },
    { label: 'Newsletter', href: '/newsletter', className: 'nav-letter-tag' },
    { label: 'for Pro', href: '/pro', className: 'nav-pro-tag' },
];

/** /pro 配下（B面）ではナビを Pro のカテゴリに切り替える */
const PRO_LINKS: NavLink[] = [
    { label: '映像・写真', href: '/pro/visual' },
    { label: 'システム開発', href: '/pro/systems' },
    { label: '補助金', href: '/pro/hojokin' },
    { label: '考え方', href: '/pro/approach' },
    { label: '相談する', href: '/pro/contact', className: 'nav-letter-tag' },
    { label: 'for Personal', href: '/', className: 'nav-pro-tag' },
];

export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const close = () => setIsOpen(false);
    const links = pathname?.startsWith('/pro') ? PRO_LINKS : LINKS;

    // On the home page, scroll to the section directly so anchor links keep
    // working even when the URL hash already matches the target (Next.js Link
    // does not re-scroll in that case).
    const handleClick = (e: React.MouseEvent, link: NavLink) => {
        close();
        if (link.anchor && pathname === '/') {
            const el = document.getElementById(link.anchor);
            if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
                window.history.replaceState(null, '', link.href);
            }
        }
    };

    return (
        <nav className="nav">
            <Link href="/" className="nav-logo" onClick={close}>
                SAL
            </Link>

            {/* Desktop links */}
            <ul className="nav-links">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className={link.className}
                            onClick={(e) => handleClick(e, link)}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
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
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={link.className}
                                onClick={(e) => handleClick(e, link)}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
