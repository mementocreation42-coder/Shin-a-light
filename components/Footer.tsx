import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-links">
                <Link href="/terms">利用規約</Link>
                <Link href="/privacy">プライバシーポリシー</Link>
                <Link href="/legal">特定商取引法に基づく表記</Link>
            </div>
            <p>Shine a Light</p>
            <p>© DAISUKE KOBAYASHI</p>
        </footer>
    );
}
