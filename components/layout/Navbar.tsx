"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageToggle, ThemeToggle } from "@/components/ui/Toggles";
import { useI18n } from "@/lib/i18n";

export function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className={`container-site flex h-14 items-center justify-between rounded-pill border px-3 transition-all duration-300 sm:px-4 ${
          scrolled
            ? "border-border bg-bg/80 shadow-card backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {t.nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer rounded-pill px-3 py-2 text-sm text-muted transition-colors duration-200 hover:text-content"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageToggle />
          <ThemeToggle />
          <Link
            href="/login"
            className="cursor-pointer rounded-pill px-3 py-2 text-sm text-muted transition-colors duration-200 hover:text-content"
          >
            {t.nav.login}
          </Link>
          <Button href="/signup" size="sm">
            {t.nav.signup}
          </Button>
        </div>

        {/* Mobile trigger */}
        <button
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-pill border border-border bg-surface/60 text-content lg:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="container-site mt-2 rounded-card border border-border bg-bg/95 p-4 shadow-card backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {t.nav.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-pill px-3 py-3 text-base text-content transition-colors hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="my-3 h-px bg-border" />
          <div className="flex items-center justify-between">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button href="/signup" className="w-full">
              {t.nav.signup}
            </Button>
            <Button href="/login" variant="secondary" className="w-full">
              {t.nav.login}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
