import type { HTMLAttributes, ReactNode } from "react";

export type StatBlockProps = Omit<HTMLAttributes<HTMLDListElement>, "children"> & {
  value: ReactNode;
  label: string;
  description?: string;
};
/** Values and formatting belong to the caller; no scoring here. */
export function StatBlock({ value, label, description, className = "", ...props }: StatBlockProps) {
  return (
    <dl {...props} className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <dt className="order-2 text-sm font-medium text-content">{label}</dt>
      <dd className="order-1 break-words text-display-lg tabular-nums text-accent">{value}</dd>
      {description && <dd className="order-3 text-sm leading-relaxed text-muted">{description}</dd>}
    </dl>
  );
}
