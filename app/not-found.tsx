import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan — NATA",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar variant="home" />
      <main id="main" className="container-x flex min-h-[70svh] flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium tracking-[0.14em] text-subtle uppercase">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">Halaman tidak ditemukan.</h1>
        <p className="mt-4 max-w-md text-base text-subtle sm:text-lg">
          Link yang kamu buka tidak tersedia atau sudah dipindahkan.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/">Kembali ke Home</ButtonLink>
          <ButtonLink href="/code" variant="secondary">
            Lihat NATAcode
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
