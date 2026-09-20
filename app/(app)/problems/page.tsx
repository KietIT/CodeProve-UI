"use client";

import { ProblemTable } from "@/components/dashboard/ProblemTable";
import { useI18n } from "@/lib/i18n";

const copy = {
  vi: { eyebrow: "Thư viện bài tập", title: "Bài tập", sub: "Tìm và lọc bài theo chủ đề, cấp độ và độ khó." },
  en: { eyebrow: "Problem library", title: "Problems", sub: "Search and filter problems by topic, level and difficulty." },
} as const;

export default function ProblemsPage() {
  const { locale } = useI18n();
  const t = copy[locale];

  return (
    <div className="mx-auto w-full max-w-container-max px-5 py-10 md:px-12">
      <header className="mb-8">
        <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
          {t.eyebrow}
        </span>
        <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">
          {t.title}
        </h1>
        <p className="mt-3 max-w-md text-on-surface-variant">{t.sub}</p>
      </header>

      <ProblemTable />
    </div>
  );
}
