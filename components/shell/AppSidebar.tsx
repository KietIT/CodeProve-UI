"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sym } from "@/components/app/AppChrome";
import { useI18n } from "@/lib/i18n";
import { appContent } from "@/lib/appContent";

type NavItem = { label: string; href: string; icon: string; soon?: boolean };

/**
 * Vertical icon rail for the authenticated app area - separate from the
 * marketing MarketingNav. Fixed to the left edge; the app shell offsets its
 * content by the rail width. Icon-only with accessible labels + tooltips.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const nav = appContent[useI18n().locale].nav;

  const items: NavItem[] = [
    { label: nav.dashboard, href: "/dashboard", icon: "space_dashboard" },
    { label: nav.problems, href: "/problems", icon: "list_alt" },
    { label: nav.practice, href: "/practice", icon: "animation" },
    { label: nav.workspace, href: "/workspace", icon: "terminal" },
    { label: nav.daily, href: "/daily", icon: "bug_report" },
    { label: nav.leaderboard, href: "/leaderboard", icon: "leaderboard", soon: true },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col items-center gap-2 border-r border-outline-variant/60 bg-surface-container-low/80 py-4 backdrop-blur-xl">
      <Link
        href="/dashboard"
        aria-label="CodeProve"
        className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 font-bold text-primary"
      >
        CP
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {items.map((item) => {
          const active = !item.soon && pathname.startsWith(item.href);
          const cls =
            "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors";
          const inner = (
            <>
              <Sym name={item.icon} className="text-[22px]" />
              {/* Tooltip label on hover/focus */}
              <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-lg border border-outline-variant/60 bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
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
                className={`${cls} cursor-not-allowed text-on-surface-variant/40`}
              >
                {inner}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={`${cls} ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {inner}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
