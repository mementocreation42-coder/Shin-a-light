'use client';

import { usePathname } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import FloatingNav from '@/components/FloatingNav';

/**
 * サイト共通クローム（ヘッダー・フッター・フローティングナビ）の出し分け。
 *
 * ルートレイアウトはクライアント遷移で再レンダリングされないため、
 * リクエストヘッダ（x-pathname）でサーバー判定すると「/admin から
 * トップへ遷移するとヘッダーが消えたまま」というバグになる。
 * usePathname はクライアント遷移にも追従するので、判定はここで行う。
 */
function isChromeless(pathname: string): boolean {
    return pathname.startsWith('/admin') || pathname === '/login';
}

export function SiteNav() {
    const pathname = usePathname() ?? '';
    if (isChromeless(pathname)) return null;
    return <Nav />;
}

export function SiteFooter() {
    const pathname = usePathname() ?? '';
    // Chronicle は全画面没入ページ。固定パネルと重なるため出さない
    if (isChromeless(pathname) || pathname.startsWith('/chronicle')) return null;
    return (
        <>
            <Footer />
            <FloatingNav />
        </>
    );
}
