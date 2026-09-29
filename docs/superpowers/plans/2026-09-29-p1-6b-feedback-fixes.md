# P1.6b Feedback Page Fixes (frontend) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix two misleading lines found while verifying P1.6 on production (attempt 233): the implementation step calls a submit pass ratio "best coverage", and the Debugging N/A reason says "your code never failed" when the submit suite failed.

**Context:** P1.6 (PR #14, #15) is live. The other issues found in the same check are backend work, planned in `codeprove-backend/docs/superpowers/plans/2026-09-29-p1-6b-feedback-data-fixes.md` (readable test inputs, integrity explanation). They need no frontend change: the page already renders any finding code and shows `failures[].input` as text.

**Branch:** `fix/p1-6b-feedback-copy` from `origin/main` (23dfc6d).

---

### Task 1: Submit pass ratio instead of "best coverage"

**Why:** since P1.2, `timeline[implementation].coverage_pct` is `100 × passed / total` of the full suite at submit when the exercise has a suite (`_implementation_item` in the backend), and the best visible-test coverage only for older sessions. The page labels both "Coverage tốt nhất {pct}%" and the pulse row "Coverage". Attempt 233 shows "Coverage tốt nhất 12%" for 1/8 passed.

**Files:** `components/report/reportText.ts`, `app/(app)/feedback/FeedbackContent.tsx`, `lib/appContent.ts`, `tests/report.test.cjs`.

- Copy (vi/en, same keys): `timelineDesc.submitPassed` "Pass {passed}/{total} test khi nộp." / "Passed {passed}/{total} tests at submit."; pulse label `submitPulse` "Pass khi nộp" / "Passed at submit" (moved from the local `PULSE_COPY` only for this row).
- `timelineText(t, copy, explainLevel?, submit?)`: for `implementation`, when `submit` (the report's `feedback.submit_tests`) has `total > 0`, use `submitPassed`; else today's coverage / no-tests lines.
- Session pulse: with `submit_tests`, the row reads "Pass khi nộp · 1/8"; without it, "Coverage · x%" as today.
- Tests first: submit present → "Pass 1/8 test khi nộp."; absent → coverage line unchanged; inactive → `noTests`.

Commit `fix(feedback): show the submit pass ratio instead of best coverage`.

### Task 2: Accurate Debugging N/A reason

**Why:** `no_failure` means "no test run of your own code failed while you worked" (backend `rubric.debugging`: N/A when an implement exercise has 0 failing runs). The current text "Code của bạn không phát sinh lỗi nên không có gì để debug." is false when the submit suite fails (attempt 233: 7 failures).

**Files:** `lib/appContent.ts`, `tests/report.test.cjs`.

- `naReasons.no_failure`: "Không có lần chạy test nào thất bại trong lúc làm bài, nên trục này không được chấm." / "No test run failed while you worked, so this axis was not scored."
- Test: neither locale's text claims the code never failed (`/không phát sinh lỗi|never failed/` absent).

Commit `fix(i18n): debugging N/A reason matches the rubric`.

### Task 3: Verify and ship

- `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Local run against production (read-only, dev account, attempt 233), vi/en, desktop and 375 px.
- PR `fix/p1-6b-feedback-copy` → `main`.

## Out of scope

- Finding texts follow `diagnosis.locale` (written at submit), so an en UI can show vi finding text. By contract; revisit only if users ask.
- Radar label clipping on narrow cards (pre-existing).
