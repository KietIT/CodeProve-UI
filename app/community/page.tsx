"use client";

import Link from "next/link";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

// ── Mock community data (UI-first; wire to a backend later) ──────────────────
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

type Thread = {
  author: string;
  tag: string;
  replies: number;
  likes: number;
  title: { vi: string; en: string };
  time: { vi: string; en: string };
};

const THREADS: Thread[] = [
  {
    author: "Phạm Gia Hân", tag: "Algorithms", replies: 24, likes: 58,
    title: { vi: "Làm sao giải thích rõ bất biến của sliding window khi explain-back?", en: "How do you articulate the sliding-window invariant during explain-back?" },
    time: { vi: "2 giờ trước", en: "2 hours ago" },
  },
  {
    author: "Lê Bảo Anh", tag: "Debugging", replies: 17, likes: 42,
    title: { vi: "Mẹo đặt giả thuyết trước khi sửa bug off-by-one", en: "My approach to hypothesising before fixing off-by-one bugs" },
    time: { vi: "5 giờ trước", en: "5 hours ago" },
  },
  {
    author: "Nguyễn Đức Long", tag: "API security", replies: 31, likes: 73,
    title: { vi: "Vì sao Ciel hay 'gài' lỗi ở bài JWT — và cách mình bắt được", en: "Why Ciel plants a bug in the JWT task — and how I caught it" },
    time: { vi: "hôm qua", en: "yesterday" },
  },
  {
    author: "Vũ Thảo My", tag: "Concurrency", replies: 12, likes: 29,
    title: { vi: "Thảo luận: lock ordering để phá deadlock có phải luôn tối ưu?", en: "Discussion: is lock ordering always the best deadlock fix?" },
    time: { vi: "2 ngày trước", en: "2 days ago" },
  },
  {
    author: "Đỗ Quang Huy", tag: "Algorithms", replies: 9, likes: 21,
    title: { vi: "Chia sẻ prompt giúp mình tăng trục Prompting lên 90%", en: "The prompts that pushed my Prompting axis to 90%" },
    time: { vi: "3 ngày trước", en: "3 days ago" },
  },
];

const TOPICS = [
  { name: "Algorithms", count: 128 },
  { name: "Debugging", count: 94 },
  { name: "API security", count: 61 },
  { name: "Concurrency", count: 47 },
  { name: "Explain-back", count: 38 },
];

