import { SectionHeading } from "@/components/ui/Section";

const steps = [
  { n: "01", title: "Pilih pekerjaan", text: "Cari di marketplace atau pilih tugas custom. Tingkat kesulitan dan harga rekomendasi langsung tampil." },
  { n: "02", title: "Ceritakan detailnya", text: "Ukuran pekerjaan, deadline, dan hal yang ingin ditambah. Estimasi ikut menyesuaikan." },
  {
    n: "03",
    title: "Lihat harga, lalu tawar",
    text: "Ikuti rekomendasi atau ajukan budgetmu sendiri. Meter menunjukkan seberapa dekat tawaranmu dengan estimasi.",
  },
  {
    n: "04",
    title: "Sepakat, baru mulai",
    text: "Kirim lewat WhatsApp. Pekerjaan dimulai setelah scope dan harga disepakati kedua pihak.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow="How It Works" title="Empat langkah. Harga sudah kelihatan sebelum kirim." />
        <ol className="relative mt-10 md:mt-14 md:grid md:grid-cols-4 md:gap-6">
          {/* garis vertikal (mobile) */}
          <span aria-hidden="true" className="absolute top-3 bottom-3 left-[1.35rem] w-px bg-line md:hidden" />
          {steps.map((s) => (
            <li key={s.n} className="group relative flex gap-5 pb-9 last:pb-0 md:block md:pb-0">
              <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold tabular-nums">
                {s.n}
              </span>
              {/* garis horizontal (desktop) */}
              <span aria-hidden="true" className="absolute top-[1.35rem] left-14 hidden h-px w-[calc(100%-3.5rem+1.5rem)] bg-line md:block md:group-last:hidden" />
              <div className="md:mt-6">
                <h3 className="pt-2 text-lg font-semibold tracking-tight md:pt-0">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-subtle">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
