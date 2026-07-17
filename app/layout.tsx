import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Noto_Sans_JP, Permanent_Marker, Orbitron, Righteous, Caveat } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FloatingNav from "@/components/FloatingNav";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
  preload: false,
});

const permanentMarker = Permanent_Marker({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans-jp",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.shinealight.jp';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "徳島発 映像・写真・Web・AIのクリエイティブプロデュース｜小林大介 - Shine a Light",
    template: "%s | Shine a Light",
  },
  description: "徳島を拠点に、映像・写真・ウェブ制作からAI活用、メディア構築までを一貫してプロデュースするクリエイター・小林大介。釣りなどアウトドア領域や、精密栄養学に基づくヘルスケア事業も展開。企画から発信まで、全国のプロジェクトに対応します。",
  keywords: [
    "徳島", "映像制作", "写真撮影", "ウェブ制作", "Web制作", "クリエイター",
    "クリエイティブプロデュース", "プロデュース", "メディア構築", "AI活用",
    "釣り", "ヘルスケア事業", "精密栄養学", "小林大介", "Shine a Light",
  ],
  openGraph: {
    title: "徳島発 映像・写真・Web・AIのクリエイティブプロデュース｜小林大介 - Shine a Light",
    description: "徳島を拠点に、映像・写真・ウェブ制作からAI活用、メディア構築までを一貫してプロデュース。釣りなどアウトドア領域や、精密栄養学に基づくヘルスケア事業も展開する小林大介のクリエイティブ。",
    url: SITE_URL,
    siteName: "Shine a Light",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "徳島発 映像・写真・Web・AIのクリエイティブプロデュース｜小林大介",
    description: "映像・写真・ウェブ制作・AI・メディア構築を一貫してプロデュース。釣り・精密栄養学によるヘルスケア事業も。徳島を拠点に全国のプロジェクトへ。",
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
  const isChromeless = false;
  // Chronicle is a fullscreen immersive page with a fixed dashboard panel;
  // the global footer and floating nav would be covered by / overlap the panel.
  const isChronicle = pathname.startsWith('/chronicle');

  return (
    <html lang="ja">
      <head>
        <link rel="preload" href="/images/hero_poster.jpg" as="image" />
      </head>
      <body className={`${jetbrainsMono.variable} ${notoSansJP.variable} ${permanentMarker.variable} ${orbitron.variable} ${righteous.variable} ${caveat.variable}`}>
        {!isAdmin && !isChromeless && <Nav />}
        <main>{children}</main>
        {!isAdmin && !isChromeless && !isChronicle && <Footer />}
        {!isAdmin && !isChromeless && !isChronicle && <FloatingNav />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Shine a Light",
              "alternateName": "SAL",
              "url": "https://www.shinealight.jp",
              "inLanguage": "ja-JP",
              "publisher": {
                "@type": "Person",
                "name": "DAISUKE KOBAYASHI",
                "url": "https://www.shinealight.jp"
              }
            }),
          }}
        />
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
                "https://note.com/elvin",
                "https://www.youtube.com/@sal-flims",
                "https://www.instagram.com/enigamid/",
                "https://tsurihack.com/author/enigamid",
                "https://open.spotify.com/show/3g1Jexgm6ZWa1XYTFLGIxo"
              ],
              "jobTitle": "クリエイティブプロデューサー / 映像作家 / フォトグラファー / Webエンジニア / ヘルスケア事業家",
              "knowsAbout": [
                "クリエイティブプロデュース",
                "映像制作",
                "写真撮影",
                "ウェブ制作",
                "フロントエンド実装",
                "AIワークフロー構築",
                "メディア構築",
                "釣り",
                "ヘルスケア事業",
                "精密栄養学",
                "血液検査データ解析",
                "執筆"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Mugi Kaifu",
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
                  "addressLocality": "Mugi Kaifu",
                  "addressRegion": "Tokushima",
                  "postalCode": "775-0001",
                  "streetAddress": "1465 Kochi",
                  "addressCountry": "JP"
                }
              }
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "Shine a Light",
              "description": "徳島を拠点に、映像・写真・ウェブ制作からAI活用、メディア構築、精密栄養学に基づくヘルスケア事業までを手がけるクリエイティブスタジオ。",
              "url": "https://www.shinealight.jp",
              "image": "https://www.shinealight.jp/images/hero_poster.jpg",
              "founder": {
                "@type": "Person",
                "name": "DAISUKE KOBAYASHI",
                "alternateName": "小林大介"
              },
              "areaServed": [
                { "@type": "AdministrativeArea", "name": "徳島県" },
                { "@type": "Country", "name": "日本" }
              ],
              "knowsAbout": [
                "映像制作", "写真撮影", "ウェブ制作", "クリエイティブプロデュース",
                "メディア構築", "AIワークフロー構築", "精密栄養学", "ヘルスケア事業"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "牟岐町",
                "addressRegion": "徳島県",
                "postalCode": "775-0001",
                "streetAddress": "河内1465",
                "addressCountry": "JP"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 33.6647,
                "longitude": 134.4225
              }
            }),
          }}
        />
      </body>
    </html>
  );
}
