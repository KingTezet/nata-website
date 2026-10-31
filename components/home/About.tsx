import { Eyebrow } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { WHATSAPP_BASE_URL } from "@/config/whatsapp";

const values = [
  { title: "Sederhana", text: "Tampilan dan alur yang bersih, tanpa hal yang tidak perlu." },
  { title: "Praktis", text: "Dibuat supaya langsung kepakai di aktivitas sehari-hari." },
  { title: "Jelas", text: "Apa yang kamu dapat dan berapa harganya, kelihatan dari awal." },
];

export function About() {
  return (
    <section id="about" className="section-y bg-muted">
      <div className="container-x">
        <Eyebrow className="text-center">Tentang NATA</Eyebrow>
        <p className="mx-auto mt-5 max-w-3xl text-center text-[1.65rem] leading-[1.25] font-semibold tracking-tight text-balance sm:text-4xl">
          NATA berawal dari satu ide sederhana: hidup lebih ringan kalau alat dan bantuannya rapi.
        </p>
        <dl className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3 md:mt-16">
          {values.map((v) => (
            <div key={v.title} className="rounded-[1.25rem] bg-white p-6">
              <dt className="text-lg font-semibold tracking-tight">{v.title}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-subtle">{v.text}</dd>
            </div>
          ))}
        </dl>
        <div className="mx-auto mt-12 max-w-xl text-center">
          <p className="text-[15px] text-subtle">Punya pertanyaan, atau ide produk yang pengin kamu lihat di NATA?</p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href={WHATSAPP_BASE_URL} variant="secondary" className="w-full sm:w-auto">
              Chat lewat WhatsApp
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
