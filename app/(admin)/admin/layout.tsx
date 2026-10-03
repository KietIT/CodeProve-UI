"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronDown, History, LayoutDashboard, LockKeyhole, LogOut, Menu, ShieldCheck, Users, X } from "lucide-react";
import { useAdminAuth } from "./_auth";
import { LanguageToggle, ThemeToggle } from "@/components/ui/Toggles";
import { useAdminCopy } from "./_copy";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { admin: user, loading, logout } = useAdminAuth();
  const { t } = useAdminCopy();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const role = user?.role;
  const mustChangePassword = user?.must_change_password === true;
  const allowed = role === "admin" || role === "super_admin";
  const navigation = [
    { href: "/admin", label: t.common.overview, icon: LayoutDashboard },
    { href: "/admin/users", label: t.common.users, icon: Users },
    { href: "/admin/exercises", label: t.common.exercises, icon: BookOpen },
    { href: "/admin/activity", label: t.common.activity, icon: History },
    ...(role === "super_admin" ? [{ href: "/admin/admins", label: t.common.adminManagement, icon: ShieldCheck }] : []),
  ];

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);
  useEffect(() => {
    if (allowed && mustChangePassword && pathname !== "/admin/change-password") router.replace("/admin/change-password");
  }, [allowed, mustChangePassword, pathname, router]);
  useEffect(() => { setMobileOpen(false); setAccountOpen(false); }, [pathname]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-background text-on-surface-variant">{t.common.loadingAuth}</main>;
  if (!user) return <main className="min-h-screen bg-background" />;
  if (!allowed) return <main className="grid min-h-screen place-items-center bg-background px-5 text-center text-on-surface"><div><LockKeyhole className="mx-auto mb-4 text-primary" size={32} /><h1 className="text-2xl font-bold">{t.common.deniedTitle}</h1><p className="mt-2 text-on-surface-variant">{t.common.deniedBody}</p><Link href="/dashboard" className="mt-5 inline-block font-semibold text-primary hover:underline">{t.common.backToStudent}</Link></div></main>;
  if (pathname.startsWith("/admin/admins") && role !== "super_admin") return <main className="grid min-h-screen place-items-center bg-background text-on-surface">{t.common.deniedTitle}</main>;

  const title = pathname === "/admin" ? t.common.overview : pathname.startsWith("/admin/admins") ? t.common.adminManagement : pathname.startsWith("/admin/users") ? t.common.users : pathname.startsWith("/admin/exercises") ? t.common.exercises : pathname.startsWith("/admin/activity") ? t.common.activity : t.common.account;
  const hideContent = mustChangePassword && pathname !== "/admin/change-password";
  const signOut = async () => { try { await logout(); } catch { /* Session may already have expired. */ } finally { router.replace("/login"); } };

  return <div className="min-h-screen bg-background text-on-surface lg:flex">
    {mobileOpen && <button type="button" aria-label={t.common.closeMenu} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 rounded-none bg-black/55 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant/60 bg-surface-container-lowest px-4 py-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between px-3"><Link href="/admin" className="text-xl font-bold tracking-tight">Code<span className="text-primary">Prove</span><span className="ml-2 rounded-md bg-primary/15 px-2 py-1 align-middle text-[10px] font-bold uppercase tracking-widest text-primary">Admin</span></Link><button type="button" aria-label={t.common.closeMenu} onClick={() => setMobileOpen(false)} className="rounded-lg p-2 lg:hidden"><X size={20} /></button></div>
      <p className="mb-5 mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{t.common.navigation}</p>
      <nav aria-label={t.common.navigation} className="space-y-1">{navigation.map(({ href, label, icon: Icon }) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? "bg-primary/15 text-primary" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`}><Icon size={19} />{label}</Link>; })}</nav>
      <div className="mt-auto border-t border-outline-variant/60 pt-4"><Link href="/admin/activity" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-on-surface-variant hover:bg-surface-container"><History size={18} />{t.common.activity}</Link><Link href="/admin/change-password" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-on-surface-variant hover:bg-surface-container"><LockKeyhole size={18} />{t.common.changePassword}</Link></div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/60 bg-background/90 px-4 backdrop-blur-lg sm:px-7"><div className="flex items-center gap-3"><button type="button" aria-label={t.common.openMenu} onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-surface-container lg:hidden"><Menu size={21} /></button><span className="text-sm font-semibold">{title}</span></div><div className="flex items-center gap-2"><LanguageToggle /><ThemeToggle /><div className="relative ml-1"><button type="button" aria-label={t.common.accountMenu} aria-expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)} className="flex items-center gap-2 rounded-xl border border-outline-variant/60 px-2 py-1.5 hover:bg-surface-container"><span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/20 text-xs font-bold text-primary">{user.full_name.slice(0, 1).toUpperCase()}</span><span className="hidden max-w-32 truncate text-xs font-semibold sm:block">{user.full_name}</span><ChevronDown size={14} /></button>{accountOpen && <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-outline-variant bg-surface-container-lowest p-1 shadow-xl"><Link href="/admin/activity" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-container"><History size={16} />{t.common.activity}</Link><Link href="/admin/change-password" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-container"><LockKeyhole size={16} />{t.common.changePassword}</Link><button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-error hover:bg-error/10"><LogOut size={16} />{t.common.signOut}</button></div>}</div></div></header>
      <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-7 sm:py-9">{hideContent ? <div className="rounded-xl border border-warning/40 bg-warning/10 p-5">{t.common.changeRequired}</div> : children}</main>
    </div>
  </div>;
}
