import Link from "next/link";

/**
 * The CodeProve hexagon mark on its own. Shared by the marketing <Logo>, the
 * app sidebar, and mirrored (with baked-in colors) by app/icon.svg for the
 * favicon. `gradientId` must be unique per page if the mark renders twice.
 */
export function LogoMark({
  className = "h-8 w-8",
  gradientId = "logo-grad",
}: {
  className?: string;
  gradientId?: string;
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(var(--color-blueInk))" />
          <stop offset="55%" stopColor="rgb(var(--color-blue))" />
          <stop offset="100%" stopColor="rgb(var(--color-blueLight))" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25z"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M16 9 22 12.5v7L16 23l-6-3.5v-7z"
        fill="rgb(var(--color-blue) / 0.14)"
        stroke="rgb(var(--color-blue))"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2.4" fill="rgb(var(--color-blue))" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="CodeProve home"
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <LogoMark />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-content">
        Code<span className="text-teal">Prove</span>
      </span>
    </Link>
  );
}
