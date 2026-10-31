import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-medium tracking-[0.14em] text-subtle uppercase", className)}>{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 className="text-[2rem] leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-pretty text-subtle sm:text-lg">{description}</p>
      )}
    </div>
  );
}
