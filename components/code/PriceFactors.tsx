import { MIN_PRICE, priceFactors, pricingNote } from "@/config/pricing";
import { formatRupiah } from "@/lib/format-currency";
import { SectionHeading } from "@/components/ui/Section";

export function PriceFactors() {
  return (
    <section id="pricing" className="section-y">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <SectionHeading eyebrow="Harga" title="Harga dihitung, bukan ditebak." />
            <p className="mt-6 text-[15px] text-subtle">Mulai dari</p>
            <p className="text-6xl font-semibold tracking-tighter tabular-nums sm:text-7xl">{formatRupiah(MIN_PRICE)}</p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-subtle">
              Itu untuk bantuan paling sederhana. Pekerjaan yang lebih besar dihitung otomatis dari empat hal di samping, dan angkanya tampil sebelum kamu
              mengirim apa pun.
            </p>
          </div>
          <div>
            <ol className="divide-y divide-line rounded-[1.5rem] border border-line">
              {priceFactors.map((f, i) => (
                <li key={f.title} className="flex gap-4 p-5 sm:p-6">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold tabular-nums">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold tracking-tight">{f.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-subtle">{f.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[13px] leading-relaxed text-subtle">{pricingNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
