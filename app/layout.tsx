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
    default: "Shine a Light - DAISUKE KOBAYASHI",
    template: "%s | Shine a Light",
  },
  description: "Portfolio of DAISUKE KOBAYASHI - Video Creator / Videographer / Photographer / Writer",
  openGraph: {
    title: "Shine a Light - DAISUKE KOBAYASHI",
    description: "Portfolio of DAISUKE KOBAYASHI - Video Creator / Videographer / Photographer / Writer",
    url: SITE_URL,
    siteName: "Shine a Light",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/images/hero_poster.png",
        width: 1200,
        height: 630,
        alt: "Shine a Light - DAISUKE KOBAYASHI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shine a Light - DAISUKE KOBAYASHI",
    description: "Portfolio of DAISUKE KOBAYASHI - Video Creator / Videographer / Photographer / Writer",
    images: ["/images/hero_poster.png"],
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
      </body>
    </html>
  );
}
