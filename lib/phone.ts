// Vietnamese mobile numbers after the 2018 renumbering: 10 digits, 0 + network prefix 3/5/7/8/9.
// Mirrors the backend's `normalize_phone` so the form rejects what the API would reject.
const VN_MOBILE = /^0[35789]\d{8}$/;
const PHONE_SEPARATORS = /[\s.\-()]/g;

/**
 * Canonical `0xxxxxxxxx` form of a Vietnamese mobile number, or `null` if it is not one.
 * Accepts `0912345678`, `+84912345678`, `84912345678`, with spaces, dots, dashes or brackets.
 */
export function normalizeVnPhone(raw: string): string | null {
  let digits = raw.trim().replace(PHONE_SEPARATORS, "");
  if (digits.startsWith("+84")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("84") && digits.length === 11) digits = `0${digits.slice(2)}`;
  return VN_MOBILE.test(digits) ? digits : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value: string): boolean => EMAIL_RE.test(value.trim());

/**
 * Learner login ID as the backend expects it: an email (anything with `@`) or a phone number.
 * Returns `null` when it is neither a valid email nor a valid Vietnamese mobile number.
 */
export function normalizeLoginId(raw: string): string | null {
  const value = raw.trim();
  if (value.includes("@")) return isEmail(value) ? value : null;
  return normalizeVnPhone(value);
}
