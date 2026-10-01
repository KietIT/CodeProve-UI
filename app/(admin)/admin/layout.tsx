"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronDown, LayoutDashboard, LockKeyhole, LogOut, Menu, Users, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/Toggles";

const navigation = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/exercises", label: "Bài tập", icon: BookOpen },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [demo, setDemo] = useState(false);
  const [ready, setReady] = useState(false);
  const role = (user as (typeof user & { role?: string }))?.role;
  const mustChangePassword = (user as (typeof user & { must_change_password?: boolean }))?.must_change_password === true;
  const allowed = role === "admin" || demo;

  useEffect(() => {
    setDemo(process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("demo") === "1");
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && !loading && !user && !demo) router.replace("/admin-login");
  }, [ready, loading, user, demo, router]);
  useEffect(() => {
    if (ready && role === "admin" && mustChangePassword && pathname !== "/admin/change-password") router.replace("/admin/change-password");
  }, [ready, role, mustChangePassword, pathname, router]);
  useEffect(() => { setMobileOpen(false); setAccountOpen(false); }, [pathname]);

  if (!ready || (loading && !demo)) return <main className="grid min-h-screen place-items-center bg-background text-on-surface-variant">Đang xác thực...</main>;
  if (!user && !demo) return <main className="min-h-screen bg-background" />;
  if (!allowed) return <main className="grid min-h-screen place-items-center bg-background px-5 text-center text-on-surface"><div><LockKeyhole className="mx-auto mb-4 text-primary" size={32} /><h1 className="text-2xl font-bold">Không có quyền truy cập</h1><p className="mt-2 text-on-surface-variant">Khu vực này chỉ dành cho tài khoản admin.</p><Link href="/dashboard" className="mt-5 inline-block font-semibold text-primary hover:underline">Về trang người học</Link></div></main>;

  const title = pathname === "/admin" ? "Tổng quan" : pathname.startsWith("/admin/users") ? "Người dùng" : pathname.startsWith("/admin/exercises") ? "Bài tập" : "Tài khoản";
  const suffix = demo ? "?demo=1" : "";
  const hideContent = role === "admin" && mustChangePassword && pathname !== "/admin/change-password";
  const signOut = () => { logout(); router.replace("/admin-login"); };

  return <div className="min-h-screen bg-background text-on-surface lg:flex">
    {mobileOpen && <button type="button" aria-label="Đóng menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/55 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant/60 bg-surface-container-lowest px-4 py-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between px-3"><Link href={`/admin${suffix}`} className="text-xl font-bold tracking-tight">Code<span className="text-primary">Prove</span><span className="ml-2 rounded-md bg-primary/15 px-2 py-1 align-middle text-[10px] font-bold uppercase tracking-widest text-primary">Admin</span></Link><button type="button" aria-label="Đóng menu" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 lg:hidden"><X size={20} /></button></div>
      <p className="mb-5 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Điều hướng</p>
      <nav aria-label="Quản trị" className="space-y-1">{navigation.map(({ href, label, icon: Icon }) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={`${href}${suffix}`} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? "bg-primary/15 text-primary" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`}><Icon size={19} />{label}</Link>; })}</nav>
      <div className="mt-auto border-t border-outline-variant/60 pt-4"><Link href={`/admin/change-password${suffix}`} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-on-surface-variant hover:bg-surface-container"><LockKeyhole size={18} />Đổi mật khẩu</Link></div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/60 bg-background/90 px-4 backdrop-blur-lg sm:px-7"><div className="flex items-center gap-3"><button type="button" aria-label="Mở menu" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-surface-container lg:hidden"><Menu size={21} /></button><span className="text-sm font-semibold">{title}</span>{demo && <span className="rounded-full bg-warning/15 px-2 py-1 text-[11px] font-semibold text-warning">Demo local</span>}</div><div className="flex items-center gap-2"><ThemeToggle /><div className="relative ml-1"><button type="button" aria-label="Menu tài khoản" aria-expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)} className="flex items-center gap-2 rounded-xl border border-outline-variant/60 px-2 py-1.5 hover:bg-surface-container"><span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/20 text-xs font-bold text-primary">{user?.full_name?.slice(0, 1).toUpperCase() ?? "A"}</span><span className="hidden max-w-32 truncate text-xs font-semibold sm:block">{user?.full_name ?? "Admin demo"}</span><ChevronDown size={14} /></button>{accountOpen && <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-outline-variant bg-surface-container-lowest p-1 shadow-xl"><Link href={`/admin/change-password${suffix}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-container"><LockKeyhole size={16} />Đổi mật khẩu</Link><button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-error hover:bg-error/10"><LogOut size={16} />Đăng xuất</button></div>}</div></div></header>
      <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-7 sm:py-9">{hideContent ? <div className="rounded-xl border border-warning/40 bg-warning/10 p-5">Vui lòng đổi mật khẩu trước khi tiếp tục.</div> : children}</main>
    </div>
  </div>;
}
