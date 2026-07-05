# Daily Bug Hunt Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/daily` page - a Wordle-style daily challenge where a visitor spots the one bug Ciel planted in a short Python solution, playable with or without an account, consuming the already-implemented backend API on `feat/daily-bug-hunt-backend`.

**Architecture:** A new, deliberately lightweight route `app/daily/page.tsx` (not nested in the `(marketing)` layout, not using the authenticated app-shell's `AppTopNav`) composing a small header and one state-machine component. A typed API client wraps the four backend endpoints; a localStorage module mirrors the backend's streak math client-side for anonymous play, matching `codeprove-backend/app/features/daily/streak.py::compute_streak` exactly so a guest's locally-computed streak never disagrees with what the server computes once they sign up and claim it.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, `lucide-react` icons. No new dependencies.

## Global Constraints

- Backend API contract (already implemented and merged-ready on `feat/daily-bug-hunt-backend`, commit `e924886`): see the four endpoints in Task 1's brief below - copy the field names and types exactly, this plan is not the place to renegotiate them.
- `/daily` must work with **no account** - never gate the page behind login, never assume a token exists.
- Anonymous play history lives in `localStorage` under key `codeprove-daily-streak`; once a signed-in user is detected with unclaimed local history, it is submitted to `POST /api/daily/claim-streak` once and then cleared locally (spec section 5) - do not build a separate "already claimed" flag, clearing the history after a successful claim is the flag.
- This repo has **no test runner** (`package.json` only defines `dev`/`build`/`start`/`lint`). Verification is `npx tsc --noEmit`, `npm run build`, and browser verification via the preview tool - matching the pattern used on the three prior frontend branches (`feat/landing-cro-fixes`, `feat/perf-render-blocking-fonts`, `feat/replace-jetbrains-mono`), all already merged to `main`.
- User-facing strings live in `lib/content.ts` under a new `dailyBugHunt` key, consumed via `useI18n()` - never hardcoded in JSX. The `vi` and `en` blocks of `content.ts` must stay structurally identical (exported type is `(typeof content)["vi"]`).
- Any list rendered inside this feature that could remount on locale switch must use an index-stable `key` - **not** a key derived from translated text (see the fixed bug in `components/sections/HowItWorks.tsx:32` and `components/sections/PersonaPage.tsx:55` for why: a title-based key remounts the item on language switch, resetting a `whileInView` animation's hidden state after it already fired once). This plan's own lists (code lines) already key on line number, not text - keep it that way.
- No em dash (`—`) anywhere - use a plain hyphen `-`.
- Code display uses a real monospace stack (`ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`), pinned via inline style exactly like `components/app/SolveWorkspace.tsx:44-45` does - do not rely on the `font-mono` Tailwind class or the `--font-mono` CSS variable, which now resolves to Inter sans-serif site-wide (see `feat/replace-jetbrains-mono`, already merged).

---

### Task 1: Typed API client for the four Daily Bug Hunt endpoints

**Files:**
- Create: `lib/dailyApi.ts`

**Interfaces:**
- Produces: `type DailyChallenge`, `type DailyResult`, `type DailyAttemptResult`, `type ClaimHistoryItem`; `fetchToday(): Promise<DailyChallenge>`, `submitAttempt(input: { selected_line: number; hints_used: number; time_taken_seconds: number }): Promise<DailyAttemptResult>`, `claimStreak(history: ClaimHistoryItem[]): Promise<{ streak: number }>` - every later task imports these names verbatim.

- [ ] **Step 1: Confirm the backend contract**

Read `codeprove-backend/app/schemas/daily.py` (on branch `feat/daily-bug-hunt-backend`, commit `e924886` or later) and confirm it matches exactly:

```python
class DailyResult(BaseModel):
    correct: bool
    tier: str
    buggy_line: int
    explanation: str
    hints_used: int
    time_taken_seconds: int


class DailyChallengeOut(BaseModel):
    challenge_number: int
    prompt_title: str
    buggy_code: str
    hint_1: str
    hint_2: str
    already_played: bool
    result: DailyResult | None = None


class DailyAttemptIn(BaseModel):
    selected_line: int
    hints_used: int = 0
    time_taken_seconds: int


class DailyAttemptOut(BaseModel):
    correct: bool
    tier: str
    buggy_line: int
    explanation: str
    streak: int | None = None


class ClaimHistoryItem(BaseModel):
    date: str
    selected_line: int
    hints_used: int = 0
    time_taken_seconds: int = 0


class ClaimStreakIn(BaseModel):
    history: list[ClaimHistoryItem] = Field(max_length=60)


class ClaimStreakOut(BaseModel):
    streak: int
```

Note the two different "result" shapes: `DailyResult` (nested in `GET /today`'s response once already played today) has `hints_used`/`time_taken_seconds` but no `streak`; `DailyAttemptOut` (returned by `POST /attempt`) has `streak` but no `hints_used`/`time_taken_seconds` (the client already knows those - it just sent them). Task 6 merges the two shapes into one on-screen result; this task's types must expose both distinctly, not force them into one shape.

If the file differs from the above, STOP and report NEEDS_CONTEXT - do not guess which version is correct.

- [ ] **Step 2: Write the API client**

Create `lib/dailyApi.ts`:

```typescript
import { apiFetch } from "@/lib/api";

export type DailyResult = {
  correct: boolean;
  tier: "green" | "yellow" | "red";
  buggy_line: number;
  explanation: string;
  hints_used: number;
  time_taken_seconds: number;
};

export type DailyChallenge = {
  challenge_number: number;
  prompt_title: string;
  buggy_code: string;
  hint_1: string;
  hint_2: string;
  already_played: boolean;
  result: DailyResult | null;
};

export type DailyAttemptResult = {
  correct: boolean;
  tier: "green" | "yellow" | "red";
  buggy_line: number;
  explanation: string;
  streak: number | null;
};

export type ClaimHistoryItem = {
  date: string;
  selected_line: number;
  hints_used: number;
  time_taken_seconds: number;
};

export async function fetchToday(): Promise<DailyChallenge> {
  return apiFetch<DailyChallenge>("/daily/today");
}

export async function submitAttempt(input: {
  selected_line: number;
  hints_used: number;
  time_taken_seconds: number;
}): Promise<DailyAttemptResult> {
  return apiFetch<DailyAttemptResult>("/daily/attempt", { method: "POST", body: input });
}

export async function claimStreak(history: ClaimHistoryItem[]): Promise<{ streak: number }> {
  return apiFetch<{ streak: number }>("/daily/claim-streak", { method: "POST", body: { history } });
}
```

`apiFetch` (existing, `lib/api.ts:51-68`) already prefixes every path with `${API_BASE}/api`, attaches the bearer token automatically when one exists in `localStorage` and omits it otherwise (`auth` defaults to `true`, and the code only sets the header `if (token)` - it never requires one) - this is exactly the "attach if present, don't require it" behavior `/today` and `/attempt` need, with zero extra branching in this file. `claimStreak` relies on the same default; the backend endpoint requires auth and will 401 if there is no token, which Task 6 avoids by only calling `claimStreak` when a user is confirmed logged in.

- [ ] **Step 3: Verify with the type checker**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no errors (this file has no consumers yet, so it only needs to type-check standalone).

- [ ] **Step 4: Commit**

```bash
git add lib/dailyApi.ts
git commit -m "feat: add typed API client for Daily Bug Hunt endpoints"
```

---

### Task 2: Anonymous-play localStorage helpers (mirrors the backend's streak math)

**Files:**
- Create: `lib/dailyStorage.ts`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `type LocalDailyEntry`, `todayVN(): string`, `loadHistory(): LocalDailyEntry[]`, `saveEntry(entry: LocalDailyEntry): void`, `clearHistory(): void`, `computeLocalStreak(history: LocalDailyEntry[], today: string): number` - Task 6 imports all of these verbatim.

- [ ] **Step 1: Implement the module**

Create `lib/dailyStorage.ts`:

```typescript
export type LocalDailyEntry = {
  date: string; // "YYYY-MM-DD", Asia/Ho_Chi_Minh calendar day - see todayVN()
  selected_line: number;
  hints_used: number;
  time_taken_seconds: number;
  tier: "green" | "yellow" | "red";
};

const HISTORY_KEY = "codeprove-daily-streak";

/** Today's date as "YYYY-MM-DD" in Asia/Ho_Chi_Minh, matching the backend's
 * today_vn() (codeprove-backend/app/features/daily/service.py) so an
 * anonymous player's local streak never disagrees with the server's once
 * claimed. en-CA gives ISO ordering (year-month-day) regardless of locale;
 * only formatToParts's labeled parts are used, so the locale choice itself
 * doesn't matter beyond that ordering guarantee. */
export function todayVN(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function loadHistory(): LocalDailyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalDailyEntry[]) : [];
  } catch {
    return [];
  }
}

/** Upserts today's entry (replacing any existing entry for the same date)
 * and caps the stored history at 60 days, matching the backend's
 * ClaimStreakIn max_length so a claim can never be rejected for being too
 * long. */
export function saveEntry(entry: LocalDailyEntry): void {
  if (typeof window === "undefined") return;
  const history = loadHistory().filter((e) => e.date !== entry.date);
  history.push(entry);
  const trimmed = history.slice(-60);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
}

/** Mirrors codeprove-backend/app/features/daily/streak.py::compute_streak
 * exactly: consecutive calendar days with a played entry, counting backward
 * from today if today was already played, otherwise from yesterday (a
 * streak survives an unplayed "today" and only breaks after a fully
 * skipped day). */
export function computeLocalStreak(history: LocalDailyEntry[], today: string): number {
  const dates = new Set(history.map((e) => e.date));
  const addDays = (iso: string, delta: number): string => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + delta);
    return d.toISOString().slice(0, 10);
  };
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
```

- [ ] **Step 2: Verify with the type checker**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual browser verification of the streak math**

This repo has no test runner, so verify the pure function directly in a browser console once the dev server is running (any page - this only needs the module to be reachable, which it will be after Task 6 wires the app together; if run before Task 6, skip this step and rely on the type-check plus the logic trace below).

Trace the four cases by hand against the implementation (same cases the backend's `tests/test_daily_streak.py` covers) and confirm each matches:
- `computeLocalStreak([], "2026-07-04")` -> `0` (empty set, loop never enters).
- `computeLocalStreak([{date:"2026-07-04",...}, {date:"2026-07-03",...}, {date:"2026-07-02",...}], "2026-07-04")` -> `3` (today played, walks back three consecutive days).
- `computeLocalStreak([{date:"2026-07-03",...}, {date:"2026-07-02",...}], "2026-07-04")` -> `2` (today not played, starts from yesterday, still finds two).
- `computeLocalStreak([{date:"2026-07-01",...}], "2026-07-04")` -> `0` (neither today nor yesterday played).

- [ ] **Step 4: Commit**

```bash
git add lib/dailyStorage.ts
git commit -m "feat: add anonymous-play localStorage helpers with client-side streak math"
```

---

### Task 3: Bilingual content for Daily Bug Hunt

**Files:**
- Modify: `lib/content.ts`

**Interfaces:**
- Produces: `t.dailyBugHunt.*` (both locales) - Tasks 5 and 6 consume these keys via `useI18n()`.

- [ ] **Step 1: Insert the Vietnamese block**

In `codeprove-web/lib/content.ts`, the `vi.howItWorks` block ends and `vi.about` begins like this (lines 50-52):

```ts
      ],
    },
    about: {
```

Change it to insert a new `dailyBugHunt` key between them:

```ts
      ],
    },
    dailyBugHunt: {
      eyebrow: "MINI GAME HÀNG NGÀY",
      title: "Bắt Lỗi AI Hôm Nay",
      subtitle: "Ciel đã viết một đoạn code và cố tình cài 1 lỗi tinh vi. Bạn tìm được không?",
      loading: "Đang tải thử thách hôm nay...",
      errorTitle: "Không tải được thử thách",
      errorBody: "Có lỗi xảy ra - thử tải lại trang.",
      challengeLabel: "Thử thách",
      hintButton: "Xin gợi ý",
      hintsLeft: "còn {n} gợi ý",
      noHintsLeft: "Hết gợi ý",
      submitButton: "Nộp đáp án",
      submitting: "Đang chấm...",
      selectLinePrompt: "Click vào dòng bạn nghi có lỗi",
      resultTitleCorrect: "Chính xác!",
      resultTitleIncorrect: "Chưa đúng rồi",
      explanationLabel: "Giải thích",
      yourLine: "Dòng bạn chọn",
      correctLine: "Dòng lỗi thật sự",
      timeTaken: "Thời gian",
      hintsUsedLabel: "Số gợi ý đã dùng",
      streakLabel: "Chuỗi ngày",
      streakDays: "{n} ngày",
      streakNone: "Đăng nhập để lưu chuỗi ngày",
      shareButton: "Sao chép kết quả",
      shareCopied: "Đã sao chép!",
      shareTitle: "CodeProve Bug Hunt #{n}",
      shareResult: "Bắt lỗi trong {s} giây, {h} gợi ý",
      shareStreak: "Chuỗi: {n} ngày",
      claimBanner: "Đăng ký để không mất chuỗi ngày của bạn!",
      claimBannerCta: "Đăng ký ngay",
      playAgainTomorrow: "Quay lại vào ngày mai cho thử thách mới!",
      backToDashboard: "Về Dashboard",
    },
    about: {
```

- [ ] **Step 2: Insert the English block**

In the same file, the `en.howItWorks` block ends and `en.about` begins like this (lines 524-526):

```ts
      ],
    },
    about: {
```

Change it to:

```ts
      ],
    },
    dailyBugHunt: {
      eyebrow: "DAILY MINI GAME",
      title: "Bug Hunt of the Day",
      subtitle: "Ciel wrote this code and deliberately planted one subtle bug. Can you find it?",
      loading: "Loading today's challenge...",
      errorTitle: "Couldn't load the challenge",
      errorBody: "Something went wrong - try reloading the page.",
      challengeLabel: "Challenge",
      hintButton: "Get a hint",
      hintsLeft: "{n} hints left",
      noHintsLeft: "No hints left",
      submitButton: "Submit answer",
      submitting: "Scoring...",
      selectLinePrompt: "Click the line you think has the bug",
      resultTitleCorrect: "Nailed it!",
      resultTitleIncorrect: "Not quite",
      explanationLabel: "Explanation",
      yourLine: "Your line",
      correctLine: "The actual bug",
      timeTaken: "Time",
      hintsUsedLabel: "Hints used",
      streakLabel: "Streak",
      streakDays: "{n} days",
      streakNone: "Sign in to save your streak",
      shareButton: "Copy result",
      shareCopied: "Copied!",
      shareTitle: "CodeProve Bug Hunt #{n}",
      shareResult: "Caught it in {s}s, {h} hints",
      shareStreak: "Streak: {n} days",
      claimBanner: "Sign up so you don't lose your streak!",
      claimBannerCta: "Sign up now",
      playAgainTomorrow: "Come back tomorrow for a new challenge!",
      backToDashboard: "Back to dashboard",
    },
    about: {
```

- [ ] **Step 3: Verify with the type checker**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no errors. If you see a structural-mismatch error on the `Content` type, one of the two inserts is missing a key the other has - compare the two blocks key-by-key (both must have exactly the same 27 keys in the same shape).

- [ ] **Step 4: Commit**

```bash
git add lib/content.ts
git commit -m "feat: add bilingual content for Daily Bug Hunt"
```

---

### Task 4: Read-only, clickable code display

**Files:**
- Create: `components/daily/CodeBlock.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `CodeBlock` component with props `{ code: string; selectedLine: number | null; onSelectLine: (line: number) => void; revealedLine?: number | null; disabled?: boolean }` - Task 6 renders it with these exact prop names.

- [ ] **Step 1: Implement the component**

Create `components/daily/CodeBlock.tsx`:

```tsx
"use client";

// Pinned monospace stack for actual code display - deliberately independent
// of the --font-mono CSS variable, which now resolves to Inter sans-serif
// site-wide (see feat/replace-jetbrains-mono). Matches the exact stack
// components/app/SolveWorkspace.tsx uses for its own code editor.
const CODE_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

type CodeBlockProps = {
  code: string;
  selectedLine: number | null;
  onSelectLine: (line: number) => void;
  /** The real bug's line number, set only once the answer has been revealed. */
  revealedLine?: number | null;
  disabled?: boolean;
};

export function CodeBlock({
  code,
  selectedLine,
  onSelectLine,
  revealedLine = null,
  disabled = false,
}: CodeBlockProps) {
  const lines = code.split("\n");

  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface/60 p-4">
      <div style={{ fontFamily: CODE_FONT_FAMILY, fontSize: 13, lineHeight: "21px" }}>
        {lines.map((line, i) => {
          const num = i + 1;
          const isRevealedBug = revealedLine === num;
          const isSelected = selectedLine === num;
          // Reveal state always wins visually over the user's own pick, so a
          // correct guess and the revealed answer don't fight over which
          // background color applies to the same line.
          const bgClass = isRevealedBug ? "bg-error/20" : isSelected ? "bg-primary/20" : "";
          return (
            <div
              key={num}
              onClick={() => !disabled && onSelectLine(num)}
              className={`flex gap-4 rounded px-2 transition-colors duration-150 ${bgClass} ${
                disabled ? "" : "cursor-pointer hover:bg-primary/10"
              }`}
            >
              <span className="w-6 shrink-0 select-none text-right text-muted/60">{num}</span>
              <span className="whitespace-pre text-content">{line || " "}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify with the type checker**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/daily/CodeBlock.tsx
git commit -m "feat: add read-only clickable code display for Daily Bug Hunt"
```

---

### Task 5: Lightweight page header

**Files:**
- Create: `components/daily/DailyHeader.tsx`

**Interfaces:**
- Consumes: `t.dailyBugHunt.backToDashboard` (Task 3); `t.nav.login` / `t.nav.signup` (existing, `lib/content.ts` - already present in both locales' `nav` block, unchanged by this plan).
- Produces: `DailyHeader` component (no props) - Task 6's page composition renders it above `DailyBugHunt`.

- [ ] **Step 1: Implement the header**

Create `components/daily/DailyHeader.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageToggle, ThemeToggle } from "@/components/ui/Toggles";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

// Deliberately not the marketing Navbar (its nav links are homepage anchors
// like /#about, irrelevant here) and not the authenticated app-shell's
// AppTopNav (pulls in the Material Symbols font and workspace-specific
// links this single utility page doesn't need) - see spec section 8.
export function DailyHeader() {
  const { user } = useAuth();
  const { t } = useI18n();
  const d = t.dailyBugHunt;

  return (
    <header className="border-b border-border">
      <div className="container-site flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="cursor-pointer rounded-pill border border-border bg-surface/60 px-3 py-2 text-sm text-content transition-colors duration-200 hover:border-teal/60"
            >
              {d.backToDashboard}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="cursor-pointer rounded-pill px-3 py-2 text-sm text-muted transition-colors duration-200 hover:text-content"
              >
                {t.nav.login}
              </Link>
              <Button href="/signup" size="sm">
                {t.nav.signup}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify with the type checker**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/daily/DailyHeader.tsx
git commit -m "feat: add lightweight header for the Daily Bug Hunt page"
```

---

### Task 6: The game itself - state machine, route, and end-to-end verification

**Files:**
- Create: `components/daily/DailyBugHunt.tsx`
- Create: `app/daily/page.tsx`

**Interfaces:**
- Consumes: `fetchToday`, `submitAttempt`, `claimStreak`, `DailyChallenge`, `DailyAttemptResult` (Task 1); `todayVN`, `loadHistory`, `saveEntry`, `clearHistory`, `computeLocalStreak`, `LocalDailyEntry` (Task 2); `t.dailyBugHunt.*` (Task 3); `CodeBlock` (Task 4); `DailyHeader` (Task 5); `useAuth` (existing, `lib/auth.tsx`); `Button` (existing, `components/ui/Button.tsx`).
- Produces: the live `/daily` route.

- [ ] **Step 1: Implement the state machine component**

Create `components/daily/DailyBugHunt.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/daily/CodeBlock";
import { useAuth } from "@/lib/auth";
import {
  claimStreak,
  fetchToday,
  submitAttempt,
  type DailyChallenge,
} from "@/lib/dailyApi";
import { clearHistory, computeLocalStreak, loadHistory, saveEntry, todayVN } from "@/lib/dailyStorage";
import { useI18n } from "@/lib/i18n";

type Phase = "loading" | "error" | "playing" | "revealed";

type Tier = "green" | "yellow" | "red";

// Unifies the two distinct result shapes the backend returns: DailyResult
// (nested in GET /today once already played - has hints_used/time_taken_seconds,
// no streak) and DailyAttemptOut (from POST /attempt - has streak, and the
// hints_used/time_taken_seconds the client already knew and sent).
type ResultView = {
  correct: boolean;
  tier: Tier;
  buggy_line: number;
  explanation: string;
  hints_used: number;
  time_taken_seconds: number;
  streak: number | null;
};

const TIER_DOT: Record<Tier, string> = {
  green: "bg-[#28c840]",
  yellow: "bg-[#febc2e]",
  red: "bg-[#ff5f57]",
};

export function DailyBugHunt() {
  const { t } = useI18n();
  const { user } = useAuth();
  const d = t.dailyBugHunt;

  const [phase, setPhase] = useState<Phase>("loading");
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [result, setResult] = useState<ResultView | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const startRef = useRef<number | null>(null);
  const claimedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchToday()
      .then((data) => {
        if (cancelled) return;
        setChallenge(data);
        if (data.already_played && data.result) {
          setResult({ ...data.result, streak: null });
          setPhase("revealed");
        } else {
          startRef.current = performance.now();
          setPhase("playing");
        }
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Once a signed-in user is detected with unclaimed anonymous history,
  // submit it once and clear it locally - clearing IS the "already claimed"
  // flag, so there is no separate piece of state to keep in sync.
  useEffect(() => {
    if (claimedRef.current || !user) return;
    const history = loadHistory();
    if (history.length === 0) return;
    claimedRef.current = true;
    claimStreak(
      history.map(({ date, selected_line, hints_used, time_taken_seconds }) => ({
        date,
        selected_line,
        hints_used,
        time_taken_seconds,
      }))
    )
      .then(() => clearHistory())
      .catch(() => {
        claimedRef.current = false;
      });
  }, [user]);

  async function handleSubmit() {
    if (selectedLine === null || challenge === null || startRef.current === null) return;
    setSubmitting(true);
    const time_taken_seconds = Math.round((performance.now() - startRef.current) / 1000);
    try {
      const res = await submitAttempt({
        selected_line: selectedLine,
        hints_used: hintsUsed,
        time_taken_seconds,
      });
      setResult({ ...res, hints_used: hintsUsed, time_taken_seconds });
      setPhase("revealed");
      if (!user) {
        saveEntry({
          date: todayVN(),
          selected_line: selectedLine,
          hints_used: hintsUsed,
          time_taken_seconds,
          tier: res.tier,
        });
      }
    } catch {
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleShare() {
    if (!challenge || !result) return;
    const tierEmoji = result.tier === "green" ? "\u{1F7E9}" : result.tier === "yellow" ? "\u{1F7E8}" : "\u{1F7E5}";
    const streakLine =
      result.streak != null ? `\n${d.shareStreak.replace("{n}", String(result.streak))}` : "";
    const text = `${d.shareTitle.replace("{n}", String(challenge.challenge_number))} ${tierEmoji}\n${d.shareResult
      .replace("{s}", String(result.time_taken_seconds))
      .replace("{h}", String(result.hints_used))}${streakLine}\nhttps://code-prove.vercel.app/daily`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (phase === "loading") {
    return <div className="container-site py-20 text-center text-muted">{d.loading}</div>;
  }

  if (phase === "error") {
    return (
      <div className="container-site py-20 text-center">
        <p className="text-lg font-semibold text-content">{d.errorTitle}</p>
        <p className="mt-2 text-muted">{d.errorBody}</p>
      </div>
    );
  }

  if (!challenge) return null;

  const localStreak = user ? null : computeLocalStreak(loadHistory(), todayVN());
  const showClaimBanner = !user && localStreak !== null && localStreak >= 3;

  return (
    <div className="container-site max-w-3xl py-12">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal">{d.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-content sm:text-4xl">{d.title}</h1>
      <p className="mt-3 text-muted">{d.subtitle}</p>

      <div className="mt-2 flex items-center gap-2 text-sm text-muted">
        <span>
          {d.challengeLabel} #{challenge.challenge_number}
        </span>
        <span>&middot;</span>
        <span>{challenge.prompt_title}</span>
      </div>

      {showClaimBanner && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-teal/40 bg-teal/10 p-4">
          <p className="text-sm text-content">{d.claimBanner}</p>
          <Button href="/signup" size="sm" variant="vivid">
            {d.claimBannerCta}
          </Button>
        </div>
      )}

      <div className="mt-6">
        <CodeBlock
          code={challenge.buggy_code}
          selectedLine={selectedLine}
          onSelectLine={setSelectedLine}
          revealedLine={phase === "revealed" ? result?.buggy_line ?? null : null}
          disabled={phase === "revealed"}
        />
      </div>

      {phase === "playing" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted">{d.selectLinePrompt}</p>

          {hintsUsed > 0 && (
            <div className="space-y-2 rounded-card border border-border bg-surface/60 p-4 text-sm text-content">
              <p>{challenge.hint_1}</p>
              {hintsUsed > 1 && <p>{challenge.hint_2}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setHintsUsed((n) => Math.min(2, n + 1))}
              disabled={hintsUsed >= 2}
              className="cursor-pointer rounded-pill border border-border bg-surface/60 px-4 py-2 text-sm text-content transition-colors duration-200 hover:border-teal/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hintsUsed >= 2
                ? d.noHintsLeft
                : `${d.hintButton} (${d.hintsLeft.replace("{n}", String(2 - hintsUsed))})`}
            </button>
            <Button onClick={handleSubmit} disabled={selectedLine === null || submitting} variant="vivid">
              {submitting ? d.submitting : d.submitButton}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {phase === "revealed" && result && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`inline-block h-3 w-3 rounded-full ${TIER_DOT[result.tier]}`} />
            <p className="text-lg font-semibold text-content">
              {result.correct ? d.resultTitleCorrect : d.resultTitleIncorrect}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted">{d.yourLine}</p>
              <p className="mt-1 font-mono text-content">{selectedLine ?? "-"}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted">{d.correctLine}</p>
              <p className="mt-1 font-mono text-content">{result.buggy_line}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted">{d.timeTaken}</p>
              <p className="mt-1 text-content">{result.time_taken_seconds}s</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted">{d.hintsUsedLabel}</p>
              <p className="mt-1 text-content">{result.hints_used}</p>
            </div>
          </div>

          <div className="glass-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted">{d.explanationLabel}</p>
            <p className="mt-1 text-content">{result.explanation}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {result.streak != null
                ? `${d.streakLabel}: ${d.streakDays.replace("{n}", String(result.streak))}`
                : d.streakNone}
            </p>
            <Button onClick={handleShare} variant="secondary" size="sm">
              <Sparkles className="h-4 w-4" />
              {copied ? d.shareCopied : d.shareButton}
            </Button>
          </div>

          <p className="text-center text-sm text-muted">{d.playAgainTomorrow}</p>
        </div>
      )}
    </div>
  );
}
```

Note on `localStreak`/`showClaimBanner`: these are computed from `localStorage` directly in the render body, not in state. This is safe from a hydration-mismatch standpoint because they are only *read* inside the `phase === "playing"`/`"revealed"` render branches, and `phase` starts as `"loading"` identically on the server and on the client's first paint - the branch that touches `localStorage` is only reached after the `useEffect` above has already run client-side, i.e. strictly after hydration. Do not hoist this computation above the early `loading`/`error` returns.

- [ ] **Step 2: Create the route**

Create `app/daily/page.tsx`:

```tsx
import type { Metadata } from "next";
import { DailyHeader } from "@/components/daily/DailyHeader";
import { DailyBugHunt } from "@/components/daily/DailyBugHunt";

export const metadata: Metadata = {
  title: "Bug Hunt of the Day",
  description: "A daily challenge: spot the bug Ciel planted in today's code.",
};

export default function DailyPage() {
  return (
    <>
      <DailyHeader />
      <DailyBugHunt />
    </>
  );
}
```

This file has no `"use client"` directive - it stays a Server Component so it can export `metadata` (Next.js forbids that export from a Client Component), while still rendering the two Client Components it composes. This gives `/daily` its own page title and OG description for link previews, which the share-text feature in Task 6 depends on for a good social-sharing experience - unlike sibling pages such as `app/community/page.tsx`, which are `"use client"` from their own first line and inherit the root layout's generic metadata instead.

- [ ] **Step 3: Verify with the type checker and production build**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no errors.

Run: `cd codeprove-web && npm run build`
Expected: build succeeds and lists `/daily` as a new route in the output.

- [ ] **Step 4: End-to-end browser verification against the real backend**

This is the first point in the whole plan where the feature can actually be exercised, so verify thoroughly here rather than in each earlier task.

1. Ensure `codeprove-backend` is running locally on the `feat/daily-bug-hunt-backend` branch (`uvicorn app.main:app --reload`, per `codeprove-backend/docs/RUNBOOK.md`) and that `codeprove-web`'s `NEXT_PUBLIC_API_URL` points at it (defaults to `http://localhost:8000` per `lib/api.ts:1` if unset).
2. Start the dev server via the preview tool and navigate to `/daily`.
3. **Anonymous first play:** confirm the code block renders with visible line numbers, no answer is shown yet, clicking a line highlights it, "Nộp đáp án"/"Submit answer" is disabled until a line is selected. Submit a guess and confirm the reveal panel shows tier, explanation, your line vs. the correct line, and "Đăng nhập để lưu chuỗi ngày" (no streak) since there's no account yet.
4. **Hints:** reload (a fresh incognito-style session, or clear `localStorage` and re-request `/daily`'s challenge won't regenerate - instead just verify pre-submit: click "Xin gợi ý" twice before submitting and confirm `hint_1` then `hint_2` text appears, and the button reads "Hết gợi ý" and disables at 2).
5. **Reload same day:** reload the page after submitting - confirm it goes straight to the reveal panel with the same result (`already_played` path), not back to a fresh playable state.
6. **Share:** click "Sao chép kết quả"/"Copy result", confirm the button label flips to "Đã sao chép!"/"Copied!" for ~2 seconds, and paste the clipboard contents somewhere to confirm the text matches the `{n}`/`{s}`/`{h}` template with real values substituted.
7. **Logged in:** log in as an existing test account (or sign up), navigate to `/daily` (a new day's challenge, or use the backend's `POST /api/daily/regenerate` with the configured `admin_api_key` header to force a fresh one if needed), submit, and confirm the reveal panel now shows a real streak number instead of "Đăng nhập để lưu chuỗi ngày".
8. **Locale and theme:** toggle VI/EN and dark/light from `DailyHeader` and confirm every string on the page re-renders in the selected language and the color tokens (card backgrounds, tier dots, code block) remain legible in both themes.
9. **Mobile:** resize to 375px width and confirm the code block scrolls horizontally instead of wrapping/breaking, and the claim banner and result grid stack to a single column.

- [ ] **Step 5: Commit**

```bash
git add components/daily/DailyBugHunt.tsx "app/daily/page.tsx"
git commit -m "feat: add Daily Bug Hunt game page (state machine + route)"
```

---

### Final verification (after all 6 tasks)

- [ ] `cd codeprove-web && npx tsc --noEmit` - zero errors.
- [ ] `cd codeprove-web && npm run build` - succeeds, `/daily` listed among the routes.
- [ ] Re-run the full walkthrough from Task 6 Step 4 once more end-to-end (anonymous play -> claim on signup -> logged-in play next day) to confirm nothing regressed between tasks.
