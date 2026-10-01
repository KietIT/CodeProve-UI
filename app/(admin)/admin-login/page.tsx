"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { card, field, primaryButton } from "../admin/_ui";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Nhập email và mật khẩu được cấp."); return; }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // /admin checks the role and first-login flag returned by the auth API.
      router.replace("/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Đăng nhập thất bại.");
    } finally { setSubmitting(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-on-surface"><div className="w-full max-w-md"><div className="mb-8 text-center"><Link href="/" className="text-2xl font-bold tracking-tight">Code<span className="text-primary">Prove</span></Link><span className="ml-2 rounded-md bg-primary/15 px-2 py-1 align-middle text-[10px] font-bold uppercase tracking-widest text-primary">Admin</span><h1 className="mt-8 text-3xl font-bold">Đăng nhập quản trị</h1><p className="mt-2 text-sm text-on-surface-variant">Sử dụng email và mật khẩu riêng được cấp cho bạn.</p></div><form onSubmit={submit} className={`${card} p-6 sm:p-8`}><div className="mb-6 flex items-center gap-3 rounded-xl bg-primary/10 p-3 text-sm text-on-surface-variant"><LockKeyhole size={19} className="shrink-0 text-primary" /><span>Lần đăng nhập đầu tiên sẽ yêu cầu đổi mật khẩu.</span></div><label className="block"><span className="mb-1.5 block text-sm font-semibold">Email</span><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className={field} required /></label><label className="mt-5 block"><span className="mb-1.5 block text-sm font-semibold">Mật khẩu</span><span className="relative block"><input type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={`${field} pr-11`} required /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-on-surface-variant hover:text-primary">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{error && <p role="alert" className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">{error}</p>}<button type="submit" disabled={submitting} className={`${primaryButton} mt-7 w-full`}>{submitting ? "Đang đăng nhập..." : "Đăng nhập"}</button><p className="mt-5 text-center text-xs text-on-surface-variant">Không có đăng ký hoặc Google OAuth cho admin.</p></form><p className="mt-6 text-center text-sm"><Link href="/" className="text-on-surface-variant hover:text-primary">← Về trang chủ</Link></p></div></main>;
}
