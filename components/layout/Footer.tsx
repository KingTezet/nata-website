import Link from "next/link";
import { siteConfig } from "@/config/site";
import { WHATSAPP_BASE_URL } from "@/config/whatsapp";

export function Footer({ variant = "home" }: { variant?: "home" | "code" }) {
  const links = [
    { label: "Home", href: "/" },
    { label: "NATA Products", href: "/#products" },
    { label: "NATAcode", href: "/code" },
  ];

  return (
    <footer className="border-t border-line bg-muted pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="container-x py-12 md:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-tight">{siteConfig.wordmark}</p>
            <p className="mt-2 text-sm text-subtle">{siteConfig.tagline}</p>
            {variant === "code" && <p className="mt-1 text-sm text-subtle">A service by NATA.</p>}
          </div>

          <ul className="grid grid-cols-2 gap-x-10 gap-y-1 text-[15px] sm:flex sm:gap-x-8">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center text-subtle transition-colors hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-subtle transition-colors hover:text-fg"
              >
                Contact
              </a>
            </li>
            {siteConfig.socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-subtle transition-colors hover:text-fg"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-xs text-subtle">
          © {new Date().getFullYear()} NATA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
