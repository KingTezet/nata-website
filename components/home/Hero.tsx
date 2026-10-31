import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";

export function Hero() {
  return (
    <section className="pt-14 pb-10 md:pt-24 md:pb-14">
      <div className="container-x text-center">
        <Eyebrow className="animate-fade-up">NATA.</Eyebrow>
        <h1
          className="animate-fade-up mx-auto mt-4 max-w-4xl text-[2.6rem] leading-[1.04] font-semibold tracking-tight text-balance sm:text-6xl lg:text-[5.25rem]"
          style={{ animationDelay: "60ms" }}
        >
          Menata hidup, satu bagian sekali.
        </h1>
        <p
          className="animate-fade-up mx-auto mt-5 max-w-xl text-base leading-relaxed text-pretty text-subtle sm:mt-6 sm:text-xl"
          style={{ animationDelay: "120ms" }}
        >
          NATA adalah rumah untuk produk yang membantu hidup lebih tertata: kebiasaan, uang, fokus, dan target. Kalau kamu butuh bantuan tugas atau
          project, ada NATAcode.
        </p>
        <div
          className="animate-fade-up mx-auto mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
          style={{ animationDelay: "180ms" }}
        >
          <ButtonLink href="#products">Lihat semua produk</ButtonLink>
          <ButtonLink href="/code" variant="secondary">
            Butuh bantuan tugas?
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
