import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shine a Light - DAISUKE KOBAYASHI",
  description: "Portfolio of DAISUKE KOBAYASHI - Video Creator / Videographer / Photographer / Writer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={jetbrainsMono.variable}>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
