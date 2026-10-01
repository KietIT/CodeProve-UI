// Shape of a legal page rendered by components/sections/LegalPage. Strings may
// use **bold**, `code` and [label](https://…) links (see lib/legal/inline.ts).

export type LegalListItem = string | { readonly text: string; readonly items: readonly string[] };

export type LegalBlock =
  | { readonly kind: "p"; readonly text: string }
  | { readonly kind: "list"; readonly items: readonly LegalListItem[] }
  | { readonly kind: "table"; readonly head: readonly string[]; readonly rows: readonly (readonly string[])[] };

export type LegalSection = {
  readonly h: string;
  /** Plain one-paragraph body (terms page). */
  readonly p?: string;
  /** Rich body (privacy policy). */
  readonly blocks?: readonly LegalBlock[];
};

export type LegalDoc = {
  readonly title: string;
  readonly updated: string;
  readonly intro: string | readonly string[];
  readonly sections: readonly LegalSection[];
};
