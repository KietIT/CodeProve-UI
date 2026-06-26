"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

export function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const { t } = useI18n();
  const page = t.pages[doc];

  return (
    <section className="pt-32 pb-24">
      <div className="container-site max-w-3xl">
        <Reveal>
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted transition-colors hover:text-content"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.common.backHome}
          </Link>

          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{page.title}</h1>
          <p className="mt-2 font-mono text-xs text-muted">{page.updated}</p>
          <p className="mt-6 text-base leading-relaxed text-muted">{page.intro}</p>
        </Reveal>

        <div className="mt-10 space-y-8">
          {page.sections.map((s, i) => (
            <Reveal key={s.h} delay={i * 0.04}>
              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold text-content">{s.h}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
