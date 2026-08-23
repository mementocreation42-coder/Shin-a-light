'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SKILL_GROUPS } from '@/data/skills';

/** /pro 配下ではヘッダーと同じ Pro カテゴリの列に入れ替える */
const PRO_FOOTER_GROUPS = [
    {
        label: '映像・写真',
        href: '/pro/visual',
        items: ['年間の視覚設計', '定期撮影', '映像のシリーズ化', '写真アーカイブ'],
    },
    {
        label: 'システム開発',
        href: '/pro/systems',
        items: ['業務の自動化', '巡回・通知', '数字の見える化', 'AIアシスタント'],
    },
    {
        label: '補助金',
        href: '/pro/hojokin',
        items: ['国の補助金', '徳島県の補助金', '町の補助金', '使い方の流れ'],
    },
    {
        label: '考え方',
        href: '/pro/approach',
        items: ['企画書をそのまま公開', '受け皿から逆算する'],
    },
    {
        label: '相談する',
        href: '/pro/contact',
        items: ['相談する（無料）', 'まだ形がなくてOK'],
    },
];

export default function Footer() {
    const pathname = usePathname();
    const isPro = pathname?.startsWith('/pro');

    return (
        <footer className="footer">
            {isPro ? (
                <div className="footer-skills">
                    {PRO_FOOTER_GROUPS.map((group) => (
                        <div key={group.href} className="footer-skill-group">
                            <h3 className="footer-skill-head">
                                <Link href={group.href}>{group.label}</Link>
                            </h3>
                            <ul className="footer-skill-list">
                                {group.items.map((item) => (
                                    <li key={item} className="footer-skill-item">
                                        <Link href={group.href}>{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="footer-skills">
                    {SKILL_GROUPS.map((group) => (
                        <div key={group.label} className="footer-skill-group">
                            <h3 className="footer-skill-head">{group.label}</h3>
                            <ul className="footer-skill-list">
                                {group.items.map((item) => (
                                    <li key={item} className="footer-skill-item">{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            <div className="footer-links" style={{ marginBottom: "1.5rem" }}>
                <Link href="/terms">利用規約</Link>
                <Link href="/privacy">プライバシーポリシー</Link>
                <Link href="/legal">特定商取引法に基づく表記</Link>
            </div>

            <div className="footer-info" style={{ marginBottom: "1rem", fontSize: "0.85rem", opacity: 0.8 }} itemScope itemType="https://schema.org/LocalBusiness">
                <p itemProp="name" style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Shine a Light</p>
                <address itemProp="address" itemScope itemType="https://schema.org/PostalAddress" style={{ fontStyle: "normal", lineHeight: 1.6 }}>
                    <span itemProp="postalCode">〒775-0001</span><br />
                    <span itemProp="streetAddress">1465 Kochi</span>&nbsp;
                    <span itemProp="addressLocality">Mugi</span>&nbsp;
                    <span itemProp="addressRegion">Kaifu, Tokushima</span>
                </address>
                <p style={{ marginTop: "0.5rem" }}>徳島を拠点に全国へ映像・Web・AIクリエイティブ・ヘルスケアを提供</p>
            </div>

            <p className="footer-copy">
                © DAISUKE KOBAYASHI
                {/* 管理画面への導線。検索エンジンには辿らせない */}
                <Link href="/login" rel="nofollow" className="footer-admin-link">ログイン</Link>
            </p>
        </footer>
    );
}
