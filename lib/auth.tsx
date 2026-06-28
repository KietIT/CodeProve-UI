"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch, clearToken, getToken, setToken, updateMe } from "@/lib/api";

type User = { id: number; full_name: string; email: string };
type AuthOut = { user: User; access_token: string };
type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (full_name: string, email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  updateProfile: (full_name: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    (async () => {
      try {
        setUser(await apiFetch<User>("/auth/me"));
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const out = await apiFetch<AuthOut>("/auth/login", { method: "POST", body: { email, password }, auth: false });
    setToken(out.access_token); setUser(out.user);
  }
  async function signup(full_name: string, email: string, password: string) {
    const out = await apiFetch<AuthOut>("/auth/signup", { method: "POST", body: { full_name, email, password }, auth: false });
    setToken(out.access_token); setUser(out.user);
  }
  const loginWithToken = useCallback(async (token: string) => {
    setToken(token);
    setUser(await apiFetch<User>("/auth/me"));
  }, []);
  async function updateProfile(full_name: string) {
    const updated = await updateMe(full_name);
    setUser(updated);
  }
  function logout() { clearToken(); setUser(null); }

  return <Ctx.Provider value={{ user, loading, login, signup, loginWithToken, updateProfile, logout }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
