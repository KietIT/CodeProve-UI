"use client";

import Link from "next/link";
import { Sym } from "@/components/app/AppChrome";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

// Mock leaderboard (UI-first; wire to a backend ranking endpoint later).
type Member = { name: string; score: number; streak: number; badge: string };

const LEADERBOARD: Member[] = [
  { name: "Trần Minh Khôi", score: 2840, streak: 41, badge: "Kiến trúc sư AI" },
  { name: "Lê Bảo Anh", score: 2610, streak: 33, badge: "Bậc thầy gỡ lỗi" },
  { name: "Phạm Gia Hân", score: 2475, streak: 28, badge: "Thợ săn edge-case" },
  { name: "Nguyễn Đức Long", score: 2190, streak: 22, badge: "Nhà tư duy hệ thống" },
  { name: "Vũ Thảo My", score: 2035, streak: 19, badge: "Chuyên gia kiểm chứng" },
  { name: "Đỗ Quang Huy", score: 1920, streak: 17, badge: "Người khởi đầu vững" },
  { name: "Bùi Khánh Vy", score: 1780, streak: 14, badge: "Người kiên trì" },
];

const PODIUM = [
  { m: LEADERBOARD[1], place: 2, h: "h-24", ring: "ring-muted/60", medal: "military_tech" },
  { m: LEADERBOARD[0], place: 1, h: "h-32", ring: "ring-warning/70", medal: "trophy" },
  { m: LEADERBOARD[2], place: 3, h: "h-20", ring: "ring-warning/60", medal: "military_tech" },
];

const copy = {
  vi: {
    eyebrow: "Xếp hạng",
    title: "Bảng xếp hạng",
    subtitle: "Top người dùng theo điểm năng lực AI Fluency.",
    yourRank: "Hạng của bạn",
    yourRankSub: "Hoàn thành bài tập đã chấm để leo hạng.",
    startPracticing: "Bắt đầu luyện tập",
  },
  en: {
    eyebrow: "Leaderboard",
    title: "Leaderboard",
    subtitle: "Top users by AI Fluency score.",
    yourRank: "Your rank",
    yourRankSub: "Complete scored exercises to climb the ranks.",
    startPracticing: "Start practicing",
  },
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LeaderboardPage() {
  const { locale } = useI18n();
  const t = copy[locale];
  const { user } = useAuth();

  return (
    <div className="mx-auto w-full max-w-container-max px-5 py-10 md:px-12">
      <header className="mb-8">
        <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">{t.eyebrow}</span>
        <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">{t.title}</h1>
        <p className="mt-3 max-w-xl text-on-surface-variant">{t.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="ice-card p-6 xl:col-span-8">
          {/* Top-3 podium */}
          <div className="mb-6 flex items-end justify-center gap-3">
            {PODIUM.map(({ m, place, h, ring, medal }) => (
              <div key={place} className="flex flex-1 flex-col items-center">
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary-container text-sm font-bold text-on-primary ring-2 ${ring} ring-offset-2 ring-offset-background`}>
                  {initials(m.name)}
                  <Sym name={medal} fill className={`absolute -top-3 text-[18px] ${place === 2 ? "text-muted" : "text-warning"}`} />
                </div>
                <p className="mt-2 max-w-[9rem] truncate text-center text-sm font-medium">{m.name}</p>
                <p className="font-label-mono text-label-mono text-primary">{m.score.toLocaleString()}</p>
                <div className={`mt-2 flex w-full ${h} items-start justify-center rounded-t-lg bg-primary/10 pt-2 font-headline-lg-mobile text-headline-lg-mobile text-primary/80`}>
                  {place}
                </div>
              </div>
            ))}
          </div>

          {/* Full list (4th onward) */}
          <ul className="divide-y divide-outline-variant/40">
            {LEADERBOARD.slice(3).map((m, i) => (
              <li key={m.name} className="flex items-center gap-3 py-3">
                <span className="w-6 flex-none text-center font-label-mono text-label-mono text-on-surface-variant/60">{i + 4}</span>
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface-container-highest text-[11px] font-bold text-on-surface-variant">
                  {initials(m.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-on-surface">{m.name}</p>
                  <p className="truncate font-label-mono text-[11px] text-on-surface-variant/60">{m.badge}</p>
                </div>
                <div className="text-right">
                  <p className="font-label-mono text-label-mono text-primary">{m.score.toLocaleString()}</p>
                  <p className="font-label-mono text-[11px] text-on-surface-variant/60">
                    <Sym name="local_fire_department" className="align-middle text-[13px] text-warning" /> {m.streak}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Your rank */}
        <aside className="xl:col-span-4">
          <section className="ice-card p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary-container text-lg font-bold text-on-primary">
              {user ? initials(user.full_name) : "CP"}
            </div>
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile">{t.yourRank}</h3>
            <p className="mt-1 text-sm text-on-surface-variant/70">{t.yourRankSub}</p>
            <Link
              href="/workspace"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
            >
              {t.startPracticing} <Sym name="arrow_forward" className="text-[16px]" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
