"use client";

import { Sparkle } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { WorkspaceMockup } from "@/components/sections/WorkspacePreview";
import { useI18n } from "@/lib/i18n";

/**
 * Shows the real Workspace (editor + Ciel panel) right under the hero, so the
 * product is visible as early as possible. Reuses the existing WorkspaceMockup
 * rather than duplicating it.
 */
export function ProductPreviewSection() {
  const { t } = useI18n();
  const w = t.workspace;

  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionBadge icon={<Sparkle className="h-3.5 w-3.5" />}>
            {w.eyebrow}
          </SectionBadge>
          <h2 className="mt-4 text-balance text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {w.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {w.body}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-10 max-w-3xl px-2 sm:px-0">
          <WorkspaceMockup />
        </Reveal>
      </div>
    </section>
  );
}
