# CodeProve Landing Page CRO/UI Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 5 highest-impact CRO/UI issues found in the 2026-07-03 live audit of `code-prove.vercel.app` (Next.js 14 marketing site in `codeprove-web`).

**Architecture:** All changes are localized to the marketing route group `app/(marketing)/`, its section components in `components/sections/`, the shared `Button` primitive, and the bilingual dictionary `lib/content.ts`. No backend, routing, or data-model changes are involved.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS (CSS-variable-driven theme tokens), Framer Motion.

## Global Constraints

- Locale dictionary `lib/content.ts` exports `content = { vi: {...}, en: {...} } as const` and `type Content = (typeof content)["vi"]` (`lib/content.ts:916-918`). The `vi` and `en` objects **must stay structurally identical** — any key added to one must be added to the other, in the same shape, or `tsc` will fail wherever `Content` is consumed.
- This repo has **no unit/component test runner** (`package.json` only defines `dev`, `build`, `start`, `lint` — no `jest`/`vitest`/`playwright`). The established verification pattern in this codebase (see prior fix batches) is: `npx tsc --noEmit` for type safety, `npm run build` for a full production compile, and manual verification in the running dev server via the browser preview tool. Every task below uses that pattern instead of red/green unit tests.
- Dev server is registered in `codeprove-web/.claude/launch.json` under the name `codeprove-web` (port 3100, `npm run dev`). Use the preview tool's `preview_start` with that name to verify changes visually.
- Never hardcode copy directly into JSX for user-facing strings — always add it to `lib/content.ts` and consume via `useI18n()`, matching the existing pattern in every section component.
- Keep the existing `"use client"` directive at the top of any component file you edit that already has one.
- No em dash (`—`) in any string you write — use a plain hyphen `-` (standing project rule).

---

### Task 1: Fix mistranslated hero CTA ("Get started" shown in Vietnamese locale)

**Files:**
- Modify: `codeprove-web/lib/content.ts:24`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — this only changes a string value already consumed by `components/sections/Hero.tsx:86` via `t.hero.ctaPrimary`.

- [ ] **Step 1: Confirm the bug**

Read `codeprove-web/lib/content.ts` lines 19-29 (the `vi.hero` block) and confirm line 24 reads:

```ts
ctaPrimary: "Get started",
```

while the sibling `en.hero` block at line 480 correctly reads `ctaPrimary: "Get started"` (that one is *supposed* to be English — only the `vi` copy is wrong).

- [ ] **Step 2: Fix the string**

In `codeprove-web/lib/content.ts`, change line 24 from:

```ts
      ctaPrimary: "Get started",
```

to:

```ts
      ctaPrimary: "Bắt đầu ngay",
```

(This is inside the `vi.hero` object only — do not touch the `en.hero.ctaPrimary` on line 480.)

- [ ] **Step 3: Type-check**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no new errors (exit code 0).

- [ ] **Step 4: Visual verify**

Start the dev server via the preview tool (`preview_start` with config name `codeprove-web`), navigate to `/`, confirm the language toggle shows "VI" selected, and confirm the hero primary button now reads "Bắt đầu ngay". Switch the toggle to "EN" and confirm it still reads "Get started".

- [ ] **Step 5: Commit**

```bash
git add lib/content.ts
git commit -m "fix: correct mistranslated Vietnamese hero CTA copy"
```

---

### Task 2: Render the existing (unused) `TrustedBy` social-proof section on the homepage

