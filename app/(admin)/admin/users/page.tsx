"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { formatDate, users } from "../_data";
import { useAdminCopy } from "../_copy";
import { card, EmptyState, field, PageHeading, PlanBadge, PreviewNotice, RowLink, secondaryButton } from "../_ui";

const pageSize = 5;

export default function AdminUsersPage() {
  const { locale, t } = useAdminCopy();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [plan, setPlan] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => users.filter((user) => {
    const matchesSearch = `${user.name} ${user.email} ${user.id}`.toLocaleLowerCase(locale).includes(search.trim().toLocaleLowerCase(locale));
    return matchesSearch && (status === "all" || user.status === status) && (plan === "all" || user.plan === plan);
  }), [search, status, plan, locale]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return <div>
    <PageHeading eyebrow={t.users.eyebrow} title={t.users.title} description={t.users.description} />
    <PreviewNotice />
    <div className={`${card} overflow-hidden`}>
      <div className="grid gap-3 border-b border-outline-variant/50 p-5 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_160px_auto] xl:items-end">
        <label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">{t.users.search}</span><span className="relative block"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t.users.searchPlaceholder} className={`${field} pl-10`} /></span></label>
        <label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">{t.users.status}</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={field}><option value="all">{t.common.all}</option><option value="active">{t.common.active}</option><option value="inactive">{t.common.inactive}</option></select></label>
        <label><span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">{t.users.plan}</span><select value={plan} onChange={(event) => { setPlan(event.target.value); setPage(1); }} className={field}><option value="all">{t.common.all}</option><option value="free">Free</option><option value="plus">Plus</option><option value="pro">Pro</option></select></label>
        <p className="pb-2 text-xs text-on-surface-variant xl:text-right">{filtered.length} {t.common.results}</p>
      </div>
      {visible.length === 0 ? <EmptyState title={t.users.empty} description={t.users.emptyHelp} /> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-surface-container-low/80 text-xs uppercase tracking-wide text-on-surface-variant"><tr><th scope="col" className="px-5 py-3 font-semibold">{t.users.user}</th><th scope="col" className="px-5 py-3 font-semibold">{t.users.status}</th><th scope="col" className="px-5 py-3 font-semibold">{t.users.plan}</th><th scope="col" className="px-5 py-3 font-semibold">{t.common.joined}</th><th scope="col" className="px-5 py-3 font-semibold">{t.users.completed}</th><th scope="col" className="px-5 py-3 font-semibold">{t.users.averageScore}</th><th scope="col" className="px-5 py-3 font-semibold">{t.common.details}</th></tr></thead><tbody className="divide-y divide-outline-variant/50">{visible.map((user) => <tr key={user.id} className="hover:bg-surface-container-low/60"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 font-bold text-secondary">{user.name.charAt(0)}</span><div><p className="font-semibold">{user.name}</p><p className="text-xs text-on-surface-variant">{user.email}</p></div></div></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "active" ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>{user.status === "active" ? t.common.active : t.common.inactive}</span></td><td className="px-5 py-4"><PlanBadge plan={user.plan} /></td><td className="px-5 py-4 text-on-surface-variant">{formatDate(user.joined, locale)}</td><td className="px-5 py-4 tabular-nums">{user.completed}/{user.attempts}</td><td className="px-5 py-4 tabular-nums">{user.averageScore ?? "—"}</td><td className="px-5 py-4"><RowLink href={`/admin/users/${user.id}?demo=1`}>{t.common.view}</RowLink></td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between gap-3 border-t border-outline-variant/50 px-5 py-4"><p className="text-xs text-on-surface-variant">{t.common.page} {page}/{pages}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={secondaryButton}>{t.common.previous}</button><button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={secondaryButton}>{t.common.next}</button></div></div>
    </div>
    <p className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant"><Users size={14} />{t.users.restricted}</p>
  </div>;
}
