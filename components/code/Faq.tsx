import { ChevronDown } from "lucide-react";
import { faqs } from "@/data/faq";
import { SectionHeading } from "@/components/ui/Section";

export function Faq() {
  return (
    <section id="faq" className="section-y bg-muted">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
          <SectionHeading eyebrow="FAQ" title="Pertanyaan yang sering muncul." />
          <div className="divide-y divide-line rounded-[1.5rem] bg-white px-5 sm:px-7">
            {faqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-4 py-4 text-left text-base font-medium">
                  <span className="text-pretty">{f.q}</span>
                  <ChevronDown
                    className="size-5 shrink-0 text-subtle transition-transform duration-300 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-5 text-[15px] leading-relaxed text-subtle">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
