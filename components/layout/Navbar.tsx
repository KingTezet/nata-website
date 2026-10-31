"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string };

const variants = {
  home: {
    links: [
      { label: "Produk", href: "/#products" },
      { label: "NATAcode", href: "/code" },
      { label: "Tentang", href: "/#about" },
    ] as NavLink[],
    cta: { label: "Butuh bantuan tugas?", href: "/code" },
  },
  code: {
    links: [
      { label: "Home", href: "/" },
      { label: "Layanan", href: "#services" },
      { label: "Cara kerja", href: "#how" },
      { label: "Harga", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ] as NavLink[],
    cta: { label: "Mulai pesan", href: "#order" },
  },
};

export function Navbar({ variant }: { variant: "home" | "code" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { links, cta } = variants[variant];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300",
        scrolled || open ? "border-line bg-white/80" : "border-transparent bg-white/60",
      )}
    >
      <nav aria-label="Navigasi utama" className="container-x flex h-14 items-center justify-between md:h-16">
        <Link href={variant === "code" ? "/code" : "/"} className="flex items-baseline gap-2 py-2" aria-label={variant === "code" ? "NATAcode — A service by NATA" : "NATA — Beranda"}>
          <span className="text-xl font-semibold tracking-tight">NATA.</span>
          {variant === "code" && (
            <span className="text-sm font-medium tracking-wide text-subtle">/ CODE</span>
          )}
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="inline-flex min-h-10 items-center rounded-full px-3.5 text-sm text-subtle transition-colors hover:text-fg"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ButtonLink href={cta.href} className="min-h-10 px-5 text-sm">
              {cta.label}
            </ButtonLink>
          </div>
          <button
            type="button"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted md:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="animate-pop-in border-t border-line bg-white/95 backdrop-blur-xl md:hidden"
      >
        <div className="container-x pt-2 pb-5">
          <ul>
            {links.map((l) => (
              <li key={l.href} className="border-b border-line/70 last:border-0">
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center text-xl font-medium tracking-tight"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <ButtonLink href={cta.href} onClick={() => setOpen(false)} className="mt-4 w-full">
            {cta.label}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
