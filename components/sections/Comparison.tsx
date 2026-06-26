"use client";

import { Check, Minus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

export function Comparison() {
  const { t } = useI18n();
  const { rows, others, brand } = t.comparison;

  return (
    <section className="bg-bg-soft py-20 sm:py-28">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t.comparison.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {t.comparison.sub}
          </p>
        </Reveal>

        <Reveal className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="w-[34%] p-4 text-left font-medium text-muted">&nbsp;</th>
                {others.map((o) => (
                  <th
                    key={o}
                    className="p-4 text-center text-xs font-medium text-muted sm:text-sm"
                  >
                    {o}
                  </th>
                ))}
                <th className="rounded-t-card bg-surface p-4 text-center text-sm font-semibold text-teal">
                  {brand}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row}>
                  <td
                    className={`p-4 text-left font-medium text-content ${
                      ri === 0 ? "border-t border-border" : "border-t border-border"
                    }`}
                  >
                    {row}
                  </td>
                  {others.map((o) => (
                    <td key={o} className="border-t border-border p-4 text-center">
                      <Minus className="mx-auto h-4 w-4 text-muted/40" />
                    </td>
                  ))}
                  <td
                    className={`border-t border-teal/20 bg-surface p-4 text-center ${
                      ri === rows.length - 1 ? "rounded-b-card" : ""
                    }`}
                  >
                    <span className="mx-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal/15">
                      <Check className="h-4 w-4 text-teal" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
