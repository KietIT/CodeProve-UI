// Tiny inline formatter for legal text: **bold**, `code`, and draft gaps.

export type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "code"; text: string }
  /** A gap the team must fill, e.g. "[NHÓM ĐIỀN: …]"; `text` keeps the brackets. */
  | { kind: "gap"; text: string };

const TOKEN_RE = /(\*\*[^*]+\*\*|`[^`]+`|\[(?:NHÓM ĐIỀN|TEAM):[^\]]*\]|\[(?:số|number)\])/;

export function tokenizeInline(source: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;
  const re = new RegExp(TOKEN_RE.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    const raw = match[0];
    const start = match.index;
    if (start > last) tokens.push({ kind: "text", text: source.slice(last, start) });
    if (raw.startsWith("**")) tokens.push({ kind: "bold", text: raw.slice(2, -2) });
    else if (raw.startsWith("`")) tokens.push({ kind: "code", text: raw.slice(1, -1) });
    else tokens.push({ kind: "gap", text: raw });
    last = start + raw.length;
  }
  if (last < source.length) tokens.push({ kind: "text", text: source.slice(last) });
  return tokens;
}
