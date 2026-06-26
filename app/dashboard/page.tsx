import type { Metadata } from "next";
import Link from "next/link";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";

export const metadata: Metadata = { title: "Dashboard" };

const kpis = [
  { label: "Completed exercises", value: "124", delta: "+12 this week", icon: "task_alt" },
  { label: "Day streak", value: "18", delta: "days active", icon: "local_fire_department" },
  { label: "Avg fluency score", value: "84.2", delta: "out of 100", icon: "neurology" },
];

const axes = [
  { name: "Understanding", v: 85 },
  { name: "Hypothesis", v: 72 },
  { name: "Prompting", v: 90 },
  { name: "Verification", v: 68 },
  { name: "Testing", v: 62 },
  { name: "Debugging", v: 80 },
];

const activity = [
  { title: "Two-Sum Variations", meta: "2h ago · Algorithms", status: "PASSED", xp: "+120 XP", ok: true },
  { title: "Binary Search Debugging", meta: "5h ago · Debugging", status: "PASSED", xp: "+90 XP", ok: true },
  { title: "Async Race Condition", meta: "1d ago · Concurrency", status: "FAILED", xp: "0 XP", ok: false },
  { title: "Prompt Injection Audit", meta: "2d ago · Security", status: "PASSED", xp: "+200 XP", ok: true },
];

// 6-axis radar geometry (center 160,160 · maxR 120)
const radarGrid = "160,40 264,100 264,220 160,280 56,220 56,100";
const radarValue = "160,58 235,117 254,214 160,242 96,197 77,112";
const radarLabels = [
  { name: "Understanding", x: 160, y: 30, anchor: "middle" },
  { name: "Hypothesis", x: 272, y: 100, anchor: "start" },
  { name: "Prompting", x: 272, y: 226, anchor: "start" },
  { name: "Verification", x: 160, y: 298, anchor: "middle" },
  { name: "Testing", x: 48, y: 226, anchor: "end" },
  { name: "Debugging", x: 48, y: 100, anchor: "end" },
];

