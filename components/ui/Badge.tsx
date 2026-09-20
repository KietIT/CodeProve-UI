import type { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone };
const tones: Record<BadgeTone, string> = {
  neutral: "border-border bg-surface text-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};
export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return <span {...props} className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-medium leading-tight ${tones[tone]} ${className}`} />;
}
