import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { LifeAreas } from "@/components/home/LifeAreas";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { CodeTeaser } from "@/components/home/CodeTeaser";
import { About } from "@/components/home/About";
import { listProducts } from "@/lib/store";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "NATA — Digital Products & Practical Solutions",
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: { title: "NATA — Digital Products & Practical Solutions", description: siteConfig.description, url: "/" },
};

/** Daftar produk dibaca dari store (Supabase / file) dan diperbarui otomatis. */
export const revalidate = 60;

export default async function HomePage() {
  const products = (await listProducts()).filter((p) => p.status !== "hidden");
  return (
    <>
      <Navbar variant="home" />
      <main id="main">
        <Hero />
        <LifeAreas />
        <ProductShowcase products={products} />
        <CodeTeaser />
        <About />
      </main>
      <Footer />
    </>
  );
}
