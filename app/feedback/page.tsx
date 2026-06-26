import type { Metadata } from "next";
import Link from "next/link";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";

export const metadata: Metadata = { title: "Feedback" };

const dims = [
  ["Understanding", 92],
  ["Hypothesis", 78],
  ["Prompting", 88],
  ["Verification", 71],
  ["Testing", 64],
  ["Debugging", 83],
] as const;

const timeline = [
  { time: "Step 1 · Hypothesis", title: "Approach logged before coding", desc: "You proposed a hash-map strategy targeting O(n) before writing any code.", active: true },
  { time: "Step 2 · Implementation", title: "Solution compiled & ran", desc: "All 4 sample tests passed. One duplicate-handling edge case auto-flagged for review.", active: false },
  { time: "Step 3 · Explain-back", title: "Reasoning verified", desc: "Your explanation matched the observed reasoning trace. Integrity check passed.", active: true },
];

// Circular score ring
const R = 44;
const CIRC = 2 * Math.PI * R;
const score = 84;
const offset = CIRC * (1 - score / 100);

export default function FeedbackPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-10 md:px-12">
        <header className="mb-10">
          <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">Assessment report</span>
          <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">Feedback summary</h1>
        </header>

        {/* Score ring + dimensions */}
        <div className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="ice-card relative flex flex-col items-center justify-center overflow-hidden p-10 xl:col-span-5">
            <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-[90px]" />
            <div className="relative flex h-56 w-56 items-center justify-center">
              <svg className="ring-glow absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={R} fill="transparent" stroke="rgb(var(--surface-container-highest))" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r={R} fill="transparent"
                  stroke="rgb(var(--primary))" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={CIRC.toFixed(2)} strokeDashoffset={offset.toFixed(2)}
                />
              </svg>
              <div className="text-center">
                <div className="font-headline-xl text-[60px] leading-none">{score}</div>
                <div className="font-label-mono text-label-mono text-on-surface-variant/70">OUT OF 100</div>
              </div>
            </div>
            <p className="mt-6 font-headline-lg-mobile text-headline-lg-mobile text-primary">Fluency tier: Strong</p>
            <p className="mt-2 max-w-xs text-center text-on-surface-variant">You reason with AI deliberately - top 16% of recent attempts.</p>
          </div>

          <div className="ice-card flex flex-col gap-5 p-8 xl:col-span-7">
            <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">Performance by axis</h3>
            {dims.map(([k, v]) => (
              <div key={k}>
                <div className="mb-2 flex justify-between font-label-mono text-label-mono">
                  <span>{k}</span>
                  <span className="text-primary">{v}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden bg-surface-container-highest">
                  <div className="animate-progress h-full bg-primary" style={{ ["--final-width" as string]: `${v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <section className="mb-10">
          <h3 className="mb-8 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">Process timeline & evidence</h3>
          <div className="relative">
            <div className="absolute bottom-0 left-4 top-0 w-px bg-primary/20" />
            <div className="space-y-8">
              {timeline.map((t) => (
                <div key={t.title} className="relative pl-12">
                  <div className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center border-2 bg-background ${t.active ? "border-primary" : "border-outline-variant"}`}>
                    <span className={`h-2 w-2 ${t.active ? "bg-primary" : "bg-outline-variant"}`} />
                  </div>
                  <div className={`ice-card border-l-2 p-5 ${t.active ? "border-l-primary" : "border-l-outline-variant"}`}>
                    <span className="font-label-mono text-label-mono uppercase text-primary">{t.time}</span>
                    <h4 className="mt-1 font-headline-lg-mobile text-headline-lg-mobile">{t.title}</h4>
                    <p className="mt-1 text-sm text-on-surface-variant">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Strengths + risks */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border border-primary/20 bg-primary/5 p-7">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">What went well</span>
            <h3 className="mb-5 mt-1 font-headline-lg-mobile text-headline-lg-mobile">Strengths</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Sym name="verified" className="mt-0.5 text-primary" />
                <div><p className="font-medium">Clear hypothesis first</p><p className="text-sm text-on-surface-variant">You committed to an approach before prompting.</p></div>
              </li>
              <li className="flex items-start gap-3">
                <Sym name="bolt" className="mt-0.5 text-primary" />
                <div><p className="font-medium">Efficient prompting</p><p className="text-sm text-on-surface-variant">Concise, well-scoped requests to the mentor.</p></div>
              </li>
            </ul>
          </div>
          <div className="border border-error/20 bg-error/5 p-7">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-error">To improve</span>
            <h3 className="mb-5 mt-1 font-headline-lg-mobile text-headline-lg-mobile">Focus areas</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Sym name="science" className="mt-0.5 text-error" />
                <div><p className="font-medium">Test coverage</p><p className="text-sm text-on-surface-variant">Add cases for empty input and duplicates.</p></div>
              </li>
              <li className="flex items-start gap-3">
                <Sym name="visibility" className="mt-0.5 text-error" />
                <div><p className="font-medium">Output verification</p><p className="text-sm text-on-surface-variant">Double-check AI suggestions before accepting.</p></div>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/workspace" className="flex cursor-pointer items-center gap-2 bg-primary px-6 py-3 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90">
            Next challenge <Sym name="arrow_forward" className="text-[16px]" />
          </Link>
          <Link href="/dashboard" className="flex cursor-pointer items-center gap-2 border border-outline-variant/60 px-6 py-3 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary">
            Back to dashboard
          </Link>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
