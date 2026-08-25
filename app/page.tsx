import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import About from "@/components/About";
import Works from "@/components/Works";
import Contact from "@/components/Contact";
import NewsletterCta from "@/components/NewsletterCta";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Philosophy />
      <About />
      <Works />
      <Contact />
      <NewsletterCta />
    </>
  );
}
