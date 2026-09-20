import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "vivid";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-pill transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent hover:opacity-90 shadow-button",
  secondary:
    "border border-border bg-surface/60 text-content hover:border-primary/60 hover:bg-surface",
  ghost: "text-content hover:bg-surface/60",
  vivid:
    "bg-primary-container text-on-primary-container hover:opacity-90 shadow-vivid",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-7 text-base",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
};

export type ButtonProps = CommonProps & (
  | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "href">)
  | ({ href?: never } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>)
);

/** Callers own handlers, pending state and navigation. */
export function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", className = "", disabled, ...rest } = props;
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`;
  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest;
    if (disabled) {
      return <span id={anchorProps.id} title={anchorProps.title} aria-label={anchorProps["aria-label"]} role="link" aria-disabled="true" tabIndex={-1} className={cls}>{children}</span>;
    }
    const external = /^https?:\/\//.test(href);
    return <Link href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...anchorProps} className={cls}>{children}</Link>;
  }
  const { href: _href, type = "button", ...buttonProps } = rest;
  return <button {...buttonProps} type={type} disabled={disabled} className={cls}>{children}</button>;
}
