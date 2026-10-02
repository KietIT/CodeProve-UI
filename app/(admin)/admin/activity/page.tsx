"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AlertCircle, History } from "lucide-react";
import { adminRequest, useAdminAuth, type AdminAccount } from "../_auth";
import { useAdminCopy } from "../_copy";
import { card, field, PageHeading, primaryButton, secondaryButton } from "../_ui";

type AuditRow = {
  id: number;
  actor_user_id: number | null;
  target_user_id: number | null;
  target_exercise_code: string | null;
  action: string;
  detail: string | null;
  created_at: string;
};
type AuditPage = { total: number; items: AuditRow[] };
type Filters = { actor: string; action: string; code: string };

const copy = {
  vi: {
    eyebrow: "Tài khoản quản trị", title: "Lịch sử hoạt động",
    description: "Các thao tác được ghi vào cùng nhật ký mà super-admin dùng để đối chiếu.",
    allScope: "Toàn bộ admin", ownScope: "Chỉ hoạt động của tôi",
    actor: "Người thực hiện", action: "Hành động", code: "Mã bài", all: "Tất cả", filter: "Lọc",
    time: "Thời gian", target: "Đối tượng", empty: "Chưa có hoạt động nào.", more: "Xem thêm",
    system: "Hệ thống", unknown: "Chưa xác thực", loadError: "Không thể tải lịch sử hoạt động.",
    loginRequired: "Đăng nhập bằng tài khoản admin để xem nhật ký thật.",
    events: {
      login: "Đăng nhập", login_failed: "Đăng nhập thất bại", logout: "Đăng xuất",
      password_changed: "Đổi mật khẩu", admin_created: "Tạo admin", admin_bootstrapped: "Khởi tạo admin",
      admin_disabled: "Vô hiệu hóa", admin_enabled: "Kích hoạt", password_reset: "Cấp lại mật khẩu tạm",
      exercise_draft_created: "Tạo bài nháp", exercise_draft_updated: "Sửa bài nháp",
      exercise_submitted: "Gửi duyệt bài", exercise_approved: "Duyệt bài",
      exercise_rejected: "Trả lại bài nháp", exercise_published: "Xuất bản bài",
    },
  },
  en: {
    eyebrow: "Admin account", title: "Activity history",
    description: "These actions come from the same audit log the super admin uses for review.",
    allScope: "All admins", ownScope: "My activity only",
    actor: "Actor", action: "Action", code: "Exercise code", all: "All", filter: "Filter",
    time: "Time", target: "Target", empty: "No activity yet.", more: "Load more",
    system: "System", unknown: "Unauthenticated", loadError: "Could not load activity history.",
    loginRequired: "Sign in with an admin account to view the real audit log.",
    events: {
      login: "Signed in", login_failed: "Failed sign in", logout: "Signed out",
      password_changed: "Changed password", admin_created: "Created admin", admin_bootstrapped: "Bootstrapped admin",
      admin_disabled: "Disabled admin", admin_enabled: "Enabled admin", password_reset: "Reset temporary password",
      exercise_draft_created: "Created draft", exercise_draft_updated: "Edited draft",
      exercise_submitted: "Submitted for review", exercise_approved: "Approved exercise",
      exercise_rejected: "Returned draft", exercise_published: "Published exercise",
    },
  },
} as const;

const emptyFilters: Filters = { actor: "", action: "", code: "" };

