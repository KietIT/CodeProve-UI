import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminAuthProvider } from "./admin/_auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminAreaLayout({ children }: { children: ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
