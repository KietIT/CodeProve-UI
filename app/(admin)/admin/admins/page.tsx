"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { adminRequest, useAdminAuth, type AdminAccount } from "../_auth";
import { useAdminCopy } from "../_copy";
import { card, field, PageHeading, primaryButton } from "../_ui";

type AdminRow = AdminAccount & { online: boolean; last_seen_at: string | null };
type AuditRow = { id: number; actor_user_id: number | null; target_user_id: number | null; action: string; detail: string | null; created_at: string };
type AuditPage = { total: number; items: AuditRow[] };
type TempResponse = { admin: AdminAccount; temporary_password: string };

const translations = {
  vi: {
    eyebrow: "Phân quyền", title: "Quản lý admin", description: "Tài khoản quản trị, hoạt động gần đây và lịch sử thao tác.",
    add: "Tạo admin", name: "Họ tên", email: "ID đăng nhập", create: "Tạo tài khoản", creating: "Đang tạo...",
    roster: "Danh sách admin", role: "Vai trò", state: "Trạng thái", activity: "Hoạt động gần nhất", actions: "Thao tác",
    online: "Đang hoạt động", offline: "Ngoại tuyến", disabled: "Đã vô hiệu hóa", enabled: "Đang bật", never: "Chưa đăng nhập",
    super: "Super admin", regular: "Admin", disable: "Vô hiệu hóa", enable: "Kích hoạt", reset: "Cấp mật khẩu tạm",
    disableConfirm: "Vô hiệu hóa tài khoản này và đăng xuất mọi phiên hiện có?", resetConfirm: "Cấp mật khẩu tạm mới? Mọi phiên hiện có sẽ bị đăng xuất.",
    audit: "Nhật ký thao tác", actor: "Người thực hiện", target: "Đối tượng", event: "Hành động", time: "Thời gian", all: "Tất cả", system: "Hệ thống", unknown: "Chưa xác thực",
    empty: "Chưa có bản ghi.", showMore: "Xem thêm", tempTitle: "Mật khẩu tạm dùng một lần", tempHelp: "Sao chép và gửi riêng cho người này. Mật khẩu sẽ không hiển thị lại sau khi đóng thông báo.", close: "Đóng",
    resetHelp: "Nếu quên mật khẩu, admin liên hệ super admin để được cấp lại mật khẩu tạm và phải đổi khi đăng nhập.",
    events: { login: "Đăng nhập", login_failed: "Đăng nhập thất bại", logout: "Đăng xuất", password_changed: "Đổi mật khẩu", admin_created: "Tạo admin", admin_bootstrapped: "Khởi tạo admin", admin_disabled: "Vô hiệu hóa", admin_enabled: "Kích hoạt", password_reset: "Cấp lại mật khẩu tạm" },
  },
  en: {
    eyebrow: "Access control", title: "Manage admins", description: "Admin accounts, recent activity and action history.",
    add: "Create admin", name: "Full name", email: "Login ID", create: "Create account", creating: "Creating...",
    roster: "Admin accounts", role: "Role", state: "Status", activity: "Last active", actions: "Actions",
    online: "Active now", offline: "Offline", disabled: "Disabled", enabled: "Enabled", never: "Never signed in",
    super: "Super admin", regular: "Admin", disable: "Disable", enable: "Enable", reset: "Issue temporary password",
    disableConfirm: "Disable this account and revoke all active sessions?", resetConfirm: "Issue a new temporary password? All active sessions will be revoked.",
    audit: "Activity log", actor: "Actor", target: "Target", event: "Action", time: "Time", all: "All", system: "System", unknown: "Unauthenticated",
    empty: "No records yet.", showMore: "Load more", tempTitle: "One-time temporary password", tempHelp: "Copy and deliver this privately. It will not be shown again after you close this notice.", close: "Close",
    resetHelp: "If an admin forgets their password, they contact the super admin for a temporary password and change it after signing in.",
    events: { login: "Signed in", login_failed: "Failed sign in", logout: "Signed out", password_changed: "Changed password", admin_created: "Created admin", admin_bootstrapped: "Bootstrapped admin", admin_disabled: "Disabled admin", admin_enabled: "Enabled admin", password_reset: "Reset temporary password" },
  },
} as const;

