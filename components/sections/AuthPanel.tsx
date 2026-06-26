"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Github,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { HeroPoster } from "@/components/three/HeroPoster";
import { useI18n } from "@/lib/i18n";

type Mode = "login" | "signup";

/** Bilingual copy kept inline (mirrors the AuthStub pattern) so the auth screen
 *  stays self-contained without bloating the global content dictionary. */
const copy = {
  vi: {
    brand: {
      eyebrow: "AI FLUENCY · CODEPROVE",
      title: "Chứng minh bạn biết dùng AI đúng cách.",
      sub: "Đo cách bạn tư duy cùng AI - không chỉ dòng code cuối cùng.",
      bullets: [
        "6 trục năng lực, chấm điểm minh bạch",
        "Ciel đồng hành - gợi ý, không làm hộ",
        "Hồ sơ năng lực có thể chứng minh",
      ],
    },
    login: {
      title: "Đăng nhập",
      sub: "Tiếp tục hành trình chứng minh năng lực AI của bạn.",
      cta: "Đăng nhập",
      switchLabel: "Chưa có tài khoản?",
      switchCta: "Đăng ký",
      switchHref: "/signup",
    },
    signup: {
      title: "Tạo tài khoản",
      sub: "Bắt đầu đo và phát triển năng lực dùng AI của bạn.",
      cta: "Bắt đầu",
      switchLabel: "Đã có tài khoản?",
      switchCta: "Đăng nhập",
      switchHref: "/login",
    },
    fields: {
      name: "Họ và tên",
      namePlaceholder: "Nguyễn Văn A",
      email: "Email",
      emailPlaceholder: "ban@truong.edu.vn",
      password: "Mật khẩu",
      passwordPlaceholder: "Tối thiểu 8 ký tự",
      confirmPassword: "Xác nhận mật khẩu",
      confirmPasswordPlaceholder: "Nhập lại mật khẩu",
      showPassword: "Hiện mật khẩu",
      hidePassword: "Ẩn mật khẩu",
      forgot: "Quên mật khẩu?",
      remember: "Ghi nhớ đăng nhập",
    },
    social: { divider: "hoặc tiếp tục với", google: "Google", github: "GitHub" },
    errors: {
      email: "Vui lòng nhập email hợp lệ.",
      password: "Mật khẩu cần tối thiểu 8 ký tự.",
      confirm: "Mật khẩu xác nhận không khớp.",
      name: "Vui lòng nhập họ tên.",
    },
    terms: "Bằng việc tiếp tục, bạn đồng ý với",
    termsLink: "Điều khoản",
    termsAnd: "và",
    privacyLink: "Chính sách bảo mật",
    backHome: "Về trang chủ",
  },
  en: {
    brand: {
      eyebrow: "AI FLUENCY · CODEPROVE",
      title: "Prove you know how to use AI right.",
      sub: "We measure how you think with AI - not just the final code.",
      bullets: [
        "6 competency axes, transparent scoring",
        "Ciel guides you - never does it for you",
        "A provable competency profile",
      ],
    },
    login: {
      title: "Log in",
      sub: "Continue your AI-fluency journey.",
      cta: "Log in",
      switchLabel: "No account yet?",
      switchCta: "Sign up",
      switchHref: "/signup",
    },
    signup: {
      title: "Create account",
      sub: "Start measuring and growing your AI fluency.",
      cta: "Get started",
      switchLabel: "Already have an account?",
      switchCta: "Log in",
      switchHref: "/login",
    },
    fields: {
      name: "Full name",
      namePlaceholder: "Jane Doe",
      email: "Email",
      emailPlaceholder: "you@school.edu",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Re-enter password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      forgot: "Forgot password?",
      remember: "Remember me",
    },
    social: { divider: "or continue with", google: "Google", github: "GitHub" },
    errors: {
      email: "Please enter a valid email.",
      password: "Password must be at least 8 characters.",
      confirm: "Passwords do not match.",
      name: "Please enter your name.",
    },
    terms: "By continuing, you agree to our",
    termsLink: "Terms",
    termsAnd: "and",
    privacyLink: "Privacy Policy",
    backHome: "Back to home",
  },
} as const;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export function AuthPanel({ mode }: { mode: Mode }) {
  const { locale } = useI18n();
  const router = useRouter();
  const reduce = useReducedMotion();
  const c = copy[locale];
  const m = c[mode];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (mode === "signup" && name.trim().length < 2) next.name = c.errors.name;
    if (!emailRe.test(email)) next.email = c.errors.email;
    if (password.length < 8) next.password = c.errors.password;
    if (mode === "signup" && confirmPassword !== password) next.confirm = c.errors.confirm;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Demo flow: this marketing site has no auth backend yet, so we simulate a
    // request then route into the app. Wire to the real API in production.
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    router.push("/dashboard");
  }

  return (
    <section className="grid min-h-[100svh] place-items-center px-4 pb-12 pt-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card grid w-full max-w-5xl overflow-hidden lg:grid-cols-[1.05fr_1fr]"
      >
        {/* ── Left: brand panel ── */}
        <aside className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
          {/* Blue brand gradient + aura */}
          {/* Brand panel stays a saturated dark-blue in BOTH themes so the white
              copy always reads cleanly (theme vars turned pale in light mode). */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(150deg, #0055ff 0%, #004dea 55%, #00b6d4 130%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute -left-24 top-1/3 h-72 w-72 rounded-full opacity-50 blur-3xl"
            style={{ background: "rgb(0 241 254 / 0.45)" }}
            aria-hidden="true"
          />
          <div className="bg-grid absolute inset-0 opacity-20" aria-hidden="true" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-pill border border-white/25 bg-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/90 backdrop-blur">
              {c.brand.eyebrow}
            </span>
          </div>

          <div className="relative -my-6 grid place-items-center">
            <div className="w-[22rem] max-w-full opacity-95 mix-blend-screen">
              <HeroPoster />
            </div>
          </div>

          <div className="relative">
            <h2 className="max-w-sm text-2xl font-bold leading-tight tracking-tight text-white">
              {c.brand.title}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">
              {c.brand.sub}
            </p>
            <ul className="mt-6 space-y-2.5">
              {c.brand.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-white/85">
                  <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-white/20 text-white">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" aria-hidden="true">
                      <path
                        d="m5 13 4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Right: form ── */}
        <div className="bg-surface/40 px-6 py-9 backdrop-blur-sm sm:px-10 sm:py-11">
          <div className="mx-auto w-full max-w-sm">
            {/* Logo mark */}
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="CodeProve home">
              <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
                <defs>
                  <linearGradient id="auth-logo-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0041c8" />
                    <stop offset="55%" stopColor="#0055ff" />
                    <stop offset="100%" stopColor="#6ea8ff" />
                  </linearGradient>
                </defs>
                <path
                  d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25z"
                  fill="none"
                  stroke="url(#auth-logo-grad)"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 9 22 12.5v7L16 23l-6-3.5v-7z"
                  fill="rgba(0,85,255,0.14)"
                  stroke="#0055ff"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="16" r="2.4" fill="#0055ff" />
              </svg>
              <span className="text-[17px] font-semibold tracking-tight text-content">
                Code<span className="text-teal">Prove</span>
              </span>
            </Link>

            <h1 className="mt-7 text-2xl font-bold tracking-tight sm:text-3xl">{m.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">{m.sub}</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
              {mode === "signup" && (
                <Field
                  id="name"
                  label={c.fields.name}
                  icon={<User className="h-4 w-4" />}
                  error={errors.name}
                >
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={c.fields.namePlaceholder}
                    className={inputCls}
                  />
                </Field>
              )}

              <Field
                id="email"
                label={c.fields.email}
                icon={<Mail className="h-4 w-4" />}
                error={errors.email}
              >
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={c.fields.emailPlaceholder}
                  className={inputCls}
                />
              </Field>

              <Field
                id="password"
                label={c.fields.password}
                icon={<Lock className="h-4 w-4" />}
                error={errors.password}
                action={
                  mode === "login" ? (
                    <Link
                      href="#"
                      className="text-xs font-medium text-teal transition-colors hover:opacity-80"
                    >
                      {c.fields.forgot}
                    </Link>
                  ) : undefined
                }
              >
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={c.fields.passwordPlaceholder}
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? c.fields.hidePassword : c.fields.showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted transition-colors hover:text-content"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>

              {mode === "signup" && (
                <Field
                  id="confirmPassword"
                  label={c.fields.confirmPassword}
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.confirm}
                >
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={c.fields.confirmPasswordPlaceholder}
                    className={inputCls}
                  />
                </Field>
              )}

              {mode === "login" && (
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-border bg-bg/60 text-primary accent-primary focus:ring-2 focus:ring-primary/25"
                  />
                  {c.fields.remember}
                </label>
              )}

              <Button type="submit" size="lg" className="mt-2 w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {m.cta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted">{c.social.divider}</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            {/* SSO */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className={ssoCls}>
                <GoogleIcon className="h-4 w-4" />
                {c.social.google}
              </button>
              <button type="button" className={ssoCls}>
                <Github className="h-4 w-4" />
                {c.social.github}
              </button>
            </div>

            {/* Switch + back */}
            <p className="mt-7 text-center text-sm text-muted">
              {m.switchLabel}{" "}
              <Link href={m.switchHref} className="font-semibold text-teal transition-colors hover:opacity-80">
                {m.switchCta}
              </Link>
            </p>
            <p className="mt-2 text-center text-[11px] leading-relaxed text-muted/70">
              {c.terms}{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-content">
                {c.termsLink}
              </Link>{" "}
              {c.termsAnd}{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-content">
                {c.privacyLink}
              </Link>
              .
            </p>

            <div className="mt-5 text-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-muted transition-colors hover:text-content"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {c.backHome}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

const inputCls =
  "h-12 w-full rounded-pill border border-border bg-bg/60 pl-11 pr-4 text-sm text-content placeholder:text-muted/60 outline-none transition-all focus:border-primary/70 focus:ring-2 focus:ring-primary/25";

const ssoCls =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill border border-border bg-surface/60 text-sm font-medium text-content transition-all hover:border-primary/50 hover:bg-surface";

/** Labeled input shell with a leading icon, optional right action and error row. */
function Field({
  id,
  label,
  icon,
  error,
  action,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-content">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          {icon}
        </span>
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
}
