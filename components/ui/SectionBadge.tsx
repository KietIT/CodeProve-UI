import type { ReactNode } from "react";
import { Badge, type BadgeProps } from "./Badge";

export type SectionBadgeProps = BadgeProps & { icon?: ReactNode };
export function SectionBadge({ icon, children, className = "", tone = "accent", ...props }: SectionBadgeProps) {
  return (
    <Badge {...props} tone={tone} className={`px-3 py-1.5 text-label-caps uppercase tracking-widest ${className}`}>
      {icon && <span aria-hidden="true" className="inline-flex shrink-0">{icon}</span>}
      {children}
    </Badge>
  );
}
