"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const cols: { title: string; links: { label: string; href: string }[] }[] = [
    { title: t.footer.product, links: [...t.footer.links.product] },
    { title: t.footer.company, links: [...t.footer.links.audience] },
    { title: t.footer.legal, links: [...t.footer.links.legal] },
  ];

  return (
    <footer className="border-t border-border bg-bg-soft">
      <div className="container-site py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {t.footer.tagline}
            </p>
            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-teal/80">
              {t.footer.madeBy}
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="cursor-pointer text-sm text-content/80 transition-colors duration-200 hover:text-teal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-center">
          <p>© {year} CodeProve. {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
