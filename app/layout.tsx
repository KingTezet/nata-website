import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "NATA — Digital Products & Practical Solutions",
  description: siteConfig.description,
  applicationName: "NATA",
  openGraph: {
    type: "website",
    siteName: "NATA",
    locale: "id_ID",
    title: "NATA — Digital Products & Practical Solutions",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: "NATA — Digital Products & Practical Solutions",
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Lewati ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
