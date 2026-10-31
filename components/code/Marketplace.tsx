"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { getEnabledCategories, getEnabledServices, type Service } from "@/data/services";
import { Icon } from "@/lib/icons";
import { estimate } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format-currency";
import { levels } from "@/config/pricing";
import { SELECT_SERVICE_EVENT, type SelectServiceDetail } from "@/lib/events";
import { SectionHeading } from "@/components/ui/Section";
import { LevelDots } from "@/components/ui/Form";
import { cn } from "@/lib/utils";

type Sort = "default" | "cheap" | "pricey" | "hard";
const PAGE = 9;

function priceText(s: Service) {
  const e = estimate({ level: s.level });
  return e.low === e.high ? formatRupiah(e.low) : `${formatRupiah(e.low)}–${formatRupiah(e.high).replace("Rp", "")}`;
}

function ServiceCard({ s }: { s: Service }) {
  const e = estimate({ level: s.level });
  return (
    <li>
      <a
        href="#order"
        onClick={() =>
          window.dispatchEvent(new CustomEvent<SelectServiceDetail>(SELECT_SERVICE_EVENT, { detail: { serviceId: s.id } }))
        }
        className="group flex h-full flex-col rounded-[1.25rem] border border-line bg-white p-5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-fg/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)] active:translate-y-0"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-muted">
            <Icon name={s.icon} className="size-5" />
          </span>
          <span className="flex flex-col items-end gap-1.5 pt-1">
            <LevelDots level={s.level} />
            <span className="text-[12px] text-subtle">{levels[s.level].label}</span>
          </span>
        </div>
        <h3 className="mt-4 text-[17px] leading-snug font-semibold tracking-tight">{s.name}</h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-[14px] leading-relaxed text-subtle">{s.description}</p>
        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4">
          <div className="min-w-0">
            <p className="text-[12px] text-subtle">{s.rough ? "Perkiraan kasar" : "Rekomendasi"}</p>
            <p className="text-[17px] font-semibold tracking-tight tabular-nums">{priceText(s)}</p>
          </div>
          <span className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-fg px-4 text-[14px] font-medium whitespace-nowrap text-white transition-colors group-hover:bg-black/80">
            Hitung & tawar
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
        <span className="sr-only">Harga rekomendasi sekitar {formatRupiah(e.recommended)} untuk ukuran standar.</span>
      </a>
    </li>
  );
}

export function Marketplace() {
  const categories = useMemo(() => getEnabledCategories(), []);
  const all = useMemo(() => getEnabledServices(), []);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("default");
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = all.filter((s) => (cat === "all" || s.category === cat) && (!needle || `${s.name} ${s.description}`.toLowerCase().includes(needle)));
    if (sort !== "default") {
      const price = (s: Service) => estimate({ level: s.level }).recommended;
      r = [...r].sort((a, b) =>
        sort === "cheap" ? price(a) - price(b) : sort === "pricey" ? price(b) - price(a) : b.level - a.level,
      );
    }
    return r;
  }, [all, cat, q, sort]);

  const shown = list.slice(0, limit);
  const reset = () => {
    setCat("all");
    setQ("");
    setSort("default");
    setLimit(PAGE);
  };

  return (
    <section id="services" className="section-y bg-muted">
      <div className="container-x">
        <SectionHeading
          eyebrow="Layanan"
          title="Pilih pekerjaan, harganya langsung muncul."
          description="Tiap kartu menampilkan tingkat kesulitan dan harga rekomendasi. Klik untuk menghitung estimasi sesuai kebutuhanmu, lalu tawar kalau perlu."
        />

        <div className="mt-8 flex flex-col gap-3 md:mt-10 md:flex-row md:items-center">
          <div className="relative flex-1">
            <label htmlFor="svc-search" className="sr-only">
              Cari layanan
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
            <input
              id="svc-search"
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="Cari: laravel, flowchart, ppt…"
              className="min-h-12 w-full rounded-full border border-transparent bg-white pr-11 pl-11 text-base transition-colors placeholder:text-subtle/70 focus:border-fg focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => setQ("")}
                className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-subtle hover:bg-muted"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div>
            <label htmlFor="svc-sort" className="sr-only">
              Urutkan
            </label>
            <select
              id="svc-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="min-h-12 w-full appearance-none rounded-full border border-transparent bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%236e6e73%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m4 6 4 4 4-4%22/></svg>')] bg-[length:16px] bg-[right_1.25rem_center] bg-no-repeat pr-12 pl-5 text-base text-fg focus:border-fg focus:outline-none md:w-56"
            >
              <option value="default">Urutan biasa</option>
              <option value="cheap">Harga termurah</option>
              <option value="pricey">Harga termahal</option>
              <option value="hard">Paling sulit</option>
            </select>
          </div>
        </div>

        <div className="-mx-5 mt-4 sm:mx-0">
          <div
            role="tablist"
            aria-label="Kategori layanan"
            className="flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {[{ id: "all", name: "Semua" }, ...categories].map((c) => {
              const selected = cat === c.id;
              return (
                <button
                  key={c.id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => {
                    setCat(c.id);
                    setLimit(PAGE);
                  }}
                  className={cn(
                    "min-h-11 shrink-0 snap-start rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors",
                    selected ? "bg-fg text-white" : "bg-white hover:bg-white/60",
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-[13px] text-subtle" aria-live="polite">
          {list.length} layanan
        </p>

        {list.length === 0 ? (
          <div className="mt-4 rounded-[1.25rem] bg-white p-8 text-center">
            <p className="text-lg font-semibold tracking-tight">Tidak ada yang cocok.</p>
            <p className="mt-1 text-[15px] text-subtle">Coba kata lain, atau ceritakan sendiri lewat tugas custom.</p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <button type="button" onClick={reset} className="min-h-11 rounded-full bg-muted px-5 text-sm font-medium hover:bg-[#ebebed]">
                Reset filter
              </button>
              <a
                href="#order"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent<SelectServiceDetail>(SELECT_SERVICE_EVENT, { detail: { serviceId: "custom-task" } }))
                }
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-fg px-5 text-sm font-medium text-white"
              >
                Tugas custom
              </a>
            </div>
          </div>
        ) : (
          <ul role="tabpanel" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </ul>
        )}

        {list.length > limit && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setLimit((n) => n + PAGE)}
              className="min-h-12 rounded-full bg-white px-6 text-[15px] font-medium transition-colors hover:bg-white/60"
            >
              Tampilkan lebih banyak ({list.length - limit})
            </button>
          </div>
        )}

        <p className="mt-6 text-[13px] leading-relaxed text-subtle">
          Harga di kartu untuk ukuran pekerjaan standar dan deadline normal. Ukuran, deadline, dan tambahan kamu pilih di langkah berikutnya — angkanya
          menyesuaikan.
        </p>
      </div>
    </section>
  );
}
