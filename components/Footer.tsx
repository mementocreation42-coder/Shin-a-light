import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-links" style={{ marginBottom: "1.5rem" }}>
                <Link href="/terms">利用規約</Link>
                <Link href="/privacy">プライバシーポリシー</Link>
                {/* <Link href="/legal">特定商取引法に基づく表記</Link> */}
            </div>

            <div className="footer-info" style={{ marginBottom: "1rem", fontSize: "0.85rem", opacity: 0.8 }} itemScope itemType="https://schema.org/LocalBusiness">
                <p itemProp="name" style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Shine a Light</p>
                <address itemProp="address" itemScope itemType="https://schema.org/PostalAddress" style={{ fontStyle: "normal", lineHeight: 1.6 }}>
                    <span itemProp="postalCode">〒775-0001</span><br />
                    <span itemProp="addressRegion">徳島県</span>
                    <span itemProp="addressLocality">海部郡牟岐町</span>
                    <span itemProp="streetAddress">大字河内1465</span>
                </address>
                <p style={{ marginTop: "0.5rem" }}>徳島を拠点に全国へ映像・Web・AIクリエイティブを提供</p>
            </div>

            <p>© DAISUKE KOBAYASHI</p>
        </footer>
    );
}