const copy = {
  vi: {
    eyebrow: "Cộng đồng",
    title: "Cộng đồng CodeProve",
    subtitle: "Học cách tư duy cùng AI từ những người dùng khác — thảo luận, chia sẻ và thi đua.",
    members: "Thành viên",
    postsToday: "Bài hôm nay",
    online: "Đang online",
    leaderboard: "Bảng xếp hạng",
    leaderboardSub: "Top người dùng theo điểm năng lực",
    topThree: "Top 3 tuần này",
    rank: "Hạng",
    member: "Thành viên",
    points: "điểm",
    streak: "chuỗi ngày",
    discussions: "Thảo luận",
    discussionsSub: "Chủ đề mới nhất từ cộng đồng",
    newPost: "Đăng bài",
    replies: "phản hồi",
    popularTopics: "Chủ đề nổi bật",
    yourRank: "Hạng của bạn",
    yourRankSub: "Hoàn thành bài tập đã chấm để leo hạng.",
    startPracticing: "Bắt đầu luyện tập",
    backProfile: "Về hồ sơ",
    threads: "chủ đề",
  },
  en: {
    eyebrow: "Community",
    title: "CodeProve Community",
    subtitle: "Learn how to think with AI from other builders — discuss, share and compete.",
    members: "Members",
    postsToday: "Posts today",
    online: "Online now",
    leaderboard: "Leaderboard",
    leaderboardSub: "Top users by fluency score",
    topThree: "Top 3 this week",
    rank: "Rank",
    member: "Member",
    points: "pts",
    streak: "day streak",
    discussions: "Discussions",
    discussionsSub: "Latest threads from the community",
    newPost: "New post",
    replies: "replies",
    popularTopics: "Popular topics",
    yourRank: "Your rank",
    yourRankSub: "Complete scored exercises to climb the ranks.",
    startPracticing: "Start practicing",
    backProfile: "Back to profile",
    threads: "threads",
  },
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Podium order: 2nd, 1st, 3rd — 1st sits center and tallest.
const PODIUM = [
  { m: LEADERBOARD[1], place: 2, h: "h-24", ring: "ring-slate-300/60", medal: "military_tech" },
  { m: LEADERBOARD[0], place: 1, h: "h-32", ring: "ring-amber-400/70", medal: "trophy" },
  { m: LEADERBOARD[2], place: 3, h: "h-20", ring: "ring-orange-400/60", medal: "military_tech" },
];

export default function CommunityPage() {
  const { locale } = useI18n();
  const t = copy[locale];
  const { user } = useAuth();

  const stats = [
    { icon: "group", label: t.members, value: "3,142" },
    { icon: "forum", label: t.postsToday, value: "87" },
    { icon: "bolt", label: t.online, value: "214" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-10 md:px-12">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/profile" className="mb-3 inline-flex items-center gap-1 font-label-mono text-label-mono text-on-surface-variant/70 transition-colors hover:text-primary">
              <Sym name="arrow_back" className="text-[15px]" /> {t.backProfile}
            </Link>
            <span className="block font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">{t.eyebrow}</span>
            <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">{t.title}</h1>
            <p className="mt-3 max-w-xl text-on-surface-variant">{t.subtitle}</p>
          </div>
        </header>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="ice-card flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sym name={s.icon} className="text-[22px]" />
              </span>
              <div>
                <div className="font-headline-lg-mobile text-headline-lg-mobile leading-none">{s.value}</div>
                <div className="mt-1 font-label-mono text-label-mono uppercase text-on-surface-variant/70">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left: leaderboard */}
          <section className="ice-card p-6 xl:col-span-5">
            <div className="mb-5 flex items-center justify-between border-b border-outline-variant/50 pb-4">
              <div>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{t.leaderboard}</h2>
                <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">{t.leaderboardSub}</p>
              </div>
              <Sym name="leaderboard" className="text-primary" />
            </div>

            {/* Top-3 podium */}
            <div className="mb-6 flex items-end justify-center gap-3">
              {PODIUM.map(({ m, place, h, ring, medal }) => (
                <div key={place} className="flex flex-1 flex-col items-center">
                  <div className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary-container text-sm font-bold text-on-primary ring-2 ${ring} ring-offset-2 ring-offset-background`}>
                    {initials(m.name)}
                    <Sym name={medal} fill className={`absolute -top-3 text-[18px] ${place === 1 ? "text-amber-400" : place === 2 ? "text-slate-300" : "text-orange-400"}`} />
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
                      <Sym name="local_fire_department" className="align-middle text-[13px] text-amber-500" /> {m.streak}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Middle: discussions */}
          <section className="ice-card flex flex-col p-6 xl:col-span-4">
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant/50 pb-4">
              <div>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{t.discussions}</h2>
                <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">{t.discussionsSub}</p>
              </div>
              <button className="flex cursor-pointer items-center gap-1.5 bg-primary px-3 py-1.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90">
                <Sym name="edit" className="text-[15px]" /> {t.newPost}
              </button>
            </div>
            <div className="flex flex-col divide-y divide-outline-variant/40">
              {THREADS.map((th, i) => (
                <button key={i} className="group flex cursor-pointer flex-col gap-2 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-surface-container-highest text-[10px] font-bold text-on-surface-variant">
                      {initials(th.author)}
                    </span>
                    <span className="truncate font-label-mono text-label-mono text-on-surface-variant/80">{th.author}</span>
                    <span className="rounded-pill bg-primary/10 px-2 py-0.5 font-label-mono text-[11px] text-primary">{th.tag}</span>
                    <span className="ml-auto font-label-mono text-[11px] text-on-surface-variant/50">{th.time[locale]}</span>
                  </div>
                  <p className="text-sm font-medium leading-snug text-on-surface transition-colors group-hover:text-primary">
                    {th.title[locale]}
                  </p>
                  <div className="flex items-center gap-4 font-label-mono text-[11px] text-on-surface-variant/60">
                    <span className="flex items-center gap-1"><Sym name="chat_bubble" className="text-[14px]" /> {th.replies} {t.replies}</span>
                    <span className="flex items-center gap-1"><Sym name="favorite" className="text-[14px]" /> {th.likes}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Right: sidebar */}
          <aside className="space-y-6 xl:col-span-3">
            <section className="ice-card p-6">
              <h3 className="mb-3 flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
                <Sym name="tag" className="text-[16px]" /> {t.popularTopics}
              </h3>
              <ul className="space-y-1">
                {TOPICS.map((tp) => (
                  <li key={tp.name}>
                    <button className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">
                      <span>{tp.name}</span>
                      <span className="font-label-mono text-[11px] text-on-surface-variant/50">{tp.count} {t.threads}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

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
      </main>

      <AppFooter />
    </div>
  );
}
