import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="CodeProve home"
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0041c8" />
              <stop offset="55%" stopColor="#0055ff" />
              <stop offset="100%" stopColor="#6ea8ff" />
            </linearGradient>
          </defs>
          <path
            d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25z"
            fill="none"
            stroke="url(#logo-grad)"
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
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-content">
        Code<span className="text-teal">Prove</span>
      </span>
    </Link>
  );
}
