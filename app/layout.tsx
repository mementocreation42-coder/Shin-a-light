import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preload" href="/images/hero_poster.png" as="image" />
      </head>
      <body className={jetbrainsMono.variable}>
        <Nav />
        <main>{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "DAISUKE KOBAYASHI",
              "url": "https://www.shinealight.jp",
              "sameAs": [
                // "https://twitter.com/yourhandle",
                // "https://www.instagram.com/yourhandle"
              ],
              "jobTitle": "Video Creator / Photographer / Writer",
              "worksFor": {
                "@type": "Organization",
                "name": "Shine a Light",
                "url": "https://www.shinealight.jp"
              }
            }),
          }}
        />
      </body>
    </html>
  );
}
