"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sym } from "@/components/app/AppChrome";
import { useI18n } from "@/lib/i18n";
import { appContent } from "@/lib/appContent";

type NavItem = { label: string; href: string; icon: string; soon?: boolean };

/**
 * Vertical rail for the authenticated app area. Collapsed to icons by default;
 * expands to icon + label on hover (overlay, so it never shifts the content).
 * The CP logo returns to the marketing landing page.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const nav = appContent[useI18n().locale].nav;

  const items: NavItem[] = [
    { label: nav.dashboard, href: "/dashboard", icon: "space_dashboard" },
    { label: nav.problems, href: "/problems", icon: "list_alt" },
    { label: nav.workspace, href: "/workspace", icon: "terminal" },
    { label: nav.daily, href: "/daily", icon: "bug_report" },
    { label: nav.leaderboard, href: "/leaderboard", icon: "leaderboard", soon: true },
  ];

  const rowBase =
    "flex h-11 items-center gap-3 rounded-xl px-2.5 transition-colors";
  const labelCls =
    "whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100";

  return (
    <aside className="group fixed inset-y-0 left-0 z-40 flex w-16 flex-col gap-1 overflow-hidden border-r border-outline-variant/60 bg-surface-container-low/80 p-3 backdrop-blur-xl transition-[width] duration-200 hover:w-60 hover:shadow-card">
      {/* Logo → landing page */}
      <Link
        href="/"
        aria-label="CodeProve"
        className="mb-2 flex h-11 items-center gap-3 rounded-xl px-2.5 hover:bg-surface-container"
      >
        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">
          CP
        </span>
        <span className={`${labelCls} font-headline-lg-mobile font-bold tracking-tight text-on-surface`}>
          Code<span className="text-primary">Prove</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = !item.soon && pathname.startsWith(item.href);
          const icon = (
            <>
              <span className="flex w-6 flex-none justify-center">
                <Sym name={item.icon} className="text-[22px]" />
              </span>
              <span className={labelCls}>
                {item.label}
                {item.soon ? " · soon" : ""}
              </span>
            </>
          );

          if (item.soon) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                aria-label={`${item.label} (soon)`}
                className={`${rowBase} cursor-not-allowed text-on-surface-variant/40`}
              >
                {icon}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={`${rowBase} ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {icon}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
