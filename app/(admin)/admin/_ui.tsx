"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const card = "rounded-2xl border border-outline-variant/60 bg-surface-container-lowest/80 shadow-sm";
export const field = "min-h-10 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20";
export const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-on-surface-variant">{description}</p></div>{action}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="px-6 py-16 text-center"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-on-surface-variant">{description}</p></div>;
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary"><ArrowLeft size={16} />{children}</Link>;
}

export function RowLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">{children}<ChevronRight size={15} /></Link>;
}