function message(error: unknown): string { return error instanceof Error ? error.message : "Request failed"; }

export default function AdminManagementPage() {
  const { admin } = useAdminAuth();
  const { locale } = useAdminCopy();
  const t = translations[locale];
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [audit, setAudit] = useState<AuditPage>({ total: 0, items: [] });
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [temporary, setTemporary] = useState<{ email: string; password: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (admin?.role !== "super_admin" || admin.must_change_password) return;
    try {
      const query = new URLSearchParams({ limit: "50" });
      if (actor) query.set("actor_id", actor);
      if (action) query.set("action", action);
      const [roster, history] = await Promise.all([
        adminRequest<AdminRow[]>("/admin/admins"),
        adminRequest<AuditPage>(`/admin/audit?${query.toString()}`),
      ]);
      setAdmins(roster); setAudit(history); setError("");
    } catch (cause) { setError(message(cause)); }
    finally { setLoading(false); }
  }, [admin?.role, admin?.must_change_password, actor, action]);

  useEffect(() => { void load(); }, [load]);

  const names = useMemo(() => new Map(admins.map((item) => [item.id, item.full_name])), [admins]);
  const date = (value: string | null) => value ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : t.never;

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setTemporary(null);
    try {
      const result = await adminRequest<TempResponse>("/admin/admins", { method: "POST", body: { full_name: name.trim(), email: email.trim() } });
      setName(""); setEmail(""); setTemporary({ email: result.admin.email, password: result.temporary_password });
      await load();
    } catch (cause) { setError(message(cause)); }
    finally { setBusy(false); }
  }

  async function changeStatus(row: AdminRow) {
    if (row.is_active && !window.confirm(t.disableConfirm)) return;
    setBusy(true); setError(""); setTemporary(null);
    try {
      await adminRequest(`/admin/admins/${row.id}/status`, { method: "PATCH", body: { is_active: !row.is_active } });
      await load();
    } catch (cause) { setError(message(cause)); }
    finally { setBusy(false); }
  }

  async function reset(row: AdminRow) {
    if (!window.confirm(t.resetConfirm)) return;
    setBusy(true); setError(""); setTemporary(null);
    try {
      const result = await adminRequest<TempResponse>(`/admin/admins/${row.id}/reset-password`, { method: "POST" });
      setTemporary({ email: result.admin.email, password: result.temporary_password });
      await load();
    } catch (cause) { setError(message(cause)); }
    finally { setBusy(false); }
  }

  async function more() {
    try {
      const query = new URLSearchParams({ limit: "50", offset: String(audit.items.length) });
      if (actor) query.set("actor_id", actor);
      if (action) query.set("action", action);
      const next = await adminRequest<AuditPage>(`/admin/audit?${query.toString()}`);
      setAudit((old) => ({ total: next.total, items: [...old.items, ...next.items] }));
    } catch (cause) { setError(message(cause)); }
  }

  if (admin?.role !== "super_admin" || admin.must_change_password) return null;

  return <div className="space-y-6">
    <PageHeading eyebrow={t.eyebrow} title={t.title} description={t.description} />
    {error && <div role="alert" className="flex gap-2 rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error"><AlertCircle size={18} />{error}</div>}
    {temporary && <div className="rounded-xl border border-primary/40 bg-primary/10 p-5" role="status"><div className="flex items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 font-bold"><KeyRound size={19} />{t.tempTitle}</h2><p className="mt-2 text-sm">{t.tempHelp}</p></div><button type="button" onClick={() => setTemporary(null)} className="text-sm font-semibold text-primary">{t.close}</button></div><p className="mt-4 font-semibold">{temporary.email}</p><code className="mt-2 block break-all rounded-lg bg-surface-container-lowest p-3 text-sm" data-testid="temporary-password">{temporary.password}</code></div>}
    <section className={`${card} p-5 sm:p-6`}><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><UserPlus size={20} className="text-primary" />{t.add}</h2><form onSubmit={create} className="grid gap-3 sm:grid-cols-[1fr_1.3fr_auto]"><label className="text-sm font-semibold">{t.name}<input className={`${field} mt-1`} value={name} onChange={(event) => setName(event.target.value)} minLength={2} required /></label><label className="text-sm font-semibold">{t.email}<input type="email" className={`${field} mt-1`} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@codeprove.production" required /></label><button className={`${primaryButton} self-end`} type="submit" disabled={busy}>{busy ? t.creating : t.create}</button></form></section>
    <section className={`${card} overflow-hidden`}><div className="border-b border-outline-variant/60 p-5"><h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck size={20} className="text-primary" />{t.roster}</h2><p className="mt-1 text-sm text-on-surface-variant">{t.resetHelp}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-surface-container text-xs uppercase text-on-surface-variant"><tr><th className="px-5 py-3">{t.name}</th><th className="px-5 py-3">{t.role}</th><th className="px-5 py-3">{t.state}</th><th className="px-5 py-3">{t.activity}</th><th className="px-5 py-3">{t.actions}</th></tr></thead><tbody>{admins.map((row) => <tr key={row.id} className="border-t border-outline-variant/50"><td className="px-5 py-4"><strong>{row.full_name}</strong><div className="text-xs text-on-surface-variant">{row.email}</div></td><td className="px-5 py-4">{row.role === "super_admin" ? t.super : t.regular}</td><td className="px-5 py-4">{!row.is_active ? t.disabled : row.online ? t.online : t.offline}</td><td className="px-5 py-4">{date(row.last_seen_at)}</td><td className="px-5 py-4">{row.role === "admin" && <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void changeStatus(row)} className="rounded-lg border border-outline-variant px-3 py-1.5 font-semibold text-primary disabled:opacity-50">{row.is_active ? t.disable : t.enable}</button><button type="button" disabled={busy} onClick={() => void reset(row)} className="rounded-lg border border-outline-variant px-3 py-1.5 font-semibold text-primary disabled:opacity-50">{t.reset}</button></div>}</td></tr>)}</tbody></table>{loading && <p className="p-5 text-sm text-on-surface-variant">...</p>}{!loading && admins.length === 0 && <p className="p-5 text-sm text-on-surface-variant">{t.empty}</p>}</div></section>
    <section className={`${card} overflow-hidden`}><div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/60 p-5"><h2 className="text-lg font-bold">{t.audit}</h2><div className="flex gap-2"><label className="text-xs">{t.actor}<select className={`${field} mt-1`} value={actor} onChange={(event) => setActor(event.target.value)}><option value="">{t.all}</option>{admins.map((row) => <option key={row.id} value={row.id}>{row.full_name}</option>)}</select></label><label className="text-xs">{t.event}<select className={`${field} mt-1`} value={action} onChange={(event) => setAction(event.target.value)}><option value="">{t.all}</option>{Object.entries(t.events).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label></div></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-surface-container text-xs uppercase text-on-surface-variant"><tr><th className="px-5 py-3">{t.time}</th><th className="px-5 py-3">{t.actor}</th><th className="px-5 py-3">{t.event}</th><th className="px-5 py-3">{t.target}</th></tr></thead><tbody>{audit.items.map((row) => <tr key={row.id} className="border-t border-outline-variant/50"><td className="px-5 py-3">{date(row.created_at)}</td><td className="px-5 py-3">{row.actor_user_id ? names.get(row.actor_user_id) ?? `#${row.actor_user_id}` : row.action === "login_failed" ? t.unknown : t.system}</td><td className="px-5 py-3">{t.events[row.action as keyof typeof t.events] ?? row.action}</td><td className="px-5 py-3">{row.target_user_id ? names.get(row.target_user_id) ?? `#${row.target_user_id}` : "—"}</td></tr>)}</tbody></table>{audit.items.length === 0 && <p className="p-5 text-sm text-on-surface-variant">{t.empty}</p>}</div>{audit.items.length < audit.total && <div className="border-t border-outline-variant/60 p-4 text-center"><button type="button" onClick={() => void more()} className="font-semibold text-primary">{t.showMore}</button></div>}</section>
  </div>;
}
