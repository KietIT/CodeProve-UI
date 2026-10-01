"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../_auth";
import { useAdminCopy } from "../_copy";
import { card, field, PageHeading, primaryButton } from "../_ui";

export default function AdminChangePasswordPage() {
  const { t } = useAdminCopy();
  const { changePassword } = useAdminAuth();
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const validation = !current ? t.password.missingCurrent : next.length < 15 ? t.password.tooShort : new TextEncoder().encode(next).length > 72 ? t.password.tooLong : next === current ? t.password.same : next !== confirm ? t.password.mismatch : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    setError("");
    if (validation || submitting) return;
    setSubmitting(true);
    try {
      await changePassword(current, next);
      setCurrent(""); setNext(""); setConfirm("");
      router.replace("/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.password.connection);
    } finally { setSubmitting(false); }
  }

  return <div className="mx-auto max-w-2xl"><PageHeading eyebrow={t.password.eyebrow} title={t.password.title} description={t.password.description} /><div className="mb-5 flex gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm"><ShieldCheck size={21} className="shrink-0 text-primary" /><p>{t.password.privacy}</p></div><form onSubmit={submit} className={`${card} p-5 sm:p-7`} noValidate><div className="mb-6 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary"><KeyRound size={21} /></span><div><h2 className="font-bold">{t.password.section}</h2><p className="text-sm text-on-surface-variant">{t.password.sectionHelp}</p></div></div><div className="space-y-5"><label className="block"><span className="mb-1.5 block text-sm font-semibold">{t.password.current}</span><input type={visible ? "text" : "password"} value={current} onChange={(event) => setCurrent(event.target.value)} autoComplete="current-password" className={field} /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold">{t.password.next}</span><input type={visible ? "text" : "password"} value={next} onChange={(event) => setNext(event.target.value)} autoComplete="new-password" className={field} /><span className="mt-1 block text-xs text-on-surface-variant">{t.password.hint}</span></label><label className="block"><span className="mb-1.5 block text-sm font-semibold">{t.password.confirm}</span><input type={visible ? "text" : "password"} value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" className={field} /></label><button type="button" onClick={() => setVisible(!visible)} className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary">{visible ? <EyeOff size={17} /> : <Eye size={17} />}{visible ? t.password.hide : t.password.show}</button></div>{touched && validation && <p role="alert" className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{validation}</p>}{error && <p role="alert" className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</p>}<div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/50 pt-5"><p className="text-xs text-on-surface-variant">{t.password.needsApi}</p><button type="submit" disabled={submitting} className={primaryButton}>{submitting ? t.password.updating : t.password.update}</button></div></form></div>;
}
