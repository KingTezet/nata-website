import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { MIN_PRICE } from "@/config/pricing";
import { formatRupiah } from "@/lib/format-currency";

const trust = [
  "Estimasi harga otomatis",
  `Bisa ditawar, mulai ${formatRupiah(MIN_PRICE)}`,
  "Scope jelas sebelum mulai",
  "Bayar setelah sepakat",
];

export function CodeHero() {
  return (
    <section className="pt-14 pb-16 md:pt-24 md:pb-24">
      <div className="container-x">
        <Eyebrow className="animate-fade-up">NATA / CODE</Eyebrow>
        <h1
          className="animate-fade-up mt-4 max-w-4xl text-[2.4rem] leading-[1.06] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "60ms" }}
        >
          Bantuan tugas dan project. Harganya jelas dari awal.
        </h1>
        <p
          className="animate-fade-up mt-5 max-w-2xl text-base leading-relaxed text-pretty text-subtle sm:mt-6 sm:text-xl"
          style={{ animationDelay: "120ms" }}
        >
          Coding, database, desain, presentasi, atau tugas custom. Pilih pekerjaannya, lihat estimasi harga, lalu ikuti rekomendasi atau tawar sesuai
          budgetmu.
        </p>
        <div className="animate-fade-up mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row" style={{ animationDelay: "180ms" }}>
          <ButtonLink href="#services">Lihat layanan & harga</ButtonLink>
          <ButtonLink href="#order" variant="secondary">
            Langsung pesan
          </ButtonLink>
        </div>

        <ul className="animate-fade-up mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2 md:mt-14 lg:grid-cols-4" style={{ animationDelay: "240ms" }}>
          {trust.map((t) => (
            <li key={t} className="flex items-center gap-3 text-[15px] font-medium">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
