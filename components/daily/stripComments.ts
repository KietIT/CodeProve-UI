/**
 * Remove Python comments from a Bug Hunt snippet before it is shown.
 *
 * The generator sometimes leaves comments that give the answer away (e.g.
 * `# This line is incorrect`), so every comment is dropped. Answers are keyed
 * by line number, so the line count never changes: a comment-only line becomes
 * an empty line. A `#` inside a string literal (including docstrings that span
 * lines) is kept.
 */
export function stripPythonComments(code: string): string {
  let quote: string | null = null; // open string delimiter: ' " ''' or """

  return code
    .split("\n")
    .map((line) => {
      let kept = "";
      let commentStripped = false;
      let i = 0;

      while (i < line.length) {
        const ch = line[i];

        if (quote) {
          if (ch === "\\") {
            kept += line.slice(i, i + 2);
            i += 2;
          } else if (line.startsWith(quote, i)) {
            kept += quote;
            i += quote.length;
            quote = null;
          } else {
            kept += ch;
            i += 1;
          }
          continue;
        }

        if (ch === "#") {
          commentStripped = true;
          break;
        }
        const opener =
          line.startsWith('"""', i) || line.startsWith("'''", i)
            ? line.slice(i, i + 3)
            : ch === '"' || ch === "'"
              ? ch
              : null;
        if (opener) quote = opener;
        const token = opener ?? ch;
        kept += token;
        i += token.length;
      }

      // Only triple-quoted strings may span lines; an unterminated single
      // quote must not swallow the rest of the snippet.
      if (quote && quote.length === 1) quote = null;

      return commentStripped ? kept.trimEnd() : kept;
    })
    .join("\n");
}
