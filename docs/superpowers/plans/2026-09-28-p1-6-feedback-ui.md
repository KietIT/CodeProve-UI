# P1.6 Feedback Page: Levels, Finding Cards, Hidden Tests — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** The Feedback page shows what P1.4–P1.5 now compute: a level per axis instead of decimals, the ranked diagnosis findings as cards (what happened / why it matters / how to improve / try next, with a link to the suggested exercise), and the full submit-suite results including failing hidden tests. The page stops regex-matching English notes.

**Architecture:** The backend contract is `codeprove-backend/docs/api/feedback.md` (P1.4 + P1.5). All new fields are optional (`feedback.levels`, `feedback.diagnosis`, `feedback.submit_tests`): when present the page renders them; when absent (a report never rescored with engine v2) it shows the current view minus the regex fallback. Pure helpers in `components/report/diagnosis.ts` (tested with `node:test`); small presentational components in `components/report/`; `FeedbackContent.tsx` only composes them. Texts from the backend are rendered as plain text (React escapes them); the UI never parses them.

**Tech Stack:** Next.js 14 (app router), React 18, TypeScript, Tailwind tokens of the Phase 1 design system, `@tanstack/react-query`, `node --test` with the TS transpile hook of `tests/ui.test.cjs`.

**Inputs:** backend on `main` with P1.5 deployed; roadmap `codeprove-backend/docs/superpowers/specs/2026-09-24-p1-design.md` (P1.6 row, hidden-test display policy of P1.2: categories right after submit, full failing inputs on the Feedback page).

**Branch / worktree:** `feat/p1-6-feedback-ui` from `origin/main`, in `codeprove-web/.claude/worktrees/p1-6-feedback-ui` (the main checkout stays on its own branch).

---

## What the page gets (from `GET /attempts/{id}/report`, inside `feedback`)

| Field | Use |
|---|---|
| `levels[axis]` 0–3 or `null` | Axis rows: level label + 4-step bar. `null` = N/A with `not_applicable[axis]` reason (already shown today). |
| `diagnosis.findings[]` | Cards, already ranked: ≤ 3 risks (worst first), then ≤ 2 strengths. Fields: `code`, `axis`, `kind`, `severity`, `text.{what_happened, why_it_matters, how_to_improve, try_next}`, `next_exercise`. |
| `diagnosis.candidates[0]` | "Next challenge" button target. |
| `submit_tests` | `passed/total`, `hidden_passed/hidden_total`, `failed_categories`, `failures[]` (`description`, `category`, `hidden`, `input`, `expected`, `actual`, `error`). |

Level labels (from the contract): 0 Chưa đạt / Not yet, 1 Cơ bản / Basic, 2 Khá / Good, 3 Tốt / Strong. Severity: cao/vừa/thấp — high/medium/low. Categories: `happy` thông thường / typical, `boundary` giá trị biên / boundary, `edge` tình huống đặc biệt / edge, `error` xử lý lỗi / error handling, `uncategorized` khác / other (same labels as the backend templates).

---

### Task 1: Types and pure helpers

**Files:** Modify `lib/types/report.ts`, `lib/api/report.ts`. Create `components/report/diagnosis.ts`, `tests/report.test.cjs`.

