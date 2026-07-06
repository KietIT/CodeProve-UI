"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageToggle, ThemeToggle } from "@/components/ui/Toggles";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

// Deliberately not the marketing Navbar (its nav links are homepage anchors
// like /#about, irrelevant here) and not the authenticated app-shell's
// AppTopNav (pulls in the Material Symbols font and workspace-specific
// links this single utility page doesn't need) - see spec section 8.
export function DailyHeader() {
  const { user } = useAuth();
  const { t } = useI18n();
  const d = t.dailyBugHunt;

  return (
    <header className="border-b border-border">
      <div className="container-site flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="cursor-pointer rounded-pill border border-border bg-surface/60 px-3 py-2 text-sm text-content transition-colors duration-200 hover:border-teal/60"
            >
              {d.backToDashboard}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="cursor-pointer rounded-pill px-3 py-2 text-sm text-muted transition-colors duration-200 hover:text-content"
              >
                {t.nav.login}
              </Link>
              <Button href="/signup" size="sm">
                {t.nav.signup}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
