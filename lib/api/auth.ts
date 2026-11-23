import { apiFetch } from "./client";
import type { AuthOut, Me } from "@/lib/types/auth";

/** `identifier` is an email or a Vietnamese phone number; the backend tells them apart by the `@`. */
export const login = (identifier: string, password: string): Promise<AuthOut> =>
  apiFetch<AuthOut>("/auth/login", { method: "POST", body: { identifier, password }, auth: false });

export type SignupInput = { full_name: string; email: string; phone: string; password: string };

/** Only called once the student ticked the privacy checkbox: the backend refuses `accept_privacy: false`. */
export const signup = ({ full_name, email, phone, password }: SignupInput): Promise<AuthOut> =>
  apiFetch<AuthOut>("/auth/signup", {
    method: "POST",
    body: { full_name, email, phone, password, accept_privacy: true },
    auth: false,
  });

export const getMe = (): Promise<Me> => apiFetch<Me>("/auth/me");

/** `phone` can be added or changed but not removed: the backend treats a missing one as unchanged. */
export type UpdateMeInput = { full_name?: string; avatar?: string | null; phone?: string };

export const updateMe = (data: UpdateMeInput): Promise<Me> =>
  apiFetch<Me>("/auth/me", { method: "PATCH", body: data });
