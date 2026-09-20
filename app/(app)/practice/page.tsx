"use client";

import { VisualizerPanel } from "@/components/visualizer/VisualizerPanel";
import { useI18n } from "@/lib/i18n";

const copy = {
  vi: {
    eyebrow: "Luyện tập",
    title: "Visualizer thuật toán",
    sub: "Chế độ luyện tập, không chấm điểm. Viết code và xem thuật toán chạy từng bước — biến thay đổi và con trỏ mảng di chuyển.",
  },
  en: {
    eyebrow: "Practice",
    title: "Algorithm visualizer",
    sub: "A non-graded practice mode. Write code and watch it run step by step — variables changing and array pointers moving.",
  },
} as const;

export default function PracticePage() {
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
        <p className="mt-3 max-w-xl text-on-surface-variant">{t.sub}</p>
      </header>

      <VisualizerPanel />
    </div>
  );
}
