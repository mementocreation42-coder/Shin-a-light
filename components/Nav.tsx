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
    { label: 'Projects', href: '/#projects', anchor: 'projects' },
    { label: 'Works', href: '/#works', anchor: 'works' },
    { label: 'Journal', href: '/journal' },
    { label: 'Photos', href: '/photos' },
    { label: 'Podcast', href: '/podcast' },
    { label: 'Contact', href: '/#contact', anchor: 'contact' },
    { label: 'Newsletter', href: '/newsletter', className: 'nav-letter-tag' },
];

export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const close = () => setIsOpen(false);

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
                {LINKS.map((link) => (
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
                    {LINKS.map((link) => (
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
