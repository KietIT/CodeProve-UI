"use client";

import type { ReactNode } from "react";

/**
 * Lightweight markdown renderer for Ciel chat bubbles. Supports exactly what
 * the mentor is prompted to produce: paragraphs, "-"/"*" bullets, numbered
 * lists, fenced code blocks, `inline code` and **bold**. Everything is built
 * as React elements (no dangerouslySetInnerHTML), so content stays escaped.
 */

type Segment =
  | { type: "code"; lang: string; body: string }
  | { type: "text"; body: string };

// Split on ``` fences; an unterminated fence (model cut off mid-block) is
// still rendered as code rather than leaking backticks into the text.
function splitFences(text: string): Segment[] {
  const segments: Segment[] = [];
  const re = /```([\w+-]*)[ \t]*\n?([\s\S]*?)(?:```|$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: "text", body: text.slice(last, m.index) });
    const body = m[2].replace(/\n$/, "");
    if (body.trim()) segments.push({ type: "code", lang: m[1] ?? "", body });
    last = re.lastIndex;
  }
  if (last < text.length) segments.push({ type: "text", body: text.slice(last) });
  return segments;
}

// Inline markup: `code` first (its content is verbatim), then **bold**.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const parts = text.split(/(`[^`]+`)/g);
  parts.forEach((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      out.push(
        <code
          key={`${keyPrefix}-c${i}`}
          className="rounded-sm bg-surface-container-highest px-1 py-0.5 font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>,
      );
      return;
    }
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    boldParts.forEach((bp, j) => {
      if (bp.startsWith("**") && bp.endsWith("**") && bp.length > 4) {
        out.push(<strong key={`${keyPrefix}-b${i}-${j}`}>{bp.slice(2, -2)}</strong>);
      } else if (bp) {
        out.push(bp);
      }
    });
  });
  return out;
}

const BULLET_RE = /^\s*[-*•]\s+/;
const NUMBERED_RE = /^\s*\d+[.)]\s+/;

type Block =
  | { type: "ul" | "ol"; items: string[] }
  | { type: "p"; lines: string[] };

function blocksOf(text: string): Block[] {
  const blocks: Block[] = [];
  // A blank line closes the current block, so two paragraphs separated by a
  // blank line render as two <p>s instead of one <p> with a <br>.
  let open = false;
  for (const line of text.split("\n")) {
    const stripped = line.trim();
    if (!stripped) {
      open = false;
      continue;
    }
    const kind = BULLET_RE.test(stripped) ? "ul" : NUMBERED_RE.test(stripped) ? "ol" : "p";
    const prev = blocks[blocks.length - 1];
    if (kind === "p") {
      if (open && prev?.type === "p") prev.lines.push(stripped);
      else blocks.push({ type: "p", lines: [stripped] });
    } else {
      const item = stripped.replace(kind === "ul" ? BULLET_RE : NUMBERED_RE, "");
      if (open && prev?.type === kind) prev.items.push(item);
      else blocks.push({ type: kind, items: [item] });
    }
    open = true;
  }
  return blocks;
}

export function ChatMarkdown({ text }: { text: string }) {
  const segments = splitFences(text);
  return (
    <div className="space-y-2 text-sm leading-relaxed text-on-surface">
      {segments.map((seg, si) => {
        if (seg.type === "code") {
          return (
            <pre
              key={si}
              className="overflow-x-auto whitespace-pre border border-outline-variant/40 bg-surface-container-lowest/80 p-3 font-mono text-xs leading-relaxed"
            >
              <code>{seg.body}</code>
            </pre>
          );
        }
        return blocksOf(seg.body).map((block, bi) => {
          const key = `${si}-${bi}`;
          if (block.type === "p") {
            return (
              <p key={key}>
                {block.lines.map((l, li) => (
                  <span key={li}>
                    {li > 0 && <br />}
                    {renderInline(l, `${key}-${li}`)}
                  </span>
                ))}
              </p>
            );
          }
          const List = block.type === "ul" ? "ul" : "ol";
          return (
            <List
              key={key}
              className={`ml-4 space-y-1 ${block.type === "ul" ? "list-disc" : "list-decimal"}`}
            >
              {block.items.map((item, ii) => (
                <li key={ii}>{renderInline(item, `${key}-${ii}`)}</li>
              ))}
            </List>
          );
        });
      })}
    </div>
  );
}
