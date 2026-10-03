"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { adminRequest, type AdminAccount } from "@/lib/adminClient";

export { adminRequest } from "@/lib/adminClient";
export type { AdminAccount } from "@/lib/adminClient";

type AdminAuthValue = {
  admin: AdminAccount | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminAccount>;
  changePassword: (current: string, next: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Context = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const authEpoch = useRef(0);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const epoch = authEpoch.current;
      try {
        const account = await adminRequest<AdminAccount>("/auth/admin/me");
        if (mounted && epoch === authEpoch.current) setAdmin(account);
      } catch {
        if (mounted && epoch === authEpoch.current) setAdmin(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 60_000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  async function login(email: string, password: string) {
    const account = await adminRequest<AdminAccount>("/auth/admin/login", { method: "POST", body: { email, password } });
    authEpoch.current += 1;
    setAdmin(account);
    return account;
  }

  async function changePassword(current: string, next: string) {
    const account = await adminRequest<AdminAccount>("/auth/admin/change-password", {
      method: "POST", body: { current_password: current, new_password: next },
    });
    authEpoch.current += 1;
    setAdmin(account);
  }

  async function logout() {
    authEpoch.current += 1;
    try { await adminRequest<void>("/auth/admin/logout", { method: "POST" }); }
    finally { setAdmin(null); }
  }

  return <Context.Provider value={{ admin, loading, login, changePassword, logout }}>{children}</Context.Provider>;
}

export function useAdminAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return value;
}
