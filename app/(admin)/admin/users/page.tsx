"use client";

import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { adminRequest } from "../_auth";
import { useAdminCopy } from "../_copy";
import { card, EmptyState, field, PageHeading, RowLink, secondaryButton } from "../_ui";
import { formatAdminDate, type LearnerPage } from "./_api";

const pageSize = 10;

export default function AdminUsersPage() {
  const { locale, t } = useAdminCopy();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<LearnerPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => { setPage(1); setQuery(search.trim()); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ limit: String(pageSize), offset: String((page - 1) * pageSize) });
    if (query) params.set("search", query);
    if (status !== "all") params.set("account_status", status);
    adminRequest<LearnerPage>(`/admin/users?${params}`).then((data) => {
      if (active) { setResult(data); setError(""); setLoading(false); }
    }).catch((cause: unknown) => {
      if (active) { setResult(null); setError(cause instanceof Error ? cause.message : t.users.loadError); setLoading(false); }
    });
    return () => { active = false; };
  }, [query, status, page, t.users.loadError]);

  const pages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));

  return <div>
    <PageHeading eyebrow={t.users.eyebrow} title={t.users.title} description={t.users.description} />
    <div className={`${card} overflow-hidden`}>
      <div className="grid gap-3 border-b border-outline-variant/50 p-5 sm:grid-cols-[minmax(240px,1fr)_180px_auto] sm:items-end">
        <label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">{t.users.search}</span><span className="relative block"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" /><input value={search} maxLength={100} onChange={(event) => setSearch(event.target.value)} placeholder={t.users.searchPlaceholder} className={`${field} pl-10`} /></span></label>
        <label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">{t.users.status}</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={field}><option value="all">{t.common.all}</option><option value="active">{t.common.active}</option><option value="inactive">{t.common.inactive}</option></select></label>
        <p className="pb-2 text-xs text-on-surface-variant sm:text-right">{result?.total ?? 0} {t.common.results}</p>
      </div>
      {error ? <div role="alert" className="p-5 text-sm text-error">{t.users.loadError}: {error}</div>
        : loading ? <div className="p-5 text-sm text-on-surface-variant">{t.loading}</div>
        : !result?.items.length ? <EmptyState title={t.users.empty} description={t.users.emptyHelp} />
        : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-surface-container-low/80 text-xs uppercase tracking-wide text-on-surface-variant"><tr><th scope="col" className="px-5 py-3 font-semibold">{t.users.user}</th><th scope="col" className="px-5 py-3 font-semibold">{t.users.status}</th><th scope="col" className="px-5 py-3 font-semibold">{t.common.joined}</th><th scope="col" className="px-5 py-3 font-semibold">{t.users.completed}</th><th scope="col" className="px-5 py-3 font-semibold">{t.users.averageScore}</th><th scope="col" className="px-5 py-3 font-semibold">{t.common.details}</th></tr></thead><tbody className="divide-y divide-outline-variant/50">{result.items.map((user) => <tr key={user.id} className="hover:bg-surface-container-low/60"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 font-bold text-secondary">{user.full_name.charAt(0)}</span><div><p className="font-semibold">{user.full_name}</p><p className="text-xs text-on-surface-variant">{user.email}</p></div></div></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>{user.is_active ? t.common.active : t.common.inactive}</span></td><td className="px-5 py-4 text-on-surface-variant">{formatAdminDate(user.created_at, locale)}</td><td className="px-5 py-4 tabular-nums">{user.completed}/{user.attempts}</td><td className="px-5 py-4 tabular-nums">{user.average_score ?? "—"}</td><td className="px-5 py-4"><RowLink href={`/admin/users/${user.id}`}>{t.common.view}</RowLink></td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between gap-3 border-t border-outline-variant/50 px-5 py-4"><p className="text-xs text-on-surface-variant">{t.common.page} {page}/{pages}</p><div className="flex gap-2"><button type="button" disabled={loading || page <= 1} onClick={() => { setPage(page - 1); setLoading(true); }} className={secondaryButton}>{t.common.previous}</button><button type="button" disabled={loading || page >= pages} onClick={() => { setPage(page + 1); setLoading(true); }} className={secondaryButton}>{t.common.next}</button></div></div>
    </div>
    <p className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant"><Users size={14} />{t.users.restricted}</p>
  </div>;
}
