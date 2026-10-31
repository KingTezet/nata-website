import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CodeHero } from "@/components/code/CodeHero";
import { Marketplace } from "@/components/code/Marketplace";
import { HowItWorks } from "@/components/code/HowItWorks";
import { PriceFactors } from "@/components/code/PriceFactors";
import { Faq } from "@/components/code/Faq";
import { OrderWizard } from "@/components/forms/OrderWizard";
import { codeConfig } from "@/config/site";

export const metadata: Metadata = {
  title: codeConfig.title,
  description: codeConfig.description,
  alternates: { canonical: "/code" },
  openGraph: { title: codeConfig.title, description: codeConfig.description, url: "/code" },
  twitter: { card: "summary", title: codeConfig.title, description: codeConfig.description },
};

export default function CodePage() {
  return (
    <>
      <Navbar variant="code" />
      <main id="main">
        <CodeHero />
        <Marketplace />
        <HowItWorks />
        <PriceFactors />
        <OrderWizard />
        <Faq />
      </main>
      <Footer variant="code" />
    </>
  );
}
