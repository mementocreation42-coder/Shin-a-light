import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import About from "@/components/About";
import Works from "@/components/Works";
import Contact from "@/components/Contact";
import NewsletterCta from "@/components/NewsletterCta";
import { getSiteImages } from "@/lib/siteImages";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const img = await getSiteImages();
  return (
    <>
      <Hero />
      <Philosophy />
      <About profileSrc={img['about-profile']} />
      <Works />
      <Contact />
      <NewsletterCta />
    </>
  );
}
