import { AppShell } from "@/components/shell/AppShell";

/**
 * Layout for the authenticated app area. Every route under (app) is wrapped in
 * the guarded shell (sidebar + top bar). The (app) group does not change URLs.
 */
export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
