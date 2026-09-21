"use client";

import { useState } from "react";
import { Sym } from "@/components/app/AppChrome";

/** Collapsible hint for the problem brief. Presentational (props only). */
export function HintAccordion({ hint, label }: { hint: string; label: string }) {
  const [open, setOpen] = useState(false);
  if (!hint) return null;

  return (
    <section className="border border-outline-variant/50">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
          <Sym name="lightbulb" className="text-[16px]" /> {label}
        </span>
        <Sym name={open ? "expand_less" : "expand_more"} className="text-[20px] text-on-surface-variant" />
      </button>
      {open && (
        <p className="border-t border-outline-variant/40 px-4 py-3 text-sm leading-relaxed text-on-surface-variant">
          {hint}
        </p>
      )}
    </section>
  );
}
