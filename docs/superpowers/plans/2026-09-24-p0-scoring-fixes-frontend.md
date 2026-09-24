# P0 Scoring Fixes — Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show scoring axes that were "not applicable" with their reason instead of as a score, and replace the label that revealed Ciel's planted bug with a generic "AI can be wrong" note on every reply that contains code.

**Architecture:** Pure UI changes against an updated backend contract (below). No new dependencies. Tests use the existing `node --test` harness in `tests/ui.test.cjs`, which transpiles TSX with TypeScript and renders with `react-dom/server`.

**Tech Stack:** Next.js 14, TypeScript, Tailwind, `node --test`.

**Companion plan:** backend P0 lives in `codeprove-backend` → `docs/superpowers/plans/2026-09-24-p0-scoring-fixes.md`; roadmap in `codeprove-backend` → `docs/superpowers/specs/2026-09-24-scoring-roadmap.md` (phase P0).

---

## Why (short)

The scoring engine used to give 0 on axes the student had no chance to show (e.g. Debugging when the code passed on the first run, Prompting when Ciel was never used). The backend now reports those axes as `null` plus a reason code, and the overall score renormalises over the remaining axes. The UI must not render `null` as "0" or as a weakness.

The backend also used to return `injected_error: true` on the one Ciel reply that contained a deliberately planted bug, and the UI labelled exactly that reply "Verify this carefully", which gave the trap away. The flag is removed from the API; the verify note now appears on every reply that contains code.

## Backend contract this plan depends on

The backend change is backward compatible and may deploy before or after this one.

