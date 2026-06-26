"use client";

import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className="inline-flex items-center rounded-pill border border-border bg-surface/60 p-0.5 font-mono text-xs"
      role="group"
      aria-label="Language"
    >
      {(["vi", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`cursor-pointer rounded-[9px] px-2.5 py-1 uppercase tracking-wider transition-colors duration-200 ${
            locale === l
              ? "bg-teal text-[#04211e]"
              : "text-muted hover:text-content"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-pill border border-border bg-surface/60 text-muted transition-colors duration-200 hover:border-teal/60 hover:text-content"
    >
      {theme === "dark" ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
