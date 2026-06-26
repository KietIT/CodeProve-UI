"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ui/Toggles";
import { useI18n } from "@/lib/i18n";

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

const topLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Workspace", href: "/workspace" },
  { label: "Analytics", href: "#" },
];

/** Horizontal top navigation — the only nav across all app pages. */
export function AppTopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 flex h-16 flex-none items-center justify-between border-b border-outline-variant/60 bg-background/75 px-5 backdrop-blur-xl md:px-12">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tighter text-on-surface"
        >
          Code<span className="text-primary">Prove</span>
        </Link>
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
      <div className="flex items-center gap-3">
        <button
          aria-label="Search"
          className="hidden h-9 w-9 cursor-pointer items-center justify-center text-on-surface-variant transition-colors hover:text-primary sm:flex"
        >
          <Sym name="search" className="text-[20px]" />
        </button>
        <ThemeToggle />
        <button
          aria-label="Notifications"
          className="flex h-9 w-9 cursor-pointer items-center justify-center text-on-surface-variant transition-colors hover:text-primary"
        >
          <Sym name="notifications" className="text-[20px]" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}

/** Account avatar with a dropdown holding profile shortcuts + Sign out. */
export function UserMenu() {
  const { locale } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Demo session — swap for the real authenticated user in production.
  const user = { name: "Codeprove User", email: "you@school.edu", initials: "CP" };

  const tx = {
    vi: { profile: "Hồ sơ", settings: "Cài đặt", signOut: "Đăng xuất" },
    en: { profile: "Profile", settings: "Settings", signOut: "Sign out" },
  }[locale];

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
    // Clear demo session here, then return to the auth screen.
    router.push("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`flex h-8 w-8 items-center justify-center bg-primary text-[11px] font-bold text-on-primary transition-shadow ${
          open ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background" : ""
        }`}
      >
        {user.initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-60 origin-top-right animate-fade-up border border-outline-variant/60 bg-surface-container-low/95 shadow-card backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 border-b border-outline-variant/60 p-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center bg-primary text-[11px] font-bold text-on-primary">
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-on-surface">{user.name}</p>
              <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
            </div>
          </div>

          <div className="p-1.5">
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Sym name="account_circle" className="text-[19px]" />
              {tx.profile}
            </Link>
            <Link
              href="#"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Sym name="settings" className="text-[19px]" />
              {tx.settings}
            </Link>
          </div>

          <div className="border-t border-outline-variant/60 p-1.5">
            <button
              role="menuitem"
              onClick={signOut}
              className="flex w-full items-center gap-2.5 px-2.5 py-2 text-sm text-error transition-colors hover:bg-error/10"
            >
              <Sym name="logout" className="text-[19px]" />
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
