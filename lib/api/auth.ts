import { apiFetch } from "./client";
import type { AuthOut, Me } from "@/lib/types/auth";

export const login = (email: string, password: string): Promise<AuthOut> =>
  apiFetch<AuthOut>("/auth/login", { method: "POST", body: { email, password }, auth: false });

export const signup = (full_name: string, email: string, password: string): Promise<AuthOut> =>
  apiFetch<AuthOut>("/auth/signup", { method: "POST", body: { full_name, email, password }, auth: false });

export const getMe = (): Promise<Me> => apiFetch<Me>("/auth/me");

export const updateMe = (data: { full_name?: string; avatar?: string | null }): Promise<Me> =>
  apiFetch<Me>("/auth/me", { method: "PATCH", body: data });
