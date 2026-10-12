"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  login as apiLogin,
  signup as apiSignup,
  getMe,
  updateMe,
  clearToken,
  getToken,
  setToken,
} from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { User } from "@/lib/types/auth";
type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (full_name: string, email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar?: string | null }) => Promise<void>;
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
        setUser(await getMe());
      } catch (err) {
        // Only a rejected token signs the student out. A network error or a restarting backend keeps the
        // token and asks once more, so a short outage does not log everyone out.
        if (err instanceof ApiError && err.status === 401) clearToken();
        else {
          await new Promise((r) => setTimeout(r, 1500));
          try {
            setUser(await getMe());
          } catch (again) {
            if (again instanceof ApiError && again.status === 401) clearToken();
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const out = await apiLogin(email, password);
    setToken(out.access_token); setUser(out.user);
  }
  async function signup(full_name: string, email: string, password: string) {
    const out = await apiSignup(full_name, email, password);
    setToken(out.access_token); setUser(out.user);
  }
  const loginWithToken = useCallback(async (token: string) => {
    setToken(token);
    setUser(await getMe());
  }, []);
  async function updateProfile(data: { full_name?: string; avatar?: string | null }) {
    const updated = await updateMe(data);
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
