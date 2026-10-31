"use client";

import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Icon, iconMap, type IconName } from "@/lib/icons";
import { STATUS_LABEL, type Product } from "@/lib/products";
import { SectionHeading } from "@/components/ui/Section";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const iconOf = (name: string): IconName => (name in iconMap ? (name as IconName) : "package");
const isLive = (p: Product) => p.status === "available" && Boolean(p.buyUrl);

function Visual({ p, className }: { p: Product; className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-muted", className)}>
      {p.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.imageUrl} alt={`Tampilan ${p.name}`} className="size-full object-cover" loading="lazy" />
      ) : (
        <div className="flex flex-col items-center gap-3" aria-hidden="true">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
            <Icon name={iconOf(p.icon)} className="size-7" />
          </span>
          <span className="text-sm font-medium tracking-tight text-subtle">{p.name}</span>
        </div>
      )}
    </div>
  );
}

function Status({ p }: { p: Product }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-subtle">
      <span className={cn("size-1.5 rounded-full", isLive(p) ? "bg-success" : "bg-subtle/50")} aria-hidden="true" />
      {isLive(p) ? "Tersedia" : STATUS_LABEL.comingSoon}
    </span>
  );
}

export function ProductShowcase({ products }: { products: Product[] }) {
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState<Product | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const list = cat === "all" ? products : products.filter((p) => p.category === cat);

  const show = (p: Product) => {
    setOpen(p);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  };
  const close = () => dialogRef.current?.close();

  return (
    <section id="products" className="section-y pt-4!">
      <div className="container-x">
        <SectionHeading
          eyebrow="Produk NATA"
          title="Semua yang menata hidup, di satu tempat."
          description="Daftar ini akan terus bertambah. Klik produk untuk melihat detailnya."
        />

        {categories.length > 1 && (
          <div className="-mx-5 mt-8 sm:mx-0">
            <div role="tablist" aria-label="Kategori produk" className="flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
              {["all", ...categories].map((c) => (
                <button
                  key={c}
                  role="tab"
                  type="button"
                  aria-selected={cat === c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "min-h-11 shrink-0 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors",
                    cat === c ? "bg-fg text-white" : "bg-muted hover:bg-[#ebebed]",
                  )}
                >
                  {c === "all" ? "Semua" : c}
                </button>
              ))}
            </div>
          </div>
        )}

        {list.length === 0 ? (
          <p className="mt-10 rounded-2xl bg-muted p-6 text-subtle">Produk akan segera hadir.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {list.map((p) => (
              <li key={p.id} className={cn(p.featured && "sm:col-span-2")}>
                <button
                  type="button"
                  onClick={() => show(p)}
                  className="group flex h-full w-full flex-col rounded-[1.5rem] border border-line bg-white p-3 text-left transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] active:translate-y-0"
                >
                  <Visual p={p} className={cn("rounded-[1.1rem]", p.featured ? "aspect-[16/9] sm:aspect-[21/8]" : "aspect-[16/10]")} />
                  <span className="flex flex-1 flex-col px-3 pt-5 pb-3">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium tracking-[0.12em] text-subtle uppercase">{p.category}</span>
                      <Status p={p} />
                    </span>
                    <span className="mt-3 text-2xl font-semibold tracking-tight">{p.name}</span>
                    {p.tagline && <span className="mt-1.5 flex-1 text-[15px] leading-relaxed text-subtle">{p.tagline}</span>}
                    <span className="mt-4 flex items-center justify-between text-[14px]">
                      <span className="font-semibold tracking-tight">{p.price}</span>
                      <span className="font-medium underline-offset-4 group-hover:underline">Detail</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialogRef.current && close()}
        aria-labelledby="product-dialog-title"
        className="m-auto max-h-[92svh] w-[min(94vw,36rem)] overflow-y-auto rounded-[1.75rem] border-0 bg-white p-0 text-fg shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="p-3">
            <div className="relative">
              <Visual p={open} className="aspect-[16/10] rounded-[1.25rem]" />
              <button
                type="button"
                onClick={close}
                aria-label="Tutup"
                className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-white/90 backdrop-blur hover:bg-white"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="px-3 pt-5 pb-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium tracking-[0.12em] text-subtle uppercase">{open.category}</span>
                <Status p={open} />
              </div>
              <h3 id="product-dialog-title" className="mt-2 text-3xl font-semibold tracking-tight">
                {open.name}
              </h3>
              {open.tagline && <p className="mt-1.5 text-lg text-subtle">{open.tagline}</p>}
              <p className="mt-4 text-[15px] leading-relaxed">{open.description}</p>
              {open.highlights.length > 0 && (
                <ul className="mt-4 space-y-2 text-[15px]">
                  {open.highlights.map((h) => (
                    <li key={h} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-fg" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              {open.price && <p className="mt-5 text-2xl font-semibold tracking-tight">{open.price}</p>}
              <div className="mt-5">
                {isLive(open) ? (
                  <ButtonLink href={open.buyUrl} className="w-full">
                    Beli sekarang
                  </ButtonLink>
                ) : (
                  <Button variant="secondary" disabled className="w-full">
                    Segera tersedia
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
