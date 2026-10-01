import { apiFetch } from "./client";
import type { PrivacyState } from "@/lib/types/privacy";

export const getPrivacy = (): Promise<PrivacyState> => apiFetch<PrivacyState>("/me/privacy");

/** `version` must be the `current_version` the student was shown, or the backend answers 409. */
export const acceptPrivacy = (version: string): Promise<PrivacyState> =>
  apiFetch<PrivacyState>("/me/privacy/consent", { method: "POST", body: { version } });

export const updatePrivacy = (data: { ai_personalization: boolean }): Promise<PrivacyState> =>
  apiFetch<PrivacyState>("/me/privacy", { method: "PATCH", body: data });
