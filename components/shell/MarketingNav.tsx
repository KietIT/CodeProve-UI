"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageToggle, ThemeToggle } from "@/components/ui/Toggles";
import { useI18n } from "@/lib/i18n";

type NavItem = { label: string; href: string; desc?: string };
type NavMenu = { label: string; items: NavItem[] };

// Nav is authored here (like UserMenu) so it can group the real marketing pages
// into discoverable menus. Root-anchored hrefs (/#...) work from any page.
const NAV = {
  vi: {
    menus: [
      {
        label: "Sản phẩm",
        items: [
          { label: "Dịch vụ", href: "/#service", desc: "Cách CodeProve đánh giá" },
          { label: "Tiêu chí", href: "/#criteria", desc: "Radar 6 trục AI Fluency" },
          { label: "Bug Hunt", href: "/daily", desc: "Thử thách gỡ lỗi mỗi ngày" },
        ],
      },
      {
        label: "Giải pháp",
        items: [
          { label: "Sinh viên", href: "/students", desc: "Chứng minh kỹ năng dùng AI" },
          { label: "Trường học", href: "/universities", desc: "Đánh giá năng lực lớp học" },
          { label: "Nhà tuyển dụng", href: "/employers", desc: "Sàng lọc ứng viên kỹ thuật" },
        ],
      },
    ] as NavMenu[],
    direct: [
      { label: "Bảng giá", href: "/pricing" },
      { label: "Cộng đồng", href: "/community" },
    ] as NavItem[],
  },
  en: {
    menus: [
      {
        label: "Product",
        items: [
          { label: "Service", href: "/#service", desc: "How CodeProve assesses" },
          { label: "Rubric", href: "/#criteria", desc: "The 6-axis AI Fluency radar" },
          { label: "Bug Hunt", href: "/daily", desc: "A daily debugging challenge" },
        ],
      },
      {
        label: "Solutions",
        items: [
          { label: "Students", href: "/students", desc: "Prove your AI skills" },
          { label: "Universities", href: "/universities", desc: "Assess a whole class" },
          { label: "Employers", href: "/employers", desc: "Screen technical candidates" },
        ],
      },
    ] as NavMenu[],
    direct: [
      { label: "Pricing", href: "/pricing" },
      { label: "Community", href: "/community" },
    ] as NavItem[],
  },
} as const;

export function MarketingNav() {
  const { t, locale } = useI18n();
  const nav = NAV[locale];
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile sheet
  const [openMenu, setOpenMenu] = useState<string | null>(null); // desktop dropdown
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close menus on navigation.
  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  // Close the desktop dropdown on outside click / Escape.
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (desktopRef.current && !desktopRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className={`container-site flex h-14 items-center justify-between rounded-pill border px-3 transition-all duration-300 sm:px-4 ${
          scrolled ? "border-border bg-bg/80 shadow-card backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
      >
        <Logo />

        {/* Desktop menu */}
        <div ref={desktopRef} className="hidden items-center gap-1 lg:flex">
          {nav.menus.map((menu) => {
            const isOpen = openMenu === menu.label;
            return (
              <div key={menu.label} className="relative">
                <button
                  onClick={() => setOpenMenu(isOpen ? null : menu.label)}
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  className={`flex cursor-pointer items-center gap-1 rounded-pill px-3 py-2 text-sm transition-colors duration-200 ${
                    isOpen ? "text-content" : "text-muted hover:text-content"
                  }`}
                >
                  {menu.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full mt-2 w-64 rounded-card border border-border bg-bg/95 p-2 shadow-card backdrop-blur-xl"
                  >
                    {menu.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setOpenMenu(null)}
                        className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-surface"
                      >
                        <span className="block text-sm font-medium text-content">{item.label}</span>
                        {item.desc && <span className="mt-0.5 block text-xs text-muted">{item.desc}</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {nav.direct.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="cursor-pointer rounded-pill px-3 py-2 text-sm text-muted transition-colors duration-200 hover:text-content"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop right controls */}
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

      {/* Mobile sheet */}
      {open && (
        <div className="container-site mt-2 max-h-[80vh] overflow-y-auto rounded-card border border-border bg-bg/95 p-4 shadow-card backdrop-blur-xl lg:hidden">
          {nav.menus.map((menu) => (
            <div key={menu.label} className="mb-3">
              <p className="px-3 pb-1 font-mono text-xs uppercase tracking-[0.16em] text-muted">{menu.label}</p>
              {menu.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-pill px-3 py-2.5 text-base text-content transition-colors hover:bg-surface"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="mb-1 flex flex-col gap-1">
            {nav.direct.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-pill px-3 py-2.5 text-base text-content transition-colors hover:bg-surface"
              >
                {item.label}
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
