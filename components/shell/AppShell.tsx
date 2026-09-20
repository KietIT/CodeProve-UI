"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppFooter, MaterialSymbolsFont, Sym, UserMenu } from "@/components/app/AppChrome";
import { LanguageToggle, ThemeToggle } from "@/components/ui/Toggles";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { useAuth } from "@/lib/auth";

/**
 * Authenticated app shell: client-side route guard + sidebar rail + top bar.
 *
 * The guard runs on the client because auth is a localStorage bearer token
 * (no cookie/session), so middleware/server components cannot read it without
 * changing the auth mechanism - out of scope for this refactor. Once /auth/me
 * resolves, an unauthenticated visitor is redirected to /login.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // While auth resolves, or during the redirect, show a minimal placeholder
  // instead of the protected content.
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-surface-variant">
        <MaterialSymbolsFont />
        <Sym name="progress_activity" className="animate-spin text-[32px] text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      <MaterialSymbolsFont />
      <AppSidebar />

      <div className="flex min-h-screen flex-col pl-16">
        <header className="sticky top-0 z-30 flex h-16 flex-none items-center justify-end gap-3 border-b border-outline-variant/60 bg-background/75 px-5 backdrop-blur-xl md:px-8">
          <LanguageToggle />
          <ThemeToggle />
          <UserMenu />
        </header>

        <main className="flex-1">{children}</main>

        <AppFooter />
      </div>
    </div>
  );
}
