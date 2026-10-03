"use client";

import { useEffect, useState } from "react";
import { Activity, CalendarDays, CheckCircle2, Mail, Target } from "lucide-react";
import { adminRequest } from "../../_auth";
import { useAdminCopy } from "../../_copy";
import { BackLink, card, PageHeading } from "../../_ui";
import { formatAdminDate, type Learner } from "../_api";

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const { locale, t } = useAdminCopy();
  const [user, setUser] = useState<Learner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!/^\d+$/.test(params.id)) { setLoading(false); setError(t.detail.notFound); return; }
    adminRequest<Learner>(`/admin/users/${params.id}`).then((data) => {
      if (active) { setUser(data); setError(""); setLoading(false); }
    }).catch((cause: unknown) => {
      if (active) { setUser(null); setError(cause instanceof Error && cause.message === "User not found" ? t.detail.notFound : t.detail.loadError); setLoading(false); }
    });
    return () => { active = false; };
  }, [params.id, t.detail.loadError, t.detail.notFound]);

  if (loading) return <div><BackLink href="/admin/users">{t.detail.back}</BackLink><p className="text-sm text-on-surface-variant">{t.loading}</p></div>;
  if (!user) return <div><BackLink href="/admin/users">{t.detail.back}</BackLink><h1 className="text-2xl font-bold">{error || t.detail.notFound}</h1></div>;

  const stats = [
    { label: t.detail.attempts, value: user.attempts, icon: Activity },
    { label: t.detail.completed, value: user.completed, icon: CheckCircle2 },
    { label: t.detail.averageScore, value: user.average_score ?? "—", icon: Target },
  ];
  const completion = user.attempts ? Math.round(user.completed / user.attempts * 100) : 0;

  return <div>
    <BackLink href="/admin/users">{t.detail.back}</BackLink>
    <PageHeading eyebrow={`${t.detail.account} #${user.id}`} title={user.full_name} description={t.detail.description} />
    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
      <section className={`${card} p-6`}>
        <div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary/15 text-2xl font-bold text-secondary">{user.full_name.charAt(0)}</span><div><h2 className="text-lg font-bold">{user.full_name}</h2><span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>{user.is_active ? t.common.active : t.common.inactive}</span></div></div>
        <dl className="mt-7 space-y-4 text-sm"><div className="flex gap-3"><Mail size={17} className="shrink-0 text-on-surface-variant" /><div><dt className="text-on-surface-variant">Email</dt><dd className="font-medium">{user.email}</dd></div></div><div className="flex gap-3"><CalendarDays size={17} className="shrink-0 text-on-surface-variant" /><div><dt className="text-on-surface-variant">{t.detail.joined}</dt><dd className="font-medium">{formatAdminDate(user.created_at, locale)}</dd></div></div><div className="flex gap-3"><Activity size={17} className="shrink-0 text-on-surface-variant" /><div><dt className="text-on-surface-variant">{t.detail.lastActive}</dt><dd className="font-medium">{formatAdminDate(user.last_attempt_at, locale)}</dd></div></div></dl>
      </section>
      <section className={`${card} p-6`}><h2 className="text-lg font-bold">{t.detail.progress}</h2><p className="mt-1 text-sm text-on-surface-variant">{t.detail.progressDescription}</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl bg-surface-container-low p-4"><Icon size={19} className="text-primary" /><p className="mt-3 text-2xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-on-surface-variant">{label}</p></div>)}</div><div className="mt-6"><div className="flex justify-between text-xs"><span>{t.detail.completion}</span><span>{completion}%</span></div><div className="mt-2 h-2 rounded-full bg-surface-container-high"><div className="h-2 rounded-full bg-primary" style={{ width: `${completion}%` }} /></div></div></section>
    </div>
  </div>;
}
