"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

// Max avatar size before base64 encoding (keeps the DB row small).
const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024;

type Section = "account" | "settings" | "integrations";

const copy = {
  vi: {
    eyebrow: "Tài khoản",
    title: "Hồ sơ người dùng",
    subtitle: "Quản lý tài khoản, tuỳ chọn và kết nối của bạn.",
    nav: { account: "Tài khoản", settings: "Cài đặt", integrations: "Tích hợp", community: "Cộng đồng" },
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
    uploadAvatar: "Tải ảnh lên",
    removeAvatar: "Xoá ảnh",
    avatarHint: "PNG hoặc JPG, tối đa 1.5MB.",
    avatarTooBig: "Ảnh quá lớn (tối đa 1.5MB).",
    avatarNotImage: "Vui lòng chọn một tệp ảnh.",
    settingsTitle: "Tuỳ chọn",
    settingsSub: "Cá nhân hoá trải nghiệm của bạn.",
    theme: "Giao diện",
    themeDark: "Tối",
    themeLight: "Sáng",
    language: "Ngôn ngữ",
    notifications: "Thông báo qua email",
    notifSub: "Nhận tóm tắt tiến độ và nhắc luyện tập.",
    integrationsTitle: "Kết nối",
    integrationsSub: "Liên kết công cụ bạn dùng hằng ngày (đang thử nghiệm).",
    connect: "Kết nối",
    connected: "Đã kết nối",
    disconnect: "Ngắt kết nối",
    communityTitle: "Cộng đồng CodeProve",
    communitySub: "Xem thảo luận, bảng xếp hạng và học hỏi từ những người dùng khác.",
    communityCta: "Vào cộng đồng",
  },
  en: {
    eyebrow: "Account",
    title: "User Profile",
    subtitle: "Manage your account, preferences and connections.",
    nav: { account: "Account", settings: "Settings", integrations: "Integrations", community: "Community" },
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
    uploadAvatar: "Upload photo",
    removeAvatar: "Remove",
    avatarHint: "PNG or JPG, up to 1.5MB.",
    avatarTooBig: "Image is too large (max 1.5MB).",
    avatarNotImage: "Please choose an image file.",
    settingsTitle: "Preferences",
    settingsSub: "Personalise your experience.",
    theme: "Theme",
    themeDark: "Dark",
    themeLight: "Light",
    language: "Language",
    notifications: "Email notifications",
    notifSub: "Get progress digests and practice reminders.",
    integrationsTitle: "Connections",
    integrationsSub: "Link the tools you use every day (experimental).",
    connect: "Connect",
    connected: "Connected",
    disconnect: "Disconnect",
    communityTitle: "CodeProve Community",
    communitySub: "See discussions, leaderboards and learn from other builders.",
    communityCta: "Enter community",
  },
} as const;

const INTEGRATIONS = [
  { id: "github", label: "GitHub", icon: "code", desc: { vi: "Đồng bộ repo & lịch sử commit", en: "Sync repos & commit history" } },
  { id: "vscode", label: "VS Code", icon: "code_blocks", desc: { vi: "Luyện tập ngay trong trình soạn thảo", en: "Practice inside your editor" } },
  { id: "slack", label: "Slack", icon: "forum", desc: { vi: "Nhận thông báo tiến độ", en: "Get progress notifications" } },
  { id: "calendar", label: "Google Calendar", icon: "event", desc: { vi: "Lên lịch nhắc luyện tập", en: "Schedule practice reminders" } },
] as const;