- Types: `AxisLevel = 0 | 1 | 2 | 3 | null`; `Finding` (fields above, `severity: "high" | "medium" | "low" | null`, `source?`, `fallback_reason?`); `Diagnosis { version; locale; findings: Finding[]; candidates?: string[] }`; `SubmitTests`, `TestFailure`. Add optional `engine?`, `levels?`, `diagnosis?`, `submit_tests?` to `ReportOut["feedback"]`. `submitAttempt` returns `{ questions: string[]; tests?: SubmitSummary | null }` (`passed`, `total`, `hidden_passed`, `hidden_total`, `failed_categories`).
- Helpers (no React): `splitFindings(d) → { risks, strengths }` (keeps backend order), `nextExercise(report) → string | null` (`candidates[0]` else first finding's `next_exercise`), `levelOf(report, axis)`, `hiddenFailures(tests)` / `visibleFailures(tests)`, `exerciseHref(code) → { pathname: "/workspace/solve", query: { id: code } }` (same shape as `LevelExercises.tsx`).
- Tests first (`node:test`): order kept; missing `diagnosis` → empty lists; `nextExercise` falls back and returns `null`; level `null` vs `0` distinguished; hidden/visible split.

Run `npm test` (fails, then passes). Commit `feat(report): types and helpers for levels, diagnosis and submit tests`.

### Task 2: Copy (vi/en)

**Files:** Modify `lib/appContent.ts` (`feedback` block, both locales, same keys).

Add: `levelNames` (0–3), `severityNames`, `categoryNames`, `findingFields` (the four headings: "Chuyện gì đã xảy ra" / "What happened", "Vì sao quan trọng" / "Why it matters", "Cách cải thiện" / "How to improve", "Thử tiếp" / "Try next"), `risksTitle`/`strengthsTitle` reuse, `openExercise` ("Mở bài {code}" / "Open {code}"), hidden-test block (`testsTitle`, `testsSummary` "Pass {passed}/{total} · test ẩn {hidden_passed}/{hidden_total}", `hiddenTag`, `visibleTag`, `inputLabel`, `expectedLabel`, `actualLabel`, `errorLabel`, `allPassed`), submit-summary line for the modal. Remove `notes` only in Task 6.

Commit `feat(i18n): feedback copy for levels, findings and hidden tests`.

### Task 3: Axis levels instead of decimals

**Files:** Create `components/report/AxisLevels.tsx`; modify `FeedbackContent.tsx`; test in `tests/report.test.cjs` (render with `renderToStaticMarkup`).

- With `feedback.levels`: each axis row shows the axis name, the level label and a 4-segment bar (filled segments = level; `aria-label` "Thấu hiểu: Khá (2/3)"). N/A rows keep today's label + reason.
- Without `levels` (older report): today's % bars unchanged.
- "Session pulse": the explain-back row shows the understanding level label instead of `x/20` when levels exist; timeline step 3 desc likewise ("Mức giải thích: Khá"). Coverage stays a percentage (it is a pass ratio, not a score).
- Radar keeps `axes_pct` (the 0–20 score already equals 20 × level / 3 × integrity).
- Tests: level 2 renders "Khá" and 2 filled segments; `null` renders the N/A reason; no `levels` → a `%` is rendered.

Commit `feat(feedback): show axis levels instead of decimals`.

### Task 4: Finding cards

**Files:** Create `components/report/FindingCard.tsx`, `components/report/FindingsSection.tsx`; modify `FeedbackContent.tsx`; tests.

- `FindingCard`: axis name, kind (strength icon `verified` / risk icon `science`), severity chip for risks (high = error tone, medium = warning, low = neutral), then the four fields with their headings; `try_next` ends with a link to `next_exercise` when present ("Mở bài CP-105"). Text rendered as `{text}` in `<p>` with `whitespace-pre-line`; never `dangerouslySetInnerHTML`.
- `FindingsSection`: "Điểm cần tập trung" (risks, in order) then "Điểm mạnh" (strengths). Empty risks → today's `noRisks` line; empty strengths → `noStrengths`.
- `FeedbackContent`: when `diagnosis` exists, render `FindingsSection` in place of the strengths/risks lists. "Thử thách tiếp theo" links to `exerciseHref(nextExercise(report))`, else `/workspace` as today.
- Tests: order preserved (risk before strength); severity chip text; link href contains `id=CP-105`; a `<script>` inside a text renders escaped.

Commit `feat(feedback): diagnosis finding cards with next exercise`.

### Task 5: Hidden-test results (P1.2 display policy)

**Files:** Create `components/report/TestResults.tsx`; modify `FeedbackContent.tsx`, `components/app/ExplainBackModal.tsx` + `SolveWorkspace.tsx` (pass `tests` from the submit response); tests.

- Feedback page (`feedback.submit_tests`): summary line; if all pass, `allPassed`; else a list of failures, hidden ones first, each with its description, category label, a "test ẩn / test hiển thị" tag, and input / expected / actual / error in monospace blocks (already clipped to 300 chars by the backend). Collapsed by default when there are more than 3 (a `<details>` element, no new dependency).
- Explain-back modal (right after Submit): one line "Pass 6/8 · test ẩn 4/6 · nhóm chưa pass: giá trị biên, tình huống đặc biệt" — categories only, never inputs (policy: inputs only on the Feedback page).
- Tests: hidden failures listed before visible; modal line contains category labels and no input text.

Commit `feat(feedback): full submit-suite results and the submit summary`.

### Task 6: Remove the regex note mapping

**Files:** Modify `FeedbackContent.tsx`, `lib/appContent.ts`.

- Delete `legacyNoteCode`. The fallback lists (reports without `diagnosis`) show `tf.notes[code]` when the code is known, else the stored note as is. `timelineText` keeps the `key`-based path; the regex fallbacks on `desc` are removed (every stored report has `key` since the localisation release; confirm on production with one old report before deleting, see "Checks").
- Tests: a report with `code` but no `diagnosis` still renders; no `RegExp` left in `FeedbackContent.tsx` (a source grep in the test, like the existing file checks).

Commit `refactor(feedback): drop regex mapping of English notes`.

### Task 7: Verify and ship

- `npm run lint`, `npm test`, `npm run build` clean.
- Local run against production API (read-only, Kiệt's account): open the Feedback page of three golden sessions — one with strengths only (e.g. CP-010), one debug with `bug_not_fixed` (CP-004), one with integrity flags if any — in vi and en, desktop and 375 px. Screenshots in the PR.
- PR `feat/p1-6-feedback-ui` → `main`. Kiệt merges; Vercel deploys.

## Checks before starting

1. Backend deployed from `feat/p1-5-feedback` merged into `main`, and `python -m app.features.scoring.rescore --engine v2 --apply` run once after the deploy, so every stored report carries `levels`, `diagnosis` (with today's templates) and `submit_tests` where a suite exists.
2. One report per level on production returns `feedback.diagnosis` (`GET /api/attempts/{id}/report`).

## Out of scope (later)

- Backend cleanup of the v1 fields (`strengths`, `risks`, `per_axis`, English `note`/`desc`): only after P1.6 is live, as a separate backend change.
- Radar on levels, dashboard/profile level display, an integrity review channel (owner decision 2026-09-27: not now).
- P1.7 weight selection.

## Who does what

| Step | Who |
|---|---|
| Approve this plan | Kiệt |
| Checks 1–2 (merge, deploy, rescore) | Kiệt |
| Tasks 1–6, local verification, PR | Claude |
| Visual review on the preview deploy, merge | Kiệt |
