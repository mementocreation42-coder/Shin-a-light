import Link from 'next/link';

export default function Nav() {
    return (
        <nav className="nav">
            <Link href="/" className="nav-logo">
                SaL
            </Link>
            <ul className="nav-links">
                <li><Link href="/#about">About</Link></li>
                <li><Link href="/journal">Journal</Link></li>
                {/* <li><Link href="/lab">Lab</Link></li> */}
                <li><Link href="/#works">Works</Link></li>
                <li><Link href="/#contact">Contact</Link></li>
            </ul>
        </nav>
    );
}
