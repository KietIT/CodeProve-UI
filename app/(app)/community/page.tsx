"use client";

import { useEffect, useState } from "react";
import { Sym } from "@/components/app/AppChrome";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

// Mock discussions (UI-first). The user's own posts are real but local
// (localStorage) until a community backend exists.
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
    title: { vi: "Vì sao Ciel hay 'gài' lỗi ở bài JWT - và cách mình bắt được", en: "Why Ciel plants a bug in the JWT task - and how I caught it" },
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
    eyebrow: "Cộng đồng", title: "Cộng đồng CodeProve",
    subtitle: "Học cách tư duy cùng AI từ những người dùng khác - thảo luận, chia sẻ và thi đua.",
    members: "Thành viên", postsToday: "Bài hôm nay", online: "Đang online",
    discussions: "Thảo luận", discussionsSub: "Chủ đề mới nhất từ cộng đồng",
    newPost: "Đăng bài", replies: "phản hồi", popularTopics: "Chủ đề nổi bật",
    threads: "chủ đề", composePlaceholder: "Bạn muốn thảo luận điều gì?",
    post: "Đăng", cancel: "Huỷ", justNow: "vừa xong",
    noThreads: "Chưa có thảo luận nào cho chủ đề này.", allTopics: "Tất cả chủ đề",
  },
  en: {
    eyebrow: "Community", title: "CodeProve Community",
    subtitle: "Learn how to think with AI from other builders - discuss, share and compete.",
    members: "Members", postsToday: "Posts today", online: "Online now",
    discussions: "Discussions", discussionsSub: "Latest threads from the community",
    newPost: "New post", replies: "replies", popularTopics: "Popular topics",
    threads: "threads", composePlaceholder: "What do you want to discuss?",
    post: "Post", cancel: "Cancel", justNow: "just now",
    noThreads: "No discussions for this topic yet.", allTopics: "All topics",
  },
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const POSTS_KEY = "codeprove-community-posts";

export default function CommunityPage() {
  const { locale } = useI18n();
  const t = copy[locale];
  const { user } = useAuth();

  const [userThreads, setUserThreads] = useState<Thread[]>([]);
  const [composing, setComposing] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postTag, setPostTag] = useState<string>(TOPICS[0].name);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(POSTS_KEY);
      if (raw) setUserThreads(JSON.parse(raw) as Thread[]);
    } catch {
      // Corrupt storage: start empty rather than crash.
    }
  }, []);

  function publishPost() {
    const title = postTitle.trim();
    if (!title) return;
    const thread: Thread = {
      author: user?.full_name ?? "CodeProve User",
      tag: postTag,
      replies: 0,
      likes: 0,
      title: { vi: title, en: title },
      time: { vi: copy.vi.justNow, en: copy.en.justNow },
    };
    const next = [thread, ...userThreads];
    setUserThreads(next);
    try {
      window.localStorage.setItem(POSTS_KEY, JSON.stringify(next));
    } catch {
      // Storage full/blocked: the post still shows this session.
    }
    setPostTitle("");
    setComposing(false);
  }

  const allThreads = [...userThreads, ...THREADS];
  const visibleThreads = topicFilter ? allThreads.filter((th) => th.tag === topicFilter) : allThreads;

  const stats = [
    { icon: "group", label: t.members, value: "3,142" },
    { icon: "forum", label: t.postsToday, value: "87" },
    { icon: "bolt", label: t.online, value: "214" },
  ];

  return (
    <div className="mx-auto w-full max-w-container-max px-5 py-10 md:px-12">
      <header className="mb-8">
        <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">{t.eyebrow}</span>
        <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">{t.title}</h1>
        <p className="mt-3 max-w-xl text-on-surface-variant">{t.subtitle}</p>
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
        {/* Discussions */}
        <section className="ice-card flex flex-col p-6 xl:col-span-8">
          <div className="mb-4 flex items-center justify-between border-b border-outline-variant/50 pb-4">
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{t.discussions}</h2>
              <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">{t.discussionsSub}</p>
            </div>
            <button
              onClick={() => setComposing((v) => !v)}
              className="flex cursor-pointer items-center gap-1.5 bg-primary px-3 py-1.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
            >
              <Sym name="edit" className="text-[15px]" /> {t.newPost}
            </button>
          </div>

          {composing && (
            <div className="mb-4 border border-outline-variant/60 bg-surface-container-high/40 p-3">
              <textarea
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder={t.composePlaceholder}
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {TOPICS.map((tp) => (
                  <button
                    key={tp.name}
                    onClick={() => setPostTag(tp.name)}
                    className={`cursor-pointer rounded-pill px-2 py-0.5 font-label-mono text-[11px] transition-colors ${
                      postTag === tp.name ? "bg-primary/15 text-primary" : "bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {tp.name}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => { setComposing(false); setPostTitle(""); }}
                    className="cursor-pointer px-3 py-1 font-label-mono text-[11px] uppercase text-on-surface-variant hover:text-on-surface"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={publishPost}
                    disabled={!postTitle.trim()}
                    className="cursor-pointer bg-primary px-3 py-1 font-label-mono text-[11px] uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {t.post}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col divide-y divide-outline-variant/40">
            {visibleThreads.length === 0 && (
              <p className="py-6 text-center text-sm text-on-surface-variant/60">{t.noThreads}</p>
            )}
            {visibleThreads.map((th, i) => (
              <article key={i} className="flex flex-col gap-2 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-surface-container-highest text-[10px] font-bold text-on-surface-variant">
                    {initials(th.author)}
                  </span>
                  <span className="truncate font-label-mono text-label-mono text-on-surface-variant/80">{th.author}</span>
                  <span className="rounded-pill bg-primary/10 px-2 py-0.5 font-label-mono text-[11px] text-primary">{th.tag}</span>
                  <span className="ml-auto font-label-mono text-[11px] text-on-surface-variant/50">{th.time[locale]}</span>
                </div>
                <p className="text-sm font-medium leading-snug text-on-surface">{th.title[locale]}</p>
                <div className="flex items-center gap-4 font-label-mono text-[11px] text-on-surface-variant/60">
                  <span className="flex items-center gap-1"><Sym name="chat_bubble" className="text-[14px]" /> {th.replies} {t.replies}</span>
                  <span className="flex items-center gap-1"><Sym name="favorite" className="text-[14px]" /> {th.likes}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Topics filter */}
        <aside className="xl:col-span-4">
          <section className="ice-card p-6">
            <h3 className="mb-3 flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
              <Sym name="tag" className="text-[16px]" /> {t.popularTopics}
            </h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setTopicFilter(null)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors ${
                    topicFilter === null ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <span>{t.allTopics}</span>
                </button>
              </li>
              {TOPICS.map((tp) => (
                <li key={tp.name}>
                  <button
                    onClick={() => setTopicFilter((cur) => (cur === tp.name ? null : tp.name))}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors ${
                      topicFilter === tp.name ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    <span>{tp.name}</span>
                    <span className="font-label-mono text-[11px] text-on-surface-variant/50">{tp.count} {t.threads}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
