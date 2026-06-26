"use client";

import { Building2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const partners = [
  "FPT University",
  "Tech Institute",
  "CodeCamp Pro",
  "DataLab Academy",
  "NextGen Coding",
  "DevSchool VN",
];

export function TrustedBy() {
  const { t } = useI18n();

  return (
    <section className="border-y border-border bg-bg-soft py-10">
      <div className="container-site">
        <p className="text-center font-mono text-xs uppercase tracking-[0.18em] text-muted">
          {t.trusted.label}
        </p>

        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex w-max animate-marquee gap-12">
            {[...partners, ...partners].map((p, i) => (
              <div
                key={i}
                className="flex shrink-0 items-center gap-2 text-content/45 transition-colors duration-200 hover:text-content/80"
              >
                <Building2 className="h-5 w-5" />
                <span className="whitespace-nowrap text-sm font-semibold tracking-tight">
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted/70">{t.trusted.note}</p>
      </div>
    </section>
  );
}
