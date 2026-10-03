"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, CheckCircle2, Clock3, Users } from "lucide-react";
import { statusTone, formatDate } from "./_data";
import { adminRequest } from "./_auth";
import type { ExercisePage, ExerciseSummary } from "./exercises/_api";
import { formatAdminDate } from "./users/_api";
import { useAdminCopy } from "./_copy";
import { card, PageHeading, RowLink } from "./_ui";

type AdminOverview = {
  users_total: number;
  users_active: number;
  attempts_total: number;
  recent_users: { id: number; full_name: string; email: string; created_at: string }[];
};

export default function AdminDashboard() {
  const { locale, t } = useAdminCopy();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [overviewError, setOverviewError] = useState("");
  const [exerciseTotal, setExerciseTotal] = useState<number | null>(null);
  const [publishedTotal, setPublishedTotal] = useState<number | null>(null);
  const [pendingTotal, setPendingTotal] = useState<number | null>(null);
  const [pending, setPending] = useState<ExerciseSummary[]>([]);
  const [exerciseError, setExerciseError] = useState("");

  useEffect(() => {
    let active = true;
    adminRequest<AdminOverview>("/admin/overview").then((data) => {
      if (active) { setOverview(data); setOverviewError(""); }
    }).catch((cause: unknown) => {
      if (active) setOverviewError(cause instanceof Error ? cause.message : "Request failed");
    });
    Promise.all([
      adminRequest<ExercisePage>("/admin/exercises?limit=1"),
      adminRequest<ExercisePage>("/admin/exercises?status=published&limit=1"),
      adminRequest<ExercisePage>("/admin/exercises?status=review&limit=4"),
    ]).then(([all, published, review]) => {
      if (active) {
        setExerciseTotal(all.total);
        setPublishedTotal(published.total);
        setPendingTotal(review.total);
        setPending(review.items);
        setExerciseError("");
      }
    }).catch((cause: unknown) => {
      if (active) setExerciseError(cause instanceof Error ? cause.message : "Request failed");
    });
    return () => { active = false; };
  }, []);

  const stats = [
    { title: t.overview.users, value: overview?.users_total ?? "—", detail: `${overview?.users_active ?? "—"} ${t.overview.activeUsers}`, icon: Users, href: "/admin/users" },
    { title: t.overview.exercises, value: exerciseTotal ?? "—", detail: `${publishedTotal ?? "—"} ${t.overview.published}`, icon: BookOpen, href: "/admin/exercises" },
    { title: t.overview.attempts, value: overview?.attempts_total ?? "—", detail: t.overview.attemptDetail, icon: CheckCircle2, href: "/admin/users" },
    { title: t.overview.pending, value: pendingTotal ?? "—", detail: t.overview.pendingDetail, icon: Clock3, href: "/admin/exercises?status=review" },
  ];

  return <div>
    <PageHeading eyebrow={t.overview.eyebrow} title={t.overview.title} description={t.overview.description} />
    {overviewError && <p role="alert" className="mb-4 text-sm text-error">{t.overview.users}: {overviewError}</p>}
    {exerciseError && <p role="alert" className="mb-4 text-sm text-error">{t.overview.exercises}: {exerciseError}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ title, value, detail, icon: Icon, href }) => <Link key={title} href={href} className={`${card} group p-5 transition-colors hover:border-primary/50`}><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={20} /></span><ArrowUpRight size={17} className="text-on-surface-variant transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div><p className="mt-5 text-sm text-on-surface-variant">{title}</p><p className="mt-1 text-3xl font-bold tabular-nums">{value}</p><p className="mt-2 text-xs text-on-surface-variant">{detail}</p></Link>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      <section className={`${card} overflow-hidden`}><div className="flex items-center justify-between border-b border-outline-variant/50 p-5"><div><h2 className="text-lg font-bold">{t.overview.pendingTitle}</h2><p className="mt-1 text-xs text-on-surface-variant">{t.overview.pendingDescription}</p></div><RowLink href="/admin/exercises?status=review">{t.common.viewAll}</RowLink></div><div className="divide-y divide-outline-variant/50">{pending.map((exercise) => <div key={exercise.code} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold">{exercise.title}</p><p className="mt-1 text-xs text-on-surface-variant">{exercise.code} · {exercise.level} · {t.overview.updated} {formatDate(exercise.updated_at.slice(0, 10), locale)}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[exercise.status]}`}>{t.common[exercise.status]}</span><RowLink href={`/admin/exercises/${exercise.code}`}>{t.common.view}</RowLink></div></div>)}{pendingTotal === null && !exerciseError && <p className="px-5 py-6 text-sm text-on-surface-variant">{t.loading}</p>}{pendingTotal === 0 && <p className="px-5 py-6 text-sm text-on-surface-variant">{t.overview.noPending}</p>}</div></section>
      <section className={`${card} overflow-hidden`}><div className="flex items-center justify-between border-b border-outline-variant/50 p-5"><div><h2 className="text-lg font-bold">{t.overview.recentUsers}</h2><p className="mt-1 text-xs text-on-surface-variant">{t.overview.recentDescription}</p></div><RowLink href="/admin/users">{t.common.viewAll}</RowLink></div><div className="divide-y divide-outline-variant/50">{overview?.recent_users.map((user) => <div key={user.id} className="flex items-center justify-between gap-3 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-sm font-bold text-secondary">{user.full_name.charAt(0)}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.full_name}</p><p className="truncate text-xs text-on-surface-variant">{user.email}</p></div></div><div className="flex shrink-0 items-center gap-3"><span className="text-xs text-on-surface-variant">{formatAdminDate(user.created_at, locale)}</span><RowLink href={`/admin/users/${user.id}`}>{t.common.view}</RowLink></div></div>)}{overview === null && !overviewError && <p className="px-5 py-6 text-sm text-on-surface-variant">{t.loading}</p>}{overview?.recent_users.length === 0 && <p className="px-5 py-6 text-sm text-on-surface-variant">{t.overview.noRecent}</p>}</div></section>
    </div>
    <div className={`${card} mt-6 flex flex-wrap items-center justify-between gap-3 p-5`}><div><h2 className="font-bold">{t.overview.workflow}</h2><p className="mt-1 text-sm text-on-surface-variant">{t.overview.workflowBody}</p></div><Link href="/admin/exercises" className="text-sm font-semibold text-primary hover:underline">{t.overview.openExercises}</Link></div>
  </div>;
}
