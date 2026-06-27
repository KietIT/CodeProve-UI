"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

const copy = {
  vi: {
    eyebrow: "Tài khoản",
    title: "Hồ sơ người dùng",
    subtitle: "Quản lý thông tin tài khoản CodeProve của bạn.",
    account: "Thông tin tài khoản",
    fullName: "Họ và tên",
    email: "Email",
    userId: "Mã người dùng",
    emailLocked: "Email không thể thay đổi.",
    save: "Lưu thay đổi",
    saving: "Đang lưu…",
    saved: "Đã lưu thay đổi.",
    nameError: "Họ tên cần tối thiểu 2 ký tự.",
    signOut: "Đăng xuất",
    notLoggedIn: "Bạn chưa đăng nhập.",
    goLogin: "Đăng nhập",
    loading: "Đang tải hồ sơ…",
  },
  en: {
    eyebrow: "Account",
    title: "User Profile",
    subtitle: "Manage your CodeProve account information.",
    account: "Account information",
    fullName: "Full name",
    email: "Email",
    userId: "User ID",
    emailLocked: "Email cannot be changed.",
    save: "Save changes",
    saving: "Saving…",
    saved: "Changes saved.",
    nameError: "Name must be at least 2 characters.",
    signOut: "Sign out",
    notLoggedIn: "You are not signed in.",
    goLogin: "Log in",
    loading: "Loading profile…",
  },
} as const;

export default function ProfilePage() {
  const { locale } = useI18n();
  const t = copy[locale];
  const { user, loading, updateProfile, logout } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Hydrate the editable field once the user resolves.
  useEffect(() => {
    if (user) setFullName(user.full_name);
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (fullName.trim().length < 2) {
      setError(t.nameError);
      return;
    }
    setSaving(true);
    try {
      await updateProfile(fullName.trim());
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function signOut() {
    logout();
    router.push("/login");
  }

  const dirty = !!user && fullName.trim() !== user.full_name;

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 md:px-8">
        <header className="mb-8">
          <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
            {t.eyebrow}
          </span>
          <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight">{t.title}</h1>
          <p className="mt-3 text-on-surface-variant">{t.subtitle}</p>
        </header>

        {loading && (
          <div className="flex items-center gap-3 py-16 text-on-surface-variant">
            <Sym name="progress_activity" className="animate-spin text-[24px] text-primary" />
            {t.loading}
          </div>
        )}

        {!loading && !user && (
          <div className="ice-card flex flex-col items-center gap-5 py-16 text-center">
            <Sym name="lock" className="text-[48px] text-primary/60" />
            <p className="text-on-surface-variant">{t.notLoggedIn}</p>
            <Link
              href="/login"
              className="flex items-center gap-2 border border-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10"
            >
              {t.goLogin} <Sym name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
        )}

        {!loading && user && (
          <div className="space-y-6">
            {/* Identity header */}
            <div className="ice-card flex items-center gap-4 p-6">
              <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary-container text-xl font-bold text-on-primary">
                {initials(user.full_name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-headline-lg-mobile text-headline-lg-mobile">{user.full_name}</p>
                <p className="truncate text-on-surface-variant">{user.email}</p>
              </div>
            </div>

            {/* Editable account form */}
            <form onSubmit={handleSubmit} className="ice-card space-y-5 p-6">
              <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
                <Sym name="badge" className="text-[18px]" /> {t.account}
              </h2>

              <div>
                <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-on-surface">
                  {t.fullName}
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setSaved(false);
                  }}
                  className="h-11 w-full border border-outline-variant/60 bg-surface-container-lowest/50 px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-on-surface">
                  {t.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="h-11 w-full cursor-not-allowed border border-outline-variant/40 bg-surface-container-highest/40 px-3 text-sm text-on-surface-variant outline-none"
                />
                <p className="mt-1 text-xs text-on-surface-variant/60">{t.emailLocked}</p>
              </div>

              <div className="font-label-mono text-label-mono text-on-surface-variant/70">
                {t.userId}: #{user.id}
              </div>

              {error && <p className="text-sm text-error">{error}</p>}
              {saved && (
                <p className="flex items-center gap-1.5 text-sm text-primary">
                  <Sym name="check_circle" className="text-[18px]" /> {t.saved}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving || !dirty}
                  className="flex cursor-pointer items-center gap-2 bg-primary px-5 py-2.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {saving ? t.saving : t.save}
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex cursor-pointer items-center gap-2 border border-error/50 px-5 py-2.5 font-label-mono text-label-mono uppercase text-error transition-colors hover:bg-error/10"
                >
                  <Sym name="logout" className="text-[16px]" /> {t.signOut}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
