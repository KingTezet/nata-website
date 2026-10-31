import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "inverse" | "ghost";

const base =
  "inline-flex min-h-12 select-none items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium leading-none whitespace-nowrap transition-[background-color,color,transform,opacity] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-white hover:bg-black/80",
  secondary: "bg-muted text-fg hover:bg-[#ebebed]",
  inverse: "bg-white text-fg hover:bg-white/85",
  ghost: "text-fg hover:bg-muted",
};

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

type Common = { variant?: Variant; className?: string; children: ReactNode };

export function ButtonLink({
  variant = "primary",
  className,
  children,
  href,
  ...rest
}: Common & Omit<ComponentProps<"a">, "className" | "children" | "href"> & { href: string }) {
  const cls = buttonClass(variant, className);
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClass(variant, className)} {...rest}>
      {children}
    </button>
  );
}
