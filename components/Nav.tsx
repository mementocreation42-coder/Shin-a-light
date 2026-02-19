import Link from 'next/link';

export default function Nav() {
    return (
        <nav className="nav">
            <Link href="/" className="nav-logo">
                SaL
            </Link>
            <div className="nav-links">
                <Link href="/#about">About</Link>
                <Link href="/journal">Journal</Link>
                {/* <Link href="/lab">Lab</Link> */}
                <Link href="/#works">Works</Link>
                <Link href="/#contact">Contact</Link>
            </div>
        </nav>
    );
}