**Files:**
- Modify: `codeprove-web/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `TrustedBy` component from `@/components/sections/TrustedBy` (already fully implemented, reads `t.trusted.label` / `t.trusted.note` / a hardcoded `partners` array — no changes needed inside that file).
- Produces: nothing new for later tasks.

- [ ] **Step 1: Confirm the component exists but isn't wired up**

Read `codeprove-web/components/sections/TrustedBy.tsx` (46 lines, exports `TrustedBy`) and `codeprove-web/app/(marketing)/page.tsx` (current 19 lines) — confirm `TrustedBy` is never imported in `page.tsx`.

- [ ] **Step 2: Wire it into the page**

Replace the full contents of `codeprove-web/app/(marketing)/page.tsx`:

```tsx
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Service } from "@/components/sections/Service";
import { RubricShowcase } from "@/components/sections/RubricShowcase";
import { Pricing } from "@/components/sections/Pricing";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Service />
      <RubricShowcase />
      <Pricing />
      <Contact />
    </>
  );
}
```

with:

```tsx
import { Hero } from "@/components/sections/Hero";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { About } from "@/components/sections/About";
import { Service } from "@/components/sections/Service";
import { RubricShowcase } from "@/components/sections/RubricShowcase";
import { Pricing } from "@/components/sections/Pricing";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <About />
      <Service />
      <RubricShowcase />
      <Pricing />
      <Contact />
    </>
  );
}
```

(Task 3 below adds one more line here — do this task first so the diff stays easy to follow.)

- [ ] **Step 3: Type-check**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Visual verify**

In the running dev server, load `/`, scroll past the hero, and confirm a new section appears reading "Được tin dùng bởi các chương trình đào tạo & đối tác pilot" with a horizontally scrolling marquee of partner names (FPT University, Tech Institute, etc.) before the "Về chúng tôi" section.

- [ ] **Step 5: Commit**

```bash
git add "app/(marketing)/page.tsx"
git commit -m "feat: render existing TrustedBy social-proof section on homepage"
```

---

### Task 3: Add a simple "How it works" 3-step section before the technical scoring content

**Files:**
- Create: `codeprove-web/components/sections/HowItWorks.tsx`
- Modify: `codeprove-web/lib/content.ts` (insert `howItWorks` key into both `vi` and `en` blocks)
- Modify: `codeprove-web/app/(marketing)/page.tsx` (render the new section)

**Interfaces:**
- Consumes: `Reveal`, `Stagger`, `StaggerItem` from `@/components/ui/Reveal` (existing, used identically in `About.tsx`); `useI18n` from `@/lib/i18n`.
- Produces: `HowItWorks` component (default export style matches siblings: named export `export function HowItWorks()`), and `t.howItWorks` on the `Content` type for any later task to consume.

- [ ] **Step 1: Add bilingual copy to `lib/content.ts`**

In `codeprove-web/lib/content.ts`, find the end of the `vi.trusted` block (lines 30-33):

```ts
    trusted: {
      label: "Được tin dùng bởi các chương trình đào tạo & đối tác pilot",
      note: "(Logo đối tác trong giai đoạn MVP - placeholder)",
    },
    about: {
```

Insert a new `howItWorks` key between them so it reads:

```ts
    trusted: {
      label: "Được tin dùng bởi các chương trình đào tạo & đối tác pilot",
      note: "(Logo đối tác trong giai đoạn MVP - placeholder)",
    },
    howItWorks: {
      title: "Cách hoạt động",
      sub: "3 bước đơn giản để đo năng lực dùng AI của bạn.",
      steps: [
        {
          title: "Giải bài cùng AI",
          desc: "Làm bài trong workspace tích hợp sẵn, có Ciel hỗ trợ như một trợ lý thật.",
        },
        {
          title: "Mọi bước tư duy được ghi lại",
          desc: "Giả thuyết, prompt, chỉnh sửa - tất cả được ghi vào event stream, không chỉ dòng code cuối.",
        },
        {
          title: "Nhận điểm số 6 trục",
          desc: "Báo cáo chi tiết Understanding, Hypothesis, Prompting, Verification, Testing, Debugging.",
        },
      ],
    },
    about: {
```

Then find the end of the `en.trusted` block (lines 486-489):

```ts
    trusted: {
      label: "Trusted by training programs & pilot partners",
      note: "(Partner logos are placeholders during the MVP stage)",
    },
    about: {
```

Insert the matching English key so it reads:

```ts
    trusted: {
      label: "Trusted by training programs & pilot partners",
      note: "(Partner logos are placeholders during the MVP stage)",
    },
    howItWorks: {
      title: "How it works",
      sub: "3 simple steps to measure how well you use AI.",
      steps: [
        {
          title: "Solve challenges with AI",
          desc: "Work inside a built-in workspace with Ciel acting as your real assistant.",
        },
        {
          title: "Every step of your thinking is captured",
          desc: "Hypotheses, prompts, edits - all logged to an event stream, not just the final code.",
        },
        {
          title: "Get a 6-axis score",
          desc: "A detailed report across Understanding, Hypothesis, Prompting, Verification, Testing, Debugging.",
        },
      ],
    },
    about: {
```

- [ ] **Step 2: Create the component**

Create `codeprove-web/components/sections/HowItWorks.tsx`:

```tsx
"use client";

import { Terminal, Activity, BarChart3 } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

const stepIcons = [Terminal, Activity, BarChart3];

export function HowItWorks() {
  const { t } = useI18n();
  const h = t.howItWorks;

  return (
    <section id="how-it-works" className="relative py-16 sm:py-20">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {h.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {h.sub}
          </p>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
          {h.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <StaggerItem key={step.title}>
                <div className="glass-card h-full p-6 transition-colors duration-200 hover:border-teal/40">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-teal/12 text-teal">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-content">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire it into the page**

In `codeprove-web/app/(marketing)/page.tsx` (as left by Task 2), change:

```tsx
import { Hero } from "@/components/sections/Hero";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { About } from "@/components/sections/About";
```

to:

```tsx
import { Hero } from "@/components/sections/Hero";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { About } from "@/components/sections/About";
```

and change:

```tsx
      <Hero />
      <TrustedBy />
      <About />
```

to:

```tsx
      <Hero />
      <TrustedBy />
      <HowItWorks />
      <About />
```

- [ ] **Step 4: Type-check**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no errors. If you see `Property 'howItWorks' is missing in type ... 'en'` (or `'vi'`), you skipped one of the two inserts in Step 1 — add the missing block.

- [ ] **Step 5: Visual verify**

In the running dev server, load `/`, confirm a new "Cách hoạt động" section with 3 numbered cards (01/02/03) appears between the partner marquee and "Về chúng tôi". Toggle to EN and confirm it re-renders as "How it works" with the English copy. Resize to a 375px-wide viewport and confirm the 3 cards stack to a single column (the `md:grid-cols-3` class already handles this the same way `About.tsx`'s pillar grid does).

- [ ] **Step 6: Commit**

```bash
git add lib/content.ts components/sections/HowItWorks.tsx "app/(marketing)/page.tsx"
git commit -m "feat: add simple How it works section before technical scoring content"
```

---

### Task 4: Make the hero's primary CTA visually stand out from the animated background

**Files:**
- Modify: `codeprove-web/components/ui/Button.tsx`
- Modify: `codeprove-web/components/sections/Hero.tsx:85`

**Interfaces:**
- Consumes: existing CSS variables `--primary-container` / `--on-primary-container` already defined for both themes in `codeprove-web/app/globals.css:40-41` (dark) and `:82-83` (light), already mapped to Tailwind classes `bg-primary-container` / `text-on-primary-container` in `codeprove-web/tailwind.config.ts:47-48`. No new CSS variables needed.
- Produces: a new `Button` variant value `"vivid"`, additive to the existing `"primary" | "secondary" | "ghost"` union — every existing `<Button variant="primary">` call site is untouched and keeps its current appearance.

- [ ] **Step 1: Add the `vivid` variant to `Button.tsx`**

In `codeprove-web/components/ui/Button.tsx`, change:

```ts
type Variant = "primary" | "secondary" | "ghost";
```

to:

```ts
type Variant = "primary" | "secondary" | "ghost" | "vivid";
```

Then change:

```ts
const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:opacity-90 shadow-[0_8px_30px_-10px_rgb(var(--primary)/0.5)]",
  secondary:
    "border border-border bg-surface/60 text-content hover:border-primary/60 hover:bg-surface",
  ghost: "text-content hover:bg-surface/60",
};
```

to:

```ts
const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:opacity-90 shadow-[0_8px_30px_-10px_rgb(var(--primary)/0.5)]",
  secondary:
    "border border-border bg-surface/60 text-content hover:border-primary/60 hover:bg-surface",
  ghost: "text-content hover:bg-surface/60",
  vivid:
    "bg-primary-container text-on-primary-container hover:opacity-90 shadow-[0_10px_40px_-8px_rgb(var(--primary-container)/0.65)]",
};
```

- [ ] **Step 2: Apply it to the hero's primary CTA only**

In `codeprove-web/components/sections/Hero.tsx`, change (around line 85):

```tsx
            <Button href="/dashboard" size="lg">
              {t.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Button>
```

to:

```tsx
            <Button href="/dashboard" size="lg" variant="vivid">
              {t.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Button>
```

Do not change any other `<Button>` call site (nav, pricing, contact form, etc.) — this task is scoped to the single highest-priority conversion point identified in the audit.

- [ ] **Step 3: Type-check**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Visual verify**

In the running dev server, load `/` in both dark (default) and light mode (use the theme toggle in the navbar) and confirm the hero's primary CTA now renders as a saturated blue pill (`#0055ff` background, light text) that reads clearly against the animated background, in contrast to the nav's "Đăng ký" button which keeps the original pastel `primary` styling.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Button.tsx components/sections/Hero.tsx
git commit -m "feat: add vivid button variant, use it for hero primary CTA"
```

---

### Task 5: Stop the hero headline from rendering near-invisible on page load

**Files:**
- Modify: `codeprove-web/components/sections/Hero.tsx:59-89`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — purely removes a fade-in on the LCP element.

- [ ] **Step 1: Confirm the current behavior**

Read `codeprove-web/components/sections/Hero.tsx` lines 60-68 — the `<motion.h1>` starts at `initial={{ opacity: 0, y: 16 }}` and animates to full opacity over `duration: 0.6` with a `delay: 0.05`. Combined with client-hydration time, this is the element a live screenshot-based audit caught rendering almost invisible for roughly a second after navigation — unacceptable for a value-proposition headline that must be legible within 5 seconds.

- [ ] **Step 2: Remove the fade on the headline, keep it on the subhead and CTA**

In `codeprove-web/components/sections/Hero.tsx`, change:

```tsx
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
          >
            {t.hero.titleA}{" "}
            <span className="text-gradient">{t.hero.titleB}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8"
          >
```

to:

```tsx
          <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {t.hero.titleA}{" "}
            <span className="text-gradient">{t.hero.titleB}</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="mt-8"
          >
```

The closing `</motion.h1>` tag lower down must also change to a plain `</h1>` — the full replaced block above already includes that.

- [ ] **Step 3: Type-check**

Run: `cd codeprove-web && npx tsc --noEmit`
Expected: no errors (the unused `motion` import is still used by `motion.p` and `motion.div`, so no import cleanup needed).

- [ ] **Step 4: Visual verify**

In the running dev server, hard-reload `/` (disable cache) and confirm the headline "Không kiểm tra AI giải được bài không - kiểm tra bạn biết dùng AI đúng cách không." is fully legible in the very first rendered frame, while the subheading and CTA button still perform a brief, subtle fade-up immediately after. Take a screenshot within the first 300ms (or use the preview tool's screenshot right after navigation) to confirm the text is not washed out.

- [ ] **Step 5: Commit**

```bash
git add components/sections/Hero.tsx
git commit -m "fix: render hero headline immediately instead of fading in from invisible"
```

---

### Final verification (run once after all 5 tasks are complete)

- [ ] Run `cd codeprove-web && npx tsc --noEmit` — expect zero errors.
- [ ] Run `cd codeprove-web && npm run build` — expect a successful production build with no new page/route errors.
- [ ] Start the dev server via the preview tool and walk through `/` top to bottom in both `VI`/`EN` locales and both dark/light themes, confirming: hero headline legible immediately, hero CTA in Vietnamese reads "Bắt đầu ngay" and is visually vivid, a "Được tin dùng bởi..." marquee appears right after the hero, a "Cách hoạt động" 3-step section appears before "Về chúng tôi", and nothing else on the page regressed (nav, pricing, contact, footer all still render as before).
- [ ] Resize to 375px width and repeat the walkthrough to confirm no layout regressions on mobile.