export default function ProfilePage() {
  const { locale, setLocale } = useI18n();
  const t = copy[locale];
  const { theme, toggleTheme } = useTheme();
  const { user, loading, updateProfile, logout } = useAuth();
  const router = useRouter();

  const [section, setSection] = useState<Section>("account");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Avatar upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Local-only preference toggles (mock - not persisted server-side yet).
  const [emailNotif, setEmailNotif] = useState(true);
  const [connected, setConnected] = useState<Record<string, boolean>>({});

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
      await updateProfile({ full_name: fullName.trim() });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function pickAvatar() {
    setAvatarError("");
    fileRef.current?.click();
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError(t.avatarNotImage);
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t.avatarTooBig);
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read_failed"));
      reader.readAsDataURL(file);
    });
    setAvatarSaving(true);
    setAvatarError("");
    try {
      await updateProfile({ avatar: dataUrl });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAvatarSaving(false);
    }
  }

  async function removeAvatar() {
    setAvatarSaving(true);
    setAvatarError("");
    try {
      await updateProfile({ avatar: "" });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Failed");
    } finally {
      setAvatarSaving(false);
    }
  }

  function signOut() {
    logout();
    router.push("/login");
  }

  const dirty = !!user && fullName.trim() !== user.full_name;

  const navItems: { key: Section; icon: string; label: string }[] = [
    { key: "account", icon: "badge", label: t.nav.account },
    { key: "settings", icon: "settings", label: t.nav.settings },
    { key: "integrations", icon: "extension", label: t.nav.integrations },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8">
        <header className="mb-8">
          <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">{t.eyebrow}</span>
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            {/* ── Sidebar ── */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
              {/* Identity + avatar */}
              <div className="ice-card flex flex-col items-center gap-4 p-6 text-center">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary-container text-2xl font-bold text-on-primary">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.full_name} className="h-full w-full object-cover" />
                    ) : (
                      initials(user.full_name)
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={pickAvatar}
                    disabled={avatarSaving}
                    aria-label={t.uploadAvatar}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-on-primary shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Sym name={avatarSaving ? "progress_activity" : "photo_camera"} className={`text-[18px] ${avatarSaving ? "animate-spin" : ""}`} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-headline-lg-mobile text-headline-lg-mobile">{user.full_name}</p>
                  <p className="truncate text-sm text-on-surface-variant">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={pickAvatar}
                    disabled={avatarSaving}
                    className="flex cursor-pointer items-center gap-1.5 border border-outline-variant/60 px-3 py-1.5 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                  >
                    <Sym name="upload" className="text-[15px]" /> {t.uploadAvatar}
                  </button>
                  {user.avatar && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      disabled={avatarSaving}
                      className="flex cursor-pointer items-center gap-1.5 px-2 py-1.5 font-label-mono text-label-mono uppercase text-error/80 transition-colors hover:text-error disabled:opacity-50"
                    >
                      <Sym name="delete" className="text-[15px]" /> {t.removeAvatar}
                    </button>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant/60">{t.avatarHint}</p>
                {avatarError && <p className="text-xs text-error">{avatarError}</p>}
              </div>

              {/* Section nav */}
              <nav className="ice-card flex flex-col p-2">
                {navItems.map((it) => {
                  const active = section === it.key;
                  return (
                    <button
                      key={it.key}
                      onClick={() => setSection(it.key)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        active ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                    >
                      <Sym name={it.icon} className="text-[20px]" /> {it.label}
                    </button>
                  );
                })}
                <Link
                  href="/community"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                >
                  <Sym name="groups" className="text-[20px]" /> {t.nav.community}
                  <Sym name="arrow_outward" className="ml-auto text-[16px] text-on-surface-variant/50" />
                </Link>
              </nav>
            </aside>

            {/* ── Panel ── */}
            <div className="min-w-0 space-y-6">
              {section === "account" && (
                <form onSubmit={handleSubmit} className="ice-card space-y-5 p-6">
                  <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
                    <Sym name="badge" className="text-[18px]" /> {t.account}
                  </h2>
                  <div>
                    <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-on-surface">{t.fullName}</label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setSaved(false); }}
                      className="h-11 w-full border border-outline-variant/60 bg-surface-container-lowest/50 px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-on-surface">{t.email}</label>
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="h-11 w-full cursor-not-allowed border border-outline-variant/40 bg-surface-container-highest/40 px-3 text-sm text-on-surface-variant outline-none"
                    />
                    <p className="mt-1 text-xs text-on-surface-variant/60">{t.emailLocked}</p>
                  </div>
                  <div className="font-label-mono text-label-mono text-on-surface-variant/70">{t.userId}: #{user.id}</div>
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
              )}

              {section === "settings" && (
                <div className="ice-card space-y-1 p-6">
                  <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
                    <Sym name="settings" className="text-[18px]" /> {t.settingsTitle}
                  </h2>
                  <p className="pb-2 text-sm text-on-surface-variant/70">{t.settingsSub}</p>

                  {/* Theme */}
                  <SettingRow icon="dark_mode" title={t.theme} sub={theme === "dark" ? t.themeDark : t.themeLight}>
                    <Toggle checked={theme === "dark"} onClick={toggleTheme} />
                  </SettingRow>
                  {/* Language */}
                  <SettingRow icon="translate" title={t.language} sub={locale === "vi" ? "Tiếng Việt" : "English"}>
                    <div className="flex overflow-hidden rounded-pill border border-outline-variant/60">
                      {(["vi", "en"] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLocale(l)}
                          className={`cursor-pointer px-3 py-1 font-label-mono text-label-mono uppercase transition-colors ${
                            locale === l ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                  {/* Notifications */}
                  <SettingRow icon="notifications" title={t.notifications} sub={t.notifSub}>
                    <Toggle checked={emailNotif} onClick={() => setEmailNotif((v) => !v)} />
                  </SettingRow>
                </div>
              )}

              {section === "integrations" && (
                <div className="ice-card space-y-4 p-6">
                  <div>
                    <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
                      <Sym name="extension" className="text-[18px]" /> {t.integrationsTitle}
                    </h2>
                    <p className="mt-1 text-sm text-on-surface-variant/70">{t.integrationsSub}</p>
                  </div>
                  <div className="divide-y divide-outline-variant/40">
                    {INTEGRATIONS.map((it) => {
                      const on = !!connected[it.id];
                      return (
                        <div key={it.id} className="flex items-center gap-3 py-3.5">
                          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-surface-container-highest text-on-surface-variant">
                            <Sym name={it.icon} className="text-[20px]" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-on-surface">{it.label}</p>
                            <p className="truncate text-sm text-on-surface-variant/70">{it.desc[locale]}</p>
                          </div>
                          <button
                            onClick={() => setConnected((c) => ({ ...c, [it.id]: !on }))}
                            className={`flex cursor-pointer items-center gap-1.5 px-3 py-1.5 font-label-mono text-label-mono uppercase transition-colors ${
                              on
                                ? "border border-primary/50 text-primary hover:bg-primary/10"
                                : "border border-outline-variant/60 text-on-surface-variant hover:border-primary hover:text-primary"
                            }`}
                          >
                            {on ? <><Sym name="check" className="text-[15px]" /> {t.connected}</> : t.connect}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Community CTA - always visible under the active panel */}
              <Link
                href="/community"
                className="ice-card group flex items-center gap-4 p-6 transition-transform hover:-translate-y-0.5"
              >
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sym name="groups" className="text-[24px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-headline-lg-mobile text-headline-lg-mobile">{t.communityTitle}</p>
                  <p className="text-sm text-on-surface-variant/70">{t.communitySub}</p>
                </div>
                <span className="flex items-center gap-1 font-label-mono text-label-mono uppercase text-primary transition-transform group-hover:translate-x-1">
                  {t.communityCta} <Sym name="arrow_forward" className="text-[16px]" />
                </span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}

function SettingRow({ icon, title, sub, children }: { icon: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-t border-outline-variant/40 py-4 first:border-t-0">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-surface-container-highest text-on-surface-variant">
        <Sym name={icon} className="text-[20px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-on-surface">{title}</p>
        <p className="truncate text-sm text-on-surface-variant/70">{sub}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 flex-none cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-outline-variant"
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
