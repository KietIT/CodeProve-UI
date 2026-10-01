"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { API_BASE, getToken } from "@/lib/api/client";
import { card, field, PageHeading, primaryButton } from "../_ui";

export default function AdminChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const validation = !current ? "Nhập mật khẩu hiện tại." : next.length < 12 ? "Mật khẩu mới cần ít nhất 12 ký tự." : next === current ? "Mật khẩu mới phải khác mật khẩu hiện tại." : next !== confirm ? "Mật khẩu xác nhận chưa khớp." : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    setError("");
    if (validation || submitting) return;
    const token = getToken();
    if (!token) { setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."); return; }
    setSubmitting(true);
    try {
      // Planned contract. The backend currently has no change-password endpoint.
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      if (!response.ok) {
        if (response.status === 404 || response.status === 405) throw new Error("Backend chưa hỗ trợ đổi mật khẩu admin.");
        const payload: unknown = await response.json().catch(() => null);
        const detail = payload && typeof payload === "object" && "detail" in payload ? (payload as { detail: unknown }).detail : null;
        throw new Error(typeof detail === "string" ? detail : "Không thể đổi mật khẩu. Vui lòng thử lại.");
      }
      setCurrent(""); setNext(""); setConfirm("");
      // Reload /auth/me so the first-login flag is refreshed by AuthProvider.
      window.location.assign("/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể kết nối máy chủ.");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="mx-auto max-w-2xl"><PageHeading eyebrow="Bảo mật tài khoản" title="Đổi mật khẩu" description="Mỗi admin sử dụng tài khoản riêng. Hãy đổi mật khẩu được cấp trong lần đăng nhập đầu tiên." /><div className="mb-5 flex gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm"><ShieldCheck size={21} className="shrink-0 text-primary" /><p>Mật khẩu chỉ được gửi tới API khi bạn xác nhận. Giao diện không lưu mật khẩu trong localStorage hoặc dữ liệu mẫu.</p></div><form onSubmit={submit} className={`${card} p-5 sm:p-7`} noValidate><div className="mb-6 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary"><KeyRound size={21} /></span><div><h2 className="font-bold">Thông tin mật khẩu</h2><p className="text-sm text-on-surface-variant">Dùng mật khẩu mạnh và không chia sẻ với tài khoản khác.</p></div></div><div className="space-y-5"><label className="block"><span className="mb-1.5 block text-sm font-semibold">Mật khẩu hiện tại</span><input type={visible ? "text" : "password"} value={current} onChange={(event) => setCurrent(event.target.value)} autoComplete="current-password" className={field} /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold">Mật khẩu mới</span><input type={visible ? "text" : "password"} value={next} onChange={(event) => setNext(event.target.value)} autoComplete="new-password" className={field} /><span className="mt-1 block text-xs text-on-surface-variant">Ít nhất 12 ký tự, khác mật khẩu hiện tại.</span></label><label className="block"><span className="mb-1.5 block text-sm font-semibold">Xác nhận mật khẩu mới</span><input type={visible ? "text" : "password"} value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" className={field} /></label><button type="button" onClick={() => setVisible(!visible)} className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary">{visible ? <EyeOff size={17} /> : <Eye size={17} />}{visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</button></div>{touched && validation && <p role="alert" className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{validation}</p>}{error && <p role="alert" className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</p>}<div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/50 pt-5"><p className="text-xs text-on-surface-variant">Chức năng cần API backend để hoàn tất.</p><button type="submit" disabled={submitting} className={primaryButton}>{submitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</button></div></form></div>;
}
