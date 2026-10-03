"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { adminRequest } from "../_auth";
import { useAdminCopy } from "../_copy";
import { statusTone } from "../_data";
import { card, EmptyState, field, PageHeading, RowLink, secondaryButton } from "../_ui";
import type { ExercisePage } from "./_api";

const pageSize = 10;

export default function AdminExercisesPage() {
  const { locale, t } = useAdminCopy();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [level, setLevel] = useState("all");
  const [kind, setKind] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ExercisePage>({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const requestedStatus = new URLSearchParams(window.location.search).get("status");
    if (["draft", "review", "approved", "published"].includes(requestedStatus ?? "")) setStatus(requestedStatus!);
  }, []);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ limit: String(pageSize), offset: String((page - 1) * pageSize) });
    if (search.trim()) query.set("q", search.trim());
    if (status !== "all") query.set("status", status);
    if (level !== "all") query.set("level", level);
    if (kind !== "all") query.set("kind", kind);
    setLoading(true);
    adminRequest<ExercisePage>(`/admin/exercises?${query}`).then((result) => {
      if (active) { setData(result); setError(""); }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Request failed");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, status, level, kind, page]);

  const pages = Math.max(1, Math.ceil(data.total / pageSize));
  const date = (value: string) => new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date(value));

  return <div>
    <PageHeading eyebrow={t.exercises.eyebrow} title={t.exercises.title} description={t.exercises.description}
      action={<Link href="/admin/exercises/new" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"><Plus size={17} />{locale === "vi" ? "Tạo bài nháp" : "New draft"}</Link>} />
    {error && <p role="alert" className="mb-4 rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">{error}</p>}
    <div className={`${card} overflow-hidden`}>
      <div className="grid gap-3 border-b border-outline-variant/50 p-5 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(3,160px)]">
        <label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">{t.exercises.search}</span><span className="relative block"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t.exercises.searchPlaceholder} className={`${field} pl-10`} /></span></label>
        <label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">{t.exercises.status}</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={field}><option value="all">{t.common.all}</option><option value="draft">{t.common.draft}</option><option value="review">{t.common.review}</option><option value="approved">{t.common.approved}</option><option value="published">{t.common.published}</option></select></label>
        <label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">{t.exercises.level}</span><select value={level} onChange={(event) => { setLevel(event.target.value); setPage(1); }} className={field}><option value="all">{t.common.all}</option><option value="fresher">Fresher</option><option value="junior">Junior</option><option value="senior">Senior</option></select></label>
        <label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">{t.exercises.kind}</span><select value={kind} onChange={(event) => { setKind(event.target.value); setPage(1); }} className={field}><option value="all">{t.common.all}</option><option value="implement">Implement</option><option value="debug">Debug</option></select></label>
      </div>
      {loading ? <p className="p-5 text-sm text-on-surface-variant">{locale === "vi" ? "Đang tải..." : "Loading..."}</p> : data.items.length === 0 ? <EmptyState title={t.exercises.empty} description={t.exercises.emptyHelp} /> :
        <div className="overflow-x-auto"><table className="w-full min-w-[810px] text-left text-sm"><thead className="bg-surface-container-low/80 text-xs uppercase tracking-wide text-on-surface-variant"><tr><th className="px-5 py-3">{t.exercises.exercise}</th><th className="px-5 py-3">{t.exercises.level}</th><th className="px-5 py-3">{t.exercises.kind}</th><th className="px-5 py-3">{t.exercises.status}</th><th className="px-5 py-3">{t.exercises.updated}</th><th className="px-5 py-3">{t.exercises.details}</th></tr></thead><tbody className="divide-y divide-outline-variant/50">{data.items.map((exercise) => <tr key={exercise.code} className="hover:bg-surface-container-low/60"><td className="px-5 py-4"><p className="font-semibold">{exercise.title}</p><p className="mt-0.5 text-xs text-on-surface-variant">{exercise.code} · {exercise.difficulty}</p></td><td className="px-5 py-4 capitalize">{exercise.level}</td><td className="px-5 py-4 capitalize">{exercise.kind}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[exercise.status]}`}>{t.common[exercise.status]}</span></td><td className="px-5 py-4 text-on-surface-variant">{date(exercise.updated_at)}</td><td className="px-5 py-4"><RowLink href={`/admin/exercises/${exercise.code}`}>{t.common.edit}</RowLink></td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between gap-3 border-t border-outline-variant/50 px-5 py-4"><p className="text-xs text-on-surface-variant">{data.total} {t.common.results} · {t.common.page} {page}/{pages}</p><div className="flex gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)} className={secondaryButton}>{t.common.previous}</button><button type="button" disabled={page >= pages || loading} onClick={() => setPage(page + 1)} className={secondaryButton}>{t.common.next}</button></div></div>
    </div>
  </div>;
}
