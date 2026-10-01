// Tiny inline formatter for legal text: **bold**, `code` and [label](https://…) links.

export type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "code"; text: string }
  /** Only absolute https links; anything else stays plain text. */
  | { kind: "link"; text: string; href: string };

const TOKEN_RE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https:\/\/[^)\s]+\))/;
const LINK_RE = /^\[([^\]]+)\]\((https:\/\/[^)\s]+)\)$/;

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
    else {
      const [, text, href] = LINK_RE.exec(raw) as RegExpExecArray;
      tokens.push({ kind: "link", text, href });
    }
    last = start + raw.length;
  }
  if (last < source.length) tokens.push({ kind: "text", text: source.slice(last) });
  return tokens;
}
