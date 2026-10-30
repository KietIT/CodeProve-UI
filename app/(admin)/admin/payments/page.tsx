"use client";

import { useEffect, useState } from "react";
import { BarChart3, ReceiptText, Search } from "lucide-react";
import { formatVnd } from "@/lib/billing";
import { adminRequest } from "../_auth";
import { useAdminCopy } from "../_copy";
import { EmptyState, field, PageHeading, secondaryButton } from "../_ui";
import { formatDateTime, type Payment, type PaymentPage, type PaymentSummary } from "./_api";
import { AreaTrend, CountBars, PlanBars, StatusDonut } from "./_charts";

const pageSize = 10;
const ranges = [7, 30, 90];

function History() {
  const { locale, t } = useAdminCopy();
  const p = t.payments;
  const statuses: Record<string, string> = p.statuses;
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaymentPage | null>(null);
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
    adminRequest<PaymentPage>(`/admin/payments?${params}`).then((data) => {
      if (active) { setResult(data); setError(""); setLoading(false); }
    }).catch((cause: unknown) => {
      if (active) { setResult(null); setError(cause instanceof Error ? cause.message : p.loadError); setLoading(false); }
    });
    return () => { active = false; };
  }, [query, page, p.loadError]);

  const pages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));
  const row = (item: Payment) => <tr key={item.id} className="hover:bg-surface-container-low/60">
    <td className="whitespace-nowrap px-5 py-4 tabular-nums text-on-surface-variant">{formatDateTime(item.received_at, locale)}</td>
    <td className="px-5 py-4">{item.user_name ? <div><p className="font-semibold">{item.user_name}</p><p className="text-xs text-on-surface-variant">{item.user_email}</p></div> : <span className="text-on-surface-variant">{p.unmatched}</span>}</td>
    <td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums">{item.amount === null ? "—" : formatVnd(item.amount)}</td>
    <td className="whitespace-nowrap px-5 py-4">{item.plan_code ? item.plan_code.replace("_", " · ") : "—"}</td>
    <td className="px-5 py-4">{item.order_status ? <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">{statuses[item.order_status] ?? item.order_status}</span> : "—"}</td>
    <td className="px-5 py-4 text-on-surface-variant">{item.bank ?? "—"}</td>
    <td className="max-w-[280px] truncate px-5 py-4 text-xs text-on-surface-variant" title={item.transfer_content ?? ""}>{item.transfer_content ?? "—"}</td>
  </tr>;

  return <div>
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <label className="block w-full sm:max-w-md"><span className="sr-only">{p.search}</span><span className="relative block"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" /><input value={search} maxLength={100} onChange={(event) => setSearch(event.target.value)} placeholder={`${p.search}: ${p.searchPlaceholder.toLowerCase()}`} className={`${field} pl-10`} /></span></label>
      <p className="text-xs text-on-surface-variant">{result?.total ?? 0} {t.common.results}</p>
    </div>
    <div className="overflow-hidden rounded-2xl border border-outline-variant/60">
      {error ? <div role="alert" className="p-5 text-sm text-error">{p.loadError}: {error}</div>
        : loading ? <div className="p-5 text-sm text-on-surface-variant">{t.loading}</div>
        : !result?.items.length ? <EmptyState title={p.empty} description={p.emptyHelp} />
        : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-surface-container-low/80 text-xs uppercase tracking-wide text-on-surface-variant"><tr>{[p.time, p.learner, p.amount, p.plan, p.status, p.bank, p.content].map((label) => <th key={label} scope="col" className="px-5 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-outline-variant/50">{result.items.map(row)}</tbody></table></div>}
    </div>
    <div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-on-surface-variant">{t.common.page} {page}/{pages}</p><div className="flex gap-2"><button type="button" disabled={loading || page <= 1} onClick={() => setPage(page - 1)} className={secondaryButton}>{t.common.previous}</button><button type="button" disabled={loading || page >= pages} onClick={() => setPage(page + 1)} className={secondaryButton}>{t.common.next}</button></div></div>
  </div>;
}

function Section({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-base font-semibold">{title}</h2>{description && <p className="mt-0.5 text-sm text-on-surface-variant">{description}</p>}</div>{action}</div>{children}</section>;
}

function Charts() {
  const { t } = useAdminCopy();
  const p = t.payments;
  const statuses: Record<string, string> = p.statuses;
  const [days, setDays] = useState(30);
  const [data, setData] = useState<PaymentSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setData(null);
    adminRequest<PaymentSummary>(`/admin/payments/summary?days=${days}`).then((summary) => {
      if (active) { setData(summary); setError(""); }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : p.loadError);
    });
    return () => { active = false; };
  }, [days, p.loadError]);

  if (error) return <div role="alert" className="text-sm text-error">{p.loadError}: {error}</div>;

  const shortDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
  const statusRows = (data?.by_status ?? []).map((slice) => ({ label: statuses[slice.status] ?? slice.status, value: slice.orders }));
  const hasMoney = (data?.paid_orders ?? 0) > 0;
  const none = <p className="py-12 text-center text-sm text-on-surface-variant">{p.noData}</p>;
  const stats = data ? [
    { title: p.revenue, value: formatVnd(data.revenue), detail: p.days(data.days) },
    { title: p.paidOrders, value: String(data.paid_orders), detail: `${p.transfers}: ${data.transfers_received}` },
    { title: p.average, value: formatVnd(data.average_order), detail: p.revenueByDay.toLowerCase() },
    { title: p.attention, value: String(data.needs_attention), detail: p.attentionHelp },
  ] : [];
  const rangePicker = <div role="group" className="inline-flex rounded-xl bg-surface-container p-1">{ranges.map((range) => <button key={range} type="button" aria-pressed={days === range} onClick={() => setDays(range)} className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${days === range ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>{p.days(range)}</button>)}</div>;

  return <div className="space-y-10">
    {!data ? <div className="py-16 text-center text-sm text-on-surface-variant">{t.loading}</div> : <>
      <dl className="grid gap-px overflow-hidden rounded-2xl border border-outline-variant/60 bg-outline-variant/50 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <div key={stat.title} className="bg-background p-5"><dt className="text-sm font-medium text-on-surface-variant">{stat.title}</dt><dd className="mt-2 text-2xl font-bold tabular-nums">{stat.value}</dd><p className="mt-1 text-xs text-on-surface-variant">{stat.detail}</p></div>)}
      </dl>
      <Section title={p.revenueByDay} description={p.days(data.days)} action={rangePicker}>
        {hasMoney ? <AreaTrend data={data.by_day.map((day) => ({ label: shortDate(day.date), value: day.revenue }))} format={formatVnd} /> : none}
      </Section>
      <div className="grid gap-x-12 gap-y-10 border-t border-outline-variant/50 pt-10 lg:grid-cols-2">
        <Section title={p.ordersByDay}>{hasMoney ? <CountBars data={data.by_day.map((day) => ({ label: shortDate(day.date), value: day.orders }))} format={(value) => `${value} ${p.orders}`} /> : none}</Section>
        <Section title={p.byStatus}>{statusRows.length ? <StatusDonut data={statusRows} centre={String(statusRows.reduce((sum, row) => sum + row.value, 0))} caption={p.orders} /> : none}</Section>
      </div>
      <div className="border-t border-outline-variant/50 pt-10">
        <Section title={p.byPlan}>{data.by_plan.length ? <PlanBars data={data.by_plan.map((plan) => ({ label: plan.plan_code.replace("_", " · "), value: plan.revenue }))} format={formatVnd} /> : none}</Section>
      </div>
    </>}
  </div>;
}

export default function AdminPaymentsPage() {
  const { t } = useAdminCopy();
  const [tab, setTab] = useState<"history" | "charts">("history");
  const tabs = [
    { id: "history" as const, label: t.payments.tabHistory, icon: ReceiptText },
    { id: "charts" as const, label: t.payments.tabCharts, icon: BarChart3 },
  ];
  return <div>
    <PageHeading eyebrow={t.payments.eyebrow} title={t.payments.title} description={t.payments.description} />
    <div role="tablist" className="mb-8 inline-flex gap-1 rounded-2xl bg-surface-container p-1.5 ring-1 ring-outline-variant/60">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${tab === id ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"}`}><Icon size={17} />{label}</button>)}</div>
    {tab === "history" ? <History /> : <Charts />}
  </div>;
}