// Fluency trend area chart
const trend = [62, 68, 65, 74, 79, 82, 88, 92];
const TW = 460;
const TH = 150;
const TP = 12;
const tpts = trend.map((v, i) => ({
  x: TP + (i / (trend.length - 1)) * (TW - 2 * TP),
  y: TH - TP - (v / 100) * (TH - 2 * TP),
}));
const trendLine = tpts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
const trendArea = `${trendLine} L${tpts[tpts.length - 1].x.toFixed(1)} ${TH - TP} L${tpts[0].x.toFixed(1)} ${TH - TP} Z`;

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-10 md:px-12">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
              System Overview
            </span>
            <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">
              Welcome back
            </h1>
            <p className="mt-3 max-w-md text-on-surface-variant">
              Your AI-fluency is trending up - <span className="text-primary">+8 points</span> over the last 4 weeks.
            </p>
          </div>
        </header>

        {/* KPI cards */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {kpis.map((k) => (
            <div key={k.label} className="ice-card p-6">
              <div className="flex items-start justify-between">
                <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">{k.label}</span>
                <Sym name={k.icon} className="text-[22px] text-primary" />
              </div>
              <div className="mt-4 font-headline-xl text-[44px] leading-none">{k.value}</div>
              <div className="mt-2 font-label-mono text-label-mono text-on-surface-variant/70">{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Radar + activity */}
        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="ice-card p-6 xl:col-span-7">
            <div className="mb-6 flex items-center justify-between border-b border-outline-variant/50 pb-4">
              <div>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile">Skill competency matrix</h2>
                <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">6-axis AI-fluency profile</p>
              </div>
              <Sym name="radar" className="text-primary" />
            </div>
            <div className="flex items-center justify-center py-2">
              <svg viewBox="-44 -6 408 332" className="h-auto w-full max-w-[380px]">
                {[1, 0.66, 0.33].map((s) => (
                  <polygon
                    key={s}
                    points={radarGrid
                      .split(" ")
                      .map((pt) => {
                        const [x, y] = pt.split(",").map(Number);
                        return `${160 + (x - 160) * s},${160 + (y - 160) * s}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="rgb(var(--outline-variant))"
                    strokeWidth="1"
                  />
                ))}
                {radarGrid.split(" ").map((pt, i) => {
                  const [x, y] = pt.split(",").map(Number);
                  return <line key={i} x1="160" y1="160" x2={x} y2={y} stroke="rgb(var(--outline-variant))" strokeWidth="1" />;
                })}
                <polygon points={radarValue} fill="rgb(var(--primary) / 0.18)" stroke="rgb(var(--primary))" strokeWidth="2" />
                {radarValue.split(" ").map((pt, i) => {
                  const [x, y] = pt.split(",").map(Number);
                  return <circle key={i} cx={x} cy={y} r="3.5" fill="rgb(var(--primary))" />;
                })}
                {radarLabels.map((l) => (
                  <text key={l.name} x={l.x} y={l.y} textAnchor={l.anchor as "start" | "middle" | "end"} className="fill-on-surface-variant font-label-mono" fontSize="10">
                    {l.name}
                  </text>
                ))}
              </svg>
            </div>
          </section>

          <section className="ice-card flex flex-col p-6 xl:col-span-5">
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant/50 pb-4">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile">Recent attempts</h2>
              <span className="font-label-mono text-label-mono text-on-surface-variant/60">LAST 7 DAYS</span>
            </div>
            <div className="flex flex-col divide-y divide-outline-variant/40">
              {activity.map((a) => (
                <div key={a.title} className="group flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center ${a.ok ? "bg-primary/10 text-primary" : "bg-error/10 text-error"}`}>
                      <Sym name={a.ok ? "check" : "close"} className="text-[18px]" />
                    </span>
                    <div>
                      <div className="font-medium text-on-surface">{a.title}</div>
                      <div className="font-label-mono text-label-mono text-on-surface-variant/70">{a.meta}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-label-mono text-label-mono ${a.ok ? "text-primary" : "text-error"}`}>{a.status}</div>
                    <div className="font-label-mono text-label-mono text-on-surface-variant/60">{a.xp}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/workspace"
              className="mt-auto flex items-center justify-center gap-2 border border-outline-variant/60 py-2.5 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
            >
              View all activity <Sym name="arrow_forward" className="text-[16px]" />
            </Link>
          </section>
        </div>

        {/* Trend + dimensions */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="ice-card p-6 xl:col-span-7">
            <div className="mb-6 flex items-center justify-between border-b border-outline-variant/50 pb-4">
              <div>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile">Fluency trend</h2>
                <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">Score over the last 8 weeks</p>
              </div>
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">+30</span>
            </div>
            <svg viewBox={`0 0 ${TW} ${TH}`} className="h-auto w-full">
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((g) => (
                <line key={g} x1={TP} x2={TW - TP} y1={TP + g * (TH - 2 * TP)} y2={TP + g * (TH - 2 * TP)} stroke="rgb(var(--outline-variant))" strokeWidth="1" strokeOpacity="0.4" />
              ))}
              <path d={trendArea} fill="url(#trendFill)" />
              <path d={trendLine} fill="none" stroke="rgb(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {tpts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="rgb(var(--background))" stroke="rgb(var(--primary))" strokeWidth="2" />
              ))}
            </svg>
          </section>

          <section className="ice-card p-6 xl:col-span-5">
            <div className="mb-6 flex items-center justify-between border-b border-outline-variant/50 pb-4">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile">Performance by axis</h2>
              <Sym name="bar_chart" className="text-primary" />
            </div>
            <div className="space-y-4">
              {axes.map((a) => (
                <div key={a.name}>
                  <div className="mb-1.5 flex justify-between font-label-mono text-label-mono">
                    <span className="text-on-surface-variant">{a.name}</span>
                    <span className="text-primary">{a.v}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden bg-surface-container-highest">
                    <div className="animate-progress h-full bg-primary" style={{ ["--final-width" as string]: `${a.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
