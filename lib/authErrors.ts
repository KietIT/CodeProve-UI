import { ApiError } from "@/lib/api/client";

/** Auth failures the UI explains in its own words instead of showing the raw backend text. */
export type AuthErrorCode = "email_taken" | "phone_taken" | "invalid_login" | "invalid_phone" | "invalid_identifier";

/** Form field a code belongs to, so the message sits next to the right input. */
export const authErrorField: Record<AuthErrorCode, "email" | "phone" | null> = {
  email_taken: "email",
  phone_taken: "phone",
  invalid_login: null,
  invalid_phone: "phone",
  invalid_identifier: "email",
};

/** The pydantic field names a 422 `detail` array complains about. */
function invalidFields(detail: unknown): string[] {
  if (!Array.isArray(detail)) return [];
  return detail.flatMap((item) => {
    const loc = item && typeof item === "object" ? (item as { loc?: unknown }).loc : undefined;
    const field = Array.isArray(loc) ? loc[loc.length - 1] : undefined;
    return typeof field === "string" ? [field] : [];
  });
}

/** Maps an error from signup, login or `PATCH /auth/me` to a known code, or `null` for anything else. */
export function authErrorOf(err: unknown): AuthErrorCode | null {
  if (!(err instanceof ApiError)) return null;
  if (err.status === 409 && err.detail === "Email already registered") return "email_taken";
  if (err.status === 409 && err.detail === "Phone number already registered") return "phone_taken";
  if (err.status === 401 && err.detail === "Invalid email, phone number or password") return "invalid_login";
  if (err.status === 422) {
    const fields = invalidFields(err.detail);
    if (fields.includes("phone")) return "invalid_phone";
    if (fields.includes("identifier")) return "invalid_identifier";
  }
  return null;
}
