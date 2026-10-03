"use client";

import Link from "next/link";
import { useAdminCopy } from "./_copy";

export default function AdminNotFound() {
  const { t } = useAdminCopy();
  return <div className="mx-auto max-w-lg py-20 text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">{t.notFound.code}</p><h1 className="mt-3 text-3xl font-bold">{t.notFound.title}</h1><p className="mt-2 text-sm text-on-surface-variant">{t.notFound.body}</p><Link href="/admin" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary">{t.notFound.back}</Link></div>;
}
