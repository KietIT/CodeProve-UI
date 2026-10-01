"use client";

import { Activity, CalendarDays, CheckCircle2, CreditCard, Mail, Target } from "lucide-react";
import { formatDate, users } from "../../_data";
import { useAdminCopy } from "../../_copy";
import { BackLink, card, PageHeading, PlanBadge, PreviewNotice } from "../../_ui";

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const { locale, t } = useAdminCopy();
  const user = users.find((item) => String(item.id) === params.id);
  if (!user) return <div><BackLink href="/admin/users?demo=1">{t.detail.back}</BackLink><h1 className="text-2xl font-bold">{t.common.noResults}</h1></div>;
  const stats = [
    { label: t.detail.attempts, value: user.attempts, icon: Activity },
    { label: t.detail.completed, value: user.completed, icon: CheckCircle2 },
    { label: t.detail.averageScore, value: user.averageScore ?? "—", icon: Target },
  ];
  const completion = user.attempts ? Math.round(user.completed / user.attempts * 100) : 0;

  return <div>
    <BackLink href="/admin/users?demo=1">{t.detail.back}</BackLink>
    <PageHeading eyebrow={`${t.detail.account} #${user.id}`} title={user.name} description={t.detail.description} />
    <PreviewNotice />
    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
      <section className={`${card} p-6`}>
        <div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary/15 text-2xl font-bold text-secondary">{user.name.charAt(0)}</span><div><h2 className="text-lg font-bold">{user.name}</h2><span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "active" ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>{user.status === "active" ? t.common.active : t.common.inactive}</span></div></div>
        <dl className="mt-7 space-y-4 text-sm"><div className="flex gap-3"><Mail size={17} className="shrink-0 text-on-surface-variant" /><div><dt className="text-on-surface-variant">Email</dt><dd className="font-medium">{user.email}</dd></div></div><div className="flex gap-3"><CalendarDays size={17} className="shrink-0 text-on-surface-variant" /><div><dt className="text-on-surface-variant">{t.detail.joined}</dt><dd className="font-medium">{formatDate(user.joined, locale)}</dd></div></div><div className="flex gap-3"><Activity size={17} className="shrink-0 text-on-surface-variant" /><div><dt className="text-on-surface-variant">{t.detail.lastActive}</dt><dd className="font-medium">{formatDate(user.lastActive, locale)}</dd></div></div></dl>
      </section>
      <div className="space-y-5">
        <section className={`${card} p-6`}><div className="flex items-center gap-2"><CreditCard size={18} className="text-primary" /><h2 className="text-lg font-bold">{t.detail.currentPlan}</h2></div><div className="mt-4 flex items-center gap-3"><PlanBadge plan={user.plan} /><span className="text-sm text-on-surface-variant">{t.common.plan}</span></div><p className="mt-4 text-xs text-on-surface-variant">{t.detail.planNote}</p></section>
        <section className={`${card} p-6`}><h2 className="text-lg font-bold">{t.detail.progress}</h2><p className="mt-1 text-sm text-on-surface-variant">{t.detail.progressDescription}</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl bg-surface-container-low p-4"><Icon size={19} className="text-primary" /><p className="mt-3 text-2xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-on-surface-variant">{label}</p></div>)}</div><div className="mt-6"><div className="flex justify-between text-xs"><span>{t.detail.completion}</span><span>{completion}%</span></div><div className="mt-2 h-2 rounded-full bg-surface-container-high"><div className="h-2 rounded-full bg-primary" style={{ width: `${completion}%` }} /></div></div></section>
      </div>
    </div>
  </div>;
}
