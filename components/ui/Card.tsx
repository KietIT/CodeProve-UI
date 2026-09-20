import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "outlined" | "accent";
};
const variants = {
  default: "border-border bg-surface/70 shadow-card",
  outlined: "border-border bg-transparent",
  accent: "border-accent/40 bg-accent/5",
};
export function Card({ variant = "default", className = "", ...props }: CardProps) {
  return <div {...props} className={`rounded-card border p-6 ${variants[variant]} ${className}`} />;
}
