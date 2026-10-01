"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";
import { tokenizeInline } from "@/lib/legal/inline";
import type { LegalBlock, LegalDoc } from "@/lib/legal/types";

export function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const { t } = useI18n();
  const page: LegalDoc = t.pages[doc];
  const intro = typeof page.intro === "string" ? [page.intro] : page.intro;

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
          <p className="mt-2 font-mono text-xs text-muted">
            <Inline text={page.updated} />
          </p>
          {page.draftNote && (
            <p
              role="note"
              className="mt-5 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm leading-relaxed text-content"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-warning" />
              <span>
                <Inline text={page.draftNote} />
              </span>
            </p>
          )}
          {intro.map((p) => (
            <p key={p} className="mt-6 text-base leading-relaxed text-muted">
              <Inline text={p} />
            </p>
          ))}
        </Reveal>

        <div className="mt-10 space-y-8">
          {page.sections.map((s, i) => (
            <Reveal key={s.h} delay={i * 0.04}>
              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold text-content">{s.h}</h2>
                {s.p && <p className="mt-3 text-sm leading-relaxed text-muted">{s.p}</p>}
                {s.blocks?.map((b, j) => <Block key={j} block={b} />)}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.kind === "p") {
    return (
      <p className="mt-3 text-sm leading-relaxed text-muted">
        <Inline text={block.text} />
      </p>
    );
  }
  if (block.kind === "list") {
    return (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted marker:text-muted/60">
        {block.items.map((item) =>
          typeof item === "string" ? (
            <li key={item}>
              <Inline text={item} />
            </li>
          ) : (
            <li key={item.text}>
              <Inline text={item.text} />
              <ul className="mt-1.5 list-[circle] space-y-1.5 pl-5">
                {item.items.map((sub) => (
                  <li key={sub}>
                    <Inline text={sub} />
                  </li>
                ))}
              </ul>
            </li>
          ),
        )}
      </ul>
    );
  }
  return (
    <>
      {/* Wide screens: a real table. */}
      <div className="mt-4 hidden overflow-hidden rounded-xl border border-border sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surface/60">
            <tr>
              {block.head.map((h, k) => (
                <th key={h} scope="col" className={`px-3 py-2.5 align-top font-semibold text-content ${COL_WIDTHS[k] ?? ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row[0]} className="border-t border-border">
                {row.map((cell, k) => (
                  <td key={k} className={`px-3 py-2.5 align-top leading-relaxed ${k === 0 ? "text-content" : "text-muted"}`}>
                    <Inline text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Phones: one card per row, each cell labelled by its column. */}
      <div className="mt-4 space-y-3 sm:hidden">
        {block.rows.map((row) => (
          <dl key={row[0]} className="rounded-xl border border-border p-3 text-sm">
            {row.map((cell, k) => (
              <div key={k} className={k > 0 ? "mt-2" : undefined}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted/80">{block.head[k]}</dt>
                <dd className={`mt-0.5 leading-relaxed ${k === 0 ? "text-content" : "text-muted"}`}>
                  <Inline text={cell} />
                </dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </>
  );
}

// Three-column legal tables: short label, short role, long details.
const COL_WIDTHS = ["w-[24%]", "w-[30%]"];

/** Renders **bold**, `code` and draft gaps; gaps keep their exact text, highlighted. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {tokenizeInline(text).map((tok, i) => {
        if (tok.kind === "bold") return <strong key={i} className="font-semibold text-content">{tok.text}</strong>;
        if (tok.kind === "code") {
          return (
            <code key={i} className="rounded bg-surface px-1 py-0.5 font-mono text-[0.85em] text-content">
              {tok.text}
            </code>
          );
        }
        if (tok.kind === "gap") {
          return (
            <mark key={i} className="rounded bg-warning/15 px-1 text-warning [box-decoration-break:clone]">
              {tok.text}
            </mark>
          );
        }
        return <span key={i}>{tok.text}</span>;
      })}
    </>
  );
}
