"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LanguageToggle, ThemeToggle } from "@/components/ui/Toggles";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { appContent } from "@/lib/appContent";

/** Build up-to-2-char initials from a full name (fallback "CP"). */
function initialsOf(name: string | undefined): string {
  if (!name) return "CP";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Material Symbols icon shortcut. */
export function Sym({
  name,
  className = "",
  fill = false,
  style,
}: {
  name: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={`material-symbols-outlined ${fill ? "fill" : ""} ${className}`}
    >
      {name}
    </span>
  );
}

/** Horizontal top navigation - the only nav across all app pages. */
export function AppTopNav() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const nav = appContent[locale].nav;
  // Only real destinations: an "Analytics" item used to sit here pointing at
  // "#" - analytics lives on the dashboard, so the dead link was dropped.
  const topLinks = [
    { label: nav.dashboard, href: "/dashboard" },
    { label: nav.workspace, href: "/workspace" },
  ];
  return (
    <header className="sticky top-0 z-50 flex h-16 flex-none items-center justify-between border-b border-outline-variant/60 bg-background/75 px-5 backdrop-blur-xl md:px-12">
      <div className="flex items-center gap-8">
        {/* Brand mark - intentionally NOT a link inside the app. Clicking it used
            to jump back to the marketing landing page, which felt jarring once
            signed in. (The landing-page navbar keeps its home link.) */}
        <span
          className="select-none font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tighter text-on-surface"
          aria-label="CodeProve"
        >
          Code<span className="text-primary">Prove</span>
        </span>
        <nav className="hidden items-center gap-6 md:flex">
          {topLinks.map((l) => {
            const active = l.href !== "#" && pathname.startsWith(l.href);
            return (
              <Link
                key={l.label}
                href={l.href}
                className={`py-1 font-body-md text-body-md transition-colors ${
                  active
                    ? "border-b-2 border-primary text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Search and notification buttons used to sit here but had no feature
          behind them - removed until those systems exist. */}
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

/** Account avatar with a rich dropdown: profile header, upgrade CTA,
 *  shortcuts, a dark-mode switch and Sign out. */
export function UserMenu() {
  const { locale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Real authenticated user (falls back to placeholders before /auth/me resolves).
  const user = {
    name: authUser?.full_name ?? "CodeProve User",
    email: authUser?.email ?? "-",
    initials: initialsOf(authUser?.full_name),
    avatar: authUser?.avatar ?? null,
  };

  const tx = {
    vi: {
      upgrade: "Nâng cấp hồ sơ",
      profile: "Hồ sơ người dùng",
      community: "Cộng đồng",
      help: "Trung tâm trợ giúp",
      darkMode: "Chế độ tối",
      signOut: "Đăng xuất",
    },
    en: {
      upgrade: "Upgrade profile",
      profile: "User Profile",
      community: "Community",
      help: "Help Center",
      darkMode: "Dark Mode",
      signOut: "Sign out",
    },
  }[locale];

  // Kept intentionally lean: Settings and Integrations live inside the profile
  // page itself, so the account dropdown only surfaces top-level destinations.
  const links = [
    { icon: "account_circle", label: tx.profile, href: "/profile" },
  ];
  const links2 = [
    { icon: "groups", label: tx.community, href: "/community" },
    // Help Center points at the landing-page FAQ until a dedicated page exists.
    { icon: "help", label: tx.help, href: "/#faq" },
  ];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function signOut() {
    setOpen(false);
    logout();
    router.push("/login");
  }

  const itemCls =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-[11px] font-bold text-on-primary transition-shadow ${
          open ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background" : ""
        }`}
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          user.initials
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-72 origin-top-right animate-fade-up rounded-2xl border border-outline-variant/60 bg-surface-container-low/95 p-2 shadow-card backdrop-blur-xl"
        >
          {/* Profile header */}
          <div className="flex items-center gap-3 px-2 pb-3 pt-2">
            <div className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary-container text-sm font-bold text-on-primary">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.initials
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-on-surface">{user.name}</p>
              <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
            </div>
          </div>

          {/* Upgrade CTA - goes to the pricing page (plans live there). */}
          <Link
            href="/pricing"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mb-1 flex w-full items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary-container px-3 py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-95"
          >
            <span className="flex items-center gap-2">
              <Sym name="workspace_premium" fill className="text-[19px]" />
              {tx.upgrade}
            </span>
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              PRO
            </span>
          </Link>

          <div className="p-1">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={itemCls}
              >
                <Sym name={l.icon} className="text-[20px]" />
                {l.label}
              </Link>
            ))}
          </div>

          <div className="my-1 h-px bg-outline-variant/50" />

          <div className="p-1">
            {links2.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={itemCls}
              >
                <Sym name={l.icon} className="text-[20px]" />
                {l.label}
              </Link>
            ))}

            {/* Dark mode toggle row */}
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={theme === "dark"}
              onClick={toggleTheme}
              className={`${itemCls} w-full justify-between`}
            >
              <span className="flex items-center gap-3">
                <Sym name="dark_mode" className="text-[20px]" />
                {tx.darkMode}
              </span>
              <span
                className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition-colors ${
                  theme === "dark" ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    theme === "dark" ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </div>

          <div className="my-1 h-px bg-outline-variant/50" />

          <div className="p-1">
            <button
              role="menuitem"
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10"
            >
              <Sym name="logout" className="text-[20px]" />
              {tx.signOut}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppFooter() {
  return (
    <footer className="flex w-full flex-none items-center justify-between border-t border-outline-variant/60 bg-surface-container-low px-5 py-3 md:px-12">
      <span className="font-label-caps text-label-caps uppercase tracking-[0.15em] text-primary">
        CodeProve
      </span>
      <p className="font-label-mono text-label-mono text-on-surface-variant/60">
        © 2026 CodeProve
      </p>
    </footer>
  );
}
