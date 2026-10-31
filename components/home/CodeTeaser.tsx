import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MIN_PRICE } from "@/config/pricing";
import { services } from "@/data/services";
import { estimate } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format-currency";
import { Icon } from "@/lib/icons";
import { levels } from "@/config/pricing";
import { LevelDots } from "@/components/ui/Form";
import { ButtonLink } from "@/components/ui/Button";

const PICK = ["debugging", "presentation", "crud", "fullstack"];

export function CodeTeaser() {
  const picks = PICK.map((id) => services.find((s) => s.id === id && s.enabled)).filter((s): s is NonNullable<typeof s> => Boolean(s));
  return (
    <section className="pb-16 md:pb-24" aria-labelledby="teaser-title">
      <div className="container-x">
        <div className="overflow-hidden rounded-[1.75rem] bg-fg px-5 py-10 text-white sm:px-10 sm:py-14 md:rounded-[2.25rem]">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-14">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-white/60 uppercase">NATA / CODE</p>
              <h2 id="teaser-title" className="mt-4 text-[2rem] leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl">
                Butuh bantuan tugas atau project?
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
                Coding, database, desain, presentasi, atau tugas custom. Pilih pekerjaannya, harga estimasi muncul otomatis, lalu tawar kalau perlu.
                Mulai {formatRupiah(MIN_PRICE)}.
              </p>
              <div className="mt-7">
                <ButtonLink href="/code" variant="inverse" className="w-full sm:w-auto">
                  Buka NATAcode
                </ButtonLink>
              </div>
            </div>

            <ul className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2.5">
              {picks.map((s) => {
                const e = estimate({ level: s.level });
                return (
                  <li key={s.id} className="min-w-0">
                    <Link
                      href="/code#services"
                      className="group flex min-h-[4.5rem] items-center gap-3 rounded-2xl sm:gap-4 bg-white/8 p-4 transition-colors hover:bg-white/12"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Icon name={s.icon} className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium">{s.name}</span>
                        <span className="mt-1 flex min-w-0 items-center gap-2 text-[12px] whitespace-nowrap text-white/60">
                          <span className="shrink-0 [&_span:not([class*=bg-fg])]:bg-white/25 [&_span[class*=bg-fg]]:bg-white">
                            <LevelDots level={s.level} />
                          </span>
                          <span className="truncate">{levels[s.level].label}</span>
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[11px] text-white/50">Rekomendasi</span>
                        <span className="block text-[15px] font-semibold tabular-nums">{formatRupiah(e.recommended)}</span>
                      </span>
                      <ArrowRight className="hidden size-4 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
