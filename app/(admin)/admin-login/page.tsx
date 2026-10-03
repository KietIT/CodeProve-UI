"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useAdminAuth } from "../admin/_auth";
import { LanguageToggle, ThemeToggle } from "@/components/ui/Toggles";
import { useAdminCopy } from "../admin/_copy";
import { card, field, primaryButton } from "../admin/_ui";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const { t } = useAdminCopy();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError(t.login.missing); return; }
    setSubmitting(true);
    try {
      const admin = await login(email.trim(), password);
      setPassword("");
      router.replace(admin.must_change_password ? "/admin/change-password" : "/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.login.failed);
    } finally { setSubmitting(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-on-surface"><div className="w-full max-w-md"><div className="mb-5 flex justify-end gap-2"><LanguageToggle /><ThemeToggle /></div><div className="mb-8 text-center"><Link href="/" className="text-2xl font-bold tracking-tight">Code<span className="text-primary">Prove</span></Link><span className="ml-2 rounded-md bg-primary/15 px-2 py-1 align-middle text-[10px] font-bold uppercase tracking-widest text-primary">Admin</span><h1 className="mt-8 text-3xl font-bold">{t.login.title}</h1><p className="mt-2 text-sm text-on-surface-variant">{t.login.description}</p></div><form onSubmit={submit} className={`${card} p-6 sm:p-8`}><div className="mb-6 flex items-center gap-3 rounded-xl bg-primary/10 p-3 text-sm text-on-surface-variant"><LockKeyhole size={19} className="shrink-0 text-primary" /><span>{t.login.firstLogin}</span></div><label className="block"><span className="mb-1.5 block text-sm font-semibold">Email</span><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className={field} required /></label><label className="mt-5 block"><span className="mb-1.5 block text-sm font-semibold">{t.login.password}</span><span className="relative block"><input type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={`${field} pr-11`} required /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? t.login.hide : t.login.show} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-on-surface-variant hover:text-primary">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{error && <p role="alert" className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</p>}<button type="submit" disabled={submitting} className={`${primaryButton} mt-7 w-full`}>{submitting ? t.login.signingIn : t.login.signIn}</button><p className="mt-5 text-center text-xs text-on-surface-variant">{t.login.noGoogle}</p></form><p className="mt-6 text-center text-sm"><Link href="/" className="text-on-surface-variant hover:text-primary">← {t.login.backHome}</Link></p></div></main>;
}
