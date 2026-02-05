import Link from 'next/link';

export default function Nav() {
    return (
        <nav className="nav">
            <Link href="/" className="nav-logo">
                Shine a Light
            </Link>
            <div className="nav-links">
                <Link href="/#about">About</Link>
                <Link href="/journal">Journal</Link>
                <Link href="/#works">Works</Link>
                <Link href="/#contact">Contact</Link>
            </div>
        </nav>
    );
}
