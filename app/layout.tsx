import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_JP, Permanent_Marker, Orbitron } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans-jp",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.shinealight.jp';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Shine a Light | DAISUKE KOBAYASHIのポートフォリオサイト",
    template: "%s | Shine a Light",
  },
  description: "ビデオグラファー・Webエンジニア｜小林大介。映像、写真、Web、そしてAI。領域を横断するクリエイティブで、ビジネスや表現の可能性を広げます。徳島を拠点に全国のプロジェクトに対応。",
  openGraph: {
    title: "Shine a Light | DAISUKE KOBAYASHIのポートフォリオサイト",
    description: "ビデオグラファー・Webエンジニア｜小林大介。映像、写真、Web、そしてAI。領域を横断するクリエイティブで、ビジネスや表現の可能性を広げます。徳島を拠点に全国のプロジェクトに対応。",
    url: SITE_URL,
    siteName: "Shine a Light",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/images/profile.jpg",
        width: 587,
        height: 587,
        alt: "Shine a Light - DAISUKE KOBAYASHI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shine a Light - DAISUKE KOBAYASHI",
    description: "Portfolio of DAISUKE KOBAYASHI - Video Creator / Videographer / Photographer / Writer",
    images: ["/images/profile.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdmin = pathname.startsWith('/admin') || pathname === '/login';
  const isChromeless = pathname === '/universe' || pathname.startsWith('/universe/');

  return (
    <html lang="ja">
      <head>
        <link rel="preload" href="/images/hero_poster.png" as="image" />
      </head>
      <body className={`${jetbrainsMono.variable} ${notoSansJP.variable} ${permanentMarker.variable} ${orbitron.variable}`}>
        {!isAdmin && !isChromeless && <Nav />}
        <main>{children}</main>
        {!isAdmin && !isChromeless && <Footer />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "DAISUKE KOBAYASHI",
              "alternateName": "小林大介",
              "url": "https://www.shinealight.jp",
              "sameAs": [
                // "https://twitter.com/yourhandle",
                // "https://www.instagram.com/yourhandle"
              ],
              "jobTitle": "Video Creator / Photographer / Writer / Web Engineer",
              "knowsAbout": [
                "精密栄養学",
                "血液検査データ解析",
                "映像制作",
                "Web制作",
                "フロントエンド実装",
                "AIワークフロー構築",
                "写真撮影",
                "執筆"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Mugi, Kaifu District",
                "addressRegion": "Tokushima",
                "postalCode": "775-0001",
                "streetAddress": "1465 Kouchi",
                "addressCountry": "JP"
              },
              "worksFor": {
                "@type": "Organization",
                "name": "Shine a Light",
                "url": "https://www.shinealight.jp",
                "areaServed": "JP",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "海部郡牟岐町",
                  "addressRegion": "徳島県",
                  "postalCode": "775-0001",
                  "streetAddress": "大字河内1465",
                  "addressCountry": "JP"
                }
              }
            }),
          }}
        />
      </body>
    </html>
  );
}