| Endpoint | Change |
|---|---|
| `POST /api/attempts/{id}/mentor` | Response is now `{ "reply": string }`. `injected_error` is **gone**. |
| `POST /api/attempts/{id}/explain-back`, `GET /api/attempts/{id}/report` | `axes` / `axes_pct` values for `prompting`, `verification`, `debugging` may be `null`. `feedback.not_applicable` is a map `axis -> reason`, reason ∈ `"no_failure"` (debugging), `"no_ai_use"` (prompting), `"no_ai_code"` (verification). Reports created before the change may lack the key: treat as `{}`. |
| `GET /api/dashboard` | `radar[].value` may be `null` (axis never observed across the user's reports). |

Roadmap traceability (P0 frontend items → tasks):

| Roadmap item | Task |
|---|---|
| [1] Remove the UI label that reveals the trapped reply | F2 |
| Pulled forward from P2: generic "AI can be wrong" note on every code reply | F2 |
| [1] N/A axes (frontend display of the backend change) | F3 |

---

### Task F1: Branch and baseline

This session runs in a fresh worktree of `codeprove-web`.

**Step 1:** `git fetch origin && git checkout feat/p0-scoring-na` (the branch already exists on origin and contains this plan; it is based on `origin/main`).

**Step 2:** `npm ci`, then `npm test` and `npm run build`. Both must pass before any change; note the baseline in your progress report.

---

### Task F2: generic "AI can be wrong" hint on every code reply

**Files:**
- Create: `lib/chat.ts`
- Modify: `components/workspace/PromptLog.tsx`, `components/app/SolveWorkspace.tsx:652`, `lib/types/session.ts`, `lib/types/ciel.ts`, `lib/api/ciel.ts` (doc comment), `lib/appContent.ts` (`verifyHint` vi/en)
- Test: `tests/ui.test.cjs`

**Step 1: Write the failing test** (append to `tests/ui.test.cjs`)

```js
const { hasCodeBlock } = require('../lib/chat.ts');

test('hasCodeBlock detects fenced code only', () => {
  assert.equal(hasCodeBlock('Try this:\n```python\nx = 1\n```'), true);
  assert.equal(hasCodeBlock('Think about the loop bounds.'), false);
  assert.equal(hasCodeBlock('Use `range(n)` inline'), false);
});
```

**Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL (`Cannot find module '../lib/chat.ts'`)

**Step 3: Implement**

`lib/chat.ts`:

```ts
/** True when a chat reply contains a fenced code block (```...```). */
export const hasCodeBlock = (text: string): boolean => /```[\s\S]*?```/.test(text);
```

`components/workspace/PromptLog.tsx`: import `hasCodeBlock` from `@/lib/chat`, update the `verifyHint` label doc comment to "Footnote under every reply that contains code (AI code can be wrong).", and replace the `{m.verifyHint && (...)}` block with:

```tsx
          {m.role === "assistant" && hasCodeBlock(m.text) && (
            <p className="mt-1 text-xs italic text-on-surface-variant/60">{labels.verifyHint}</p>
          )}
```

`components/app/SolveWorkspace.tsx:652`: `addPromptEntry({ role: "assistant", text: res.reply });`

`lib/types/session.ts`: delete the `verifyHint?: boolean;` field and its doc line. `lib/types/ciel.ts`: delete `injected_error: boolean;` and fix the doc comment. `lib/api/ciel.ts`: doc comment says the response is `{ reply }`.

`lib/appContent.ts`: `verifyHint` → vi `"AI có thể sai — hãy chạy thử và kiểm chứng trước khi dùng."`, en `"AI can be wrong — run and verify it before you use it."`

**Step 4: Verify**

Run: `npm test && npm run build`
Expected: PASS; build has no type errors (a leftover `verifyHint`/`injected_error` reference would fail here).

**Step 5: Commit**

```bash
git add lib/chat.ts components/workspace/PromptLog.tsx components/app/SolveWorkspace.tsx lib/types/session.ts lib/types/ciel.ts lib/api/ciel.ts lib/appContent.ts tests/ui.test.cjs
git commit -m "fix(ciel): show the verify reminder on every code reply, not just the trap"
```

---

### Task F3: show N/A axes with their reason

**Files:**
- Modify: `lib/types/report.ts`, `lib/types/dashboard.ts`, `components/report/RadarChart.tsx`, `app/(app)/feedback/FeedbackContent.tsx`, `app/(app)/dashboard/page.tsx`, `components/app/WorkspaceLanding.tsx`, `lib/appContent.ts`
- Test: `tests/ui.test.cjs`

**Step 1: Write the failing test** (append to `tests/ui.test.cjs`)

```js
const { RadarChart } = require('../components/report/RadarChart.tsx');

test('RadarChart marks not-applicable axes instead of plotting them as a score', () => {
  const html = render(h(RadarChart, { data: [
    { label: 'Understanding', value: 90 },
    { label: 'Hypothesis', value: 85 },
    { label: 'Debugging', value: null },
  ] }));
  assert.match(html, /Debugging —/);
  assert.doesNotMatch(html, /Understanding —/);
});
```

**Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL (no `Debugging —` in the markup)

**Step 3: Implement**

- `lib/types/report.ts`: add to `feedback`: `not_applicable?: Record<string, "no_failure" | "no_ai_use" | "no_ai_code">;`
- `lib/types/dashboard.ts`: `radar: { name: string; value: number | null }[];`
- `components/report/RadarChart.tsx` label `<text>`: add `opacity={d.value === null ? 0.45 : 1}` and render `{d.value === null ? `${d.label} —` : d.label}`. Update the header comment: "null = not applicable (drawn at the centre, label dimmed)".
- `lib/appContent.ts`, in both `feedback` blocks, add:
  - vi: `naLabel: "Không áp dụng"`, `naReasons: { no_failure: "Code của bạn không phát sinh lỗi nên không có gì để debug.", no_ai_use: "Bạn không dùng Ciel trong lượt này.", no_ai_code: "Ciel không đưa code nào để bạn kiểm chứng." }`
  - en: `naLabel: "Not applicable"`, `naReasons: { no_failure: "Your code never failed, so there was nothing to debug.", no_ai_use: "You didn't use Ciel in this attempt.", no_ai_code: "Ciel gave you no code to verify." }`
- `app/(app)/feedback/FeedbackContent.tsx`, axis bars: when `isNull`, show `tf.naLabel` instead of `-` on the right, and under the dimmed bar add
  ```tsx
  {isNull && report.feedback.not_applicable?.[key] && (
    <p className="mt-1 text-xs text-on-surface-variant/60">{tf.naReasons[report.feedback.not_applicable[key]]}</p>
  )}
  ```
- `app/(app)/dashboard/page.tsx`: `computeRadarPoints(values: (number | null)[])` with `const r = (Math.min(Math.max(v ?? 0, 0), 100) / 100) * maxR;`; in the labels map, look up the axis value (`const v = data?.radar.find((r) => r.name === l.name)?.value;`) and dim + suffix `—` when `v === null`, same as the RadarChart.
- `components/app/WorkspaceLanding.tsx`: pick the weakest axis only among observed ones:
  ```tsx
  const radar = (dashQuery.data?.radar ?? []).filter((r): r is { name: string; value: number } => r.value !== null);
  ```

**Step 4: Verify**

Run: `npm test && npm run build`
Expected: PASS

**Step 5: Manual check** (`npm run dev` against a backend running this branch): a first-try solve without Ciel shows Prompting / Verification / Debugging as "Không áp dụng" with their reason on the Feedback page, dimmed on both radars, and the Workspace "weakest axis" tip ignores them.

**Step 6: Commit**

```bash
git add lib/types/report.ts lib/types/dashboard.ts components/report/RadarChart.tsx "app/(app)/feedback/FeedbackContent.tsx" "app/(app)/dashboard/page.tsx" components/app/WorkspaceLanding.tsx lib/appContent.ts tests/ui.test.cjs
git commit -m "feat(feedback): show not-applicable axes with their reason"
```

---

### Task F4: Wrap-up

1. `npm test && npm run build` → pass.
2. Push `feat/p0-scoring-na` and open a PR to `main` titled `feat(scoring): show not-applicable axes and a generic AI verify note`, linking the backend P0 PR. Note in the description that it is safe to deploy in either order.
