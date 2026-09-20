import type { VizValue } from "@/lib/types/trace";

/** One-line text rendering of a VizValue, for the variables table. */
export function formatVizValue(v: VizValue): string {
  switch (v.kind) {
    case "scalar":
      return v.value;
    case "array":
      return `[${v.items.join(", ")}]`;
    case "map":
      return `{${v.entries.map(([k, val]) => `${k}: ${val}`).join(", ")}}`;
  }
}

/** Names of locals whose text rendering changed between two frames (for highlight). */
export function changedKeys(
  prev: Record<string, VizValue> | undefined,
  cur: Record<string, VizValue>,
): Set<string> {
  const changed = new Set<string>();
  for (const [key, value] of Object.entries(cur)) {
    const before = prev?.[key];
    if (!before || formatVizValue(before) !== formatVizValue(value)) changed.add(key);
  }
  return changed;
}
