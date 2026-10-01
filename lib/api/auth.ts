import { apiFetch } from "./client";
import type { AuthOut, Me } from "@/lib/types/auth";

export const login = (email: string, password: string): Promise<AuthOut> =>
  apiFetch<AuthOut>("/auth/login", { method: "POST", body: { email, password }, auth: false });

/** Only called once the student ticked the privacy checkbox: the backend refuses `accept_privacy: false`. */
export const signup = (full_name: string, email: string, password: string): Promise<AuthOut> =>
  apiFetch<AuthOut>("/auth/signup", {
    method: "POST",
    body: { full_name, email, password, accept_privacy: true },
    auth: false,
  });

export const getMe = (): Promise<Me> => apiFetch<Me>("/auth/me");

export const updateMe = (data: { full_name?: string; avatar?: string | null }): Promise<Me> =>
  apiFetch<Me>("/auth/me", { method: "PATCH", body: data });