export default function AdminActivityPage() {
  const { admin } = useAdminAuth();
  const { locale } = useAdminCopy();
  const t = copy[locale];
  const isSuper = admin?.role === "super_admin";
  const adminId = admin?.id;
  const mustChangePassword = admin?.must_change_password === true;
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [history, setHistory] = useState<AuditPage>({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const names = useMemo(() => new Map([
    ...admins.map((item): [number, string] => [item.id, item.full_name]),
    ...(admin ? [[admin.id, admin.full_name] as [number, string]] : []),
  ]), [admins, admin]);

  useEffect(() => {
    if (!isSuper || mustChangePassword) return;
    let active = true;
    adminRequest<AdminAccount[]>("/admin/admins").then((items) => {
      if (active) setAdmins(items);
    }).catch(() => { /* The activity request reports authorization and connection errors. */ });
    return () => { active = false; };
  }, [isSuper, mustChangePassword]);

  const path = useCallback((offset: number): string => {
    const query = new URLSearchParams({ limit: "50", offset: String(offset) });
    if (isSuper && applied.actor) query.set("actor_id", applied.actor);
    if (applied.action) query.set("action", applied.action);
    if (applied.code) query.set("exercise_code", applied.code);
    return `/admin/audit${isSuper ? "" : "/me"}?${query.toString()}`;
  }, [isSuper, applied]);

  useEffect(() => {
    if (adminId == null || mustChangePassword) return;
    const current = ++requestId.current;
    setLoading(true);
    setError("");
    adminRequest<AuditPage>(path(0)).then((page) => {
      if (current === requestId.current) setHistory(page);
    }).catch((cause) => {
      if (current === requestId.current) {
        setHistory({ total: 0, items: [] });
        setError(cause instanceof Error ? cause.message : t.loadError);
      }
    }).finally(() => {
      if (current === requestId.current) setLoading(false);
    });
    return () => { requestId.current += 1; };
  }, [adminId, mustChangePassword, path, t.loadError]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied({ actor: isSuper ? filters.actor : "", action: filters.action, code: filters.code.trim().toUpperCase() });
  }

  async function more() {
    if (loadingMore || loading || history.items.length >= history.total) return;
    const current = requestId.current;
    setLoadingMore(true);
    try {
      const page = await adminRequest<AuditPage>(path(history.items.length));
      if (current === requestId.current) {
        setHistory((previous) => ({ total: page.total, items: [...previous.items, ...page.items] }));
      }
    } catch (cause) {
      if (current === requestId.current) setError(cause instanceof Error ? cause.message : t.loadError);
    } finally { setLoadingMore(false); }
  }

  if (!admin) return <div><PageHeading eyebrow={t.eyebrow} title={t.title} description={t.description} /><p className={`${card} p-5 text-sm text-on-surface-variant`}>{t.loginRequired}</p></div>;
  if (admin.must_change_password) return null;
  const date = (value: string) => new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date(value));
  const events: Record<string, string> = t.events;

  return <div>
    <PageHeading eyebrow={t.eyebrow} title={t.title} description={t.description}
      action={<span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"><History size={15} />{isSuper ? t.allScope : t.ownScope}</span>} />
    {error && <p role="alert" className="mb-5 flex items-center gap-2 rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error"><AlertCircle size={18} />{error}</p>}
    <section className={`${card} overflow-hidden`}>
      <form onSubmit={submit} className="grid gap-3 border-b border-outline-variant/60 p-5 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
        {isSuper && <label className="text-xs font-semibold">{t.actor}<select className={`${field} mt-1`} value={filters.actor} onChange={(event) => setFilters((old) => ({ ...old, actor: event.target.value }))}><option value="">{t.all}</option>{admins.map((item) => <option key={item.id} value={item.id}>{item.full_name}</option>)}</select></label>}
        <label className="text-xs font-semibold">{t.action}<select className={`${field} mt-1`} value={filters.action} onChange={(event) => setFilters((old) => ({ ...old, action: event.target.value }))}><option value="">{t.all}</option>{Object.entries(t.events).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="text-xs font-semibold">{t.code}<input className={`${field} mt-1`} value={filters.code} onChange={(event) => setFilters((old) => ({ ...old, code: event.target.value }))} placeholder="CP-001" /></label>
        <button type="submit" className={primaryButton}>{t.filter}</button>
      </form>
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-surface-container text-xs uppercase text-on-surface-variant"><tr><th className="px-5 py-3">{t.time}</th><th className="px-5 py-3">{t.actor}</th><th className="px-5 py-3">{t.action}</th><th className="px-5 py-3">{t.target}</th></tr></thead><tbody>{history.items.map((row) => <tr key={row.id} className="border-t border-outline-variant/50"><td className="whitespace-nowrap px-5 py-3">{date(row.created_at)}</td><td className="px-5 py-3">{row.actor_user_id ? names.get(row.actor_user_id) ?? `#${row.actor_user_id}` : row.action === "login_failed" ? t.unknown : t.system}</td><td className="px-5 py-3">{events[row.action] ?? row.action}{row.detail && <p className="mt-0.5 text-xs text-on-surface-variant">{row.detail}</p>}</td><td className="px-5 py-3">{row.target_exercise_code ?? (row.target_user_id ? names.get(row.target_user_id) ?? `#${row.target_user_id}` : "—")}</td></tr>)}</tbody></table>
        {!loading && history.items.length === 0 && <p className="p-6 text-sm text-on-surface-variant">{t.empty}</p>}
        {loading && <p role="status" className="p-6 text-sm text-on-surface-variant">...</p>}
      </div>
      {history.items.length < history.total && <div className="border-t border-outline-variant/60 p-4 text-center"><button type="button" onClick={() => void more()} disabled={loadingMore} className={secondaryButton}>{loadingMore ? "..." : t.more}</button></div>}
    </section>
  </div>;
}
