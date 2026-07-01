"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";
import { getDashboard, type DashboardOut } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { appContent } from "@/lib/appContent";

// 6-axis radar geometry (center 160,160 · maxR 120)
// Axes order: Understanding(top), Hypothesis(top-right), Prompting(bottom-right),
//             Verification(bottom), Testing(bottom-left), Debugging(top-left)
const radarGrid = "160,40 264,100 264,220 160,280 56,220 56,100";

const radarLabels = [
  { name: "Understanding", x: 160, y: 30, anchor: "middle" },
  { name: "Hypothesis", x: 272, y: 100, anchor: "start" },
  { name: "Prompting", x: 272, y: 226, anchor: "start" },
  { name: "Verification", x: 160, y: 298, anchor: "middle" },
  { name: "Testing", x: 48, y: 226, anchor: "end" },
  { name: "Debugging", x: 48, y: 100, anchor: "end" },
];

// Compute radar polygon points from 0..100 values
// angle_i = -90° + i*60° (start at top, clockwise)
function computeRadarPoints(values: number[]): string {
  const cx = 160;
  const cy = 160;
  const maxR = 120;
  return values
    .map((v, i) => {
      const angle = ((-90 + i * 60) * Math.PI) / 180;
      const r = (Math.min(Math.max(v, 0), 100) / 100) * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

// Trend chart constants
const TW = 460;
const TH = 150;
const TP = 12;

function computeTrendPaths(trend: number[]) {
  if (trend.length < 2) {
    const v = trend[0] ?? 0;
    const x = TP;
    const y = TH - TP - (v / 100) * (TH - 2 * TP);
    return { trendLine: `M${x} ${y}`, trendArea: `M${x} ${y} L${x} ${TH - TP} Z`, tpts: [{ x, y }] };
  }
  const tpts = trend.map((v, i) => ({
    x: TP + (i / (trend.length - 1)) * (TW - 2 * TP),
    y: TH - TP - (v / 100) * (TH - 2 * TP),
  }));
  const trendLine = tpts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const trendArea = `${trendLine} L${tpts[tpts.length - 1].x.toFixed(1)} ${TH - TP} L${tpts[0].x.toFixed(1)} ${TH - TP} Z`;
  return { trendLine, trendArea, tpts };
}

export default function DashboardPage() {
  const { locale } = useI18n();
  const t = appContent[locale].dashboard;
  const axesL = appContent[locale].axes as Record<string, string>;
  const recentStatusL = appContent[locale].recentStatus as Record<string, string>;
  const [data, setData] = useState<DashboardOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const isEmpty = !loading && !error && data?.kpis.completed === 0;

  const kpiCards = data
    ? [
        { label: t.kpiCompleted, value: String(data.kpis.completed), delta: t.kpiCompletedDelta, icon: "task_alt" },
        { label: t.kpiStreak, value: String(data.kpis.streak), delta: t.kpiStreakDelta, icon: "local_fire_department" },
        { label: t.kpiAvg, value: data.kpis.avg_score.toFixed(1), delta: t.kpiAvgDelta, icon: "neurology" },
      ]
    : [];

  const radarValues = data?.radar.map((r) => r.value) ?? Array(6).fill(0);
  const radarValuePts = computeRadarPoints(radarValues);
  const radarValueDots = radarValuePts.split(" ");

  const trendData = data?.trend ?? [0];
  const { trendLine, trendArea, tpts } = computeTrendPaths(trendData);

  const trendDelta = trendData.length >= 2
    ? `${trendData[trendData.length - 1] - trendData[0] >= 0 ? "+" : ""}${(trendData[trendData.length - 1] - trendData[0]).toFixed(0)}`
    : "—";

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-10 md:px-12">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
              {t.eyebrow}
            </span>
            <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">
              {t.welcome}
            </h1>
            <p className="mt-3 max-w-md text-on-surface-variant">
              {loading ? t.loadingSub : isEmpty ? t.emptySub : t.readySub}
            </p>
          </div>
        </header>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24 text-on-surface-variant">
            <Sym name="progress_activity" className="mr-3 animate-spin text-[28px] text-primary" />
            {t.loading}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="ice-card p-6 text-error">
            <p>{t.loadFailed}: {error}</p>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="ice-card flex flex-col items-center gap-6 py-20 text-center">
            <Sym name="rocket_launch" className="text-[56px] text-primary/60" />
            <div>
              <p className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{t.emptyTitle}</p>
              <p className="mt-2 text-on-surface-variant">{t.emptyDesc}</p>
            </div>
            <Link
              href="/workspace"
              className="flex items-center gap-2 border border-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10"
            >
              {t.goWorkspace} <Sym name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
        )}

        {/* Main content — only shown when data is loaded and not empty */}
        {!loading && !error && !isEmpty && data && (
          <>
            {/* KPI cards */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {kpiCards.map((k) => (
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
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{t.matrixTitle}</h2>
                    <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">{t.matrixSub}</p>
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
                    <polygon points={radarValuePts} fill="rgb(var(--primary) / 0.18)" stroke="rgb(var(--primary))" strokeWidth="2" />
                    {radarValueDots.map((pt, i) => {
                      const [x, y] = pt.split(",").map(Number);
                      return <circle key={i} cx={x} cy={y} r="3.5" fill="rgb(var(--primary))" />;
                    })}
                    {radarLabels.map((l) => (
                      <text key={l.name} x={l.x} y={l.y} textAnchor={l.anchor as "start" | "middle" | "end"} className="fill-on-surface-variant font-label-mono" fontSize="10">
                        {axesL[l.name] ?? l.name}
                      </text>
                    ))}
                  </svg>
                </div>
              </section>

              <section className="ice-card flex flex-col p-6 xl:col-span-5">
                <div className="mb-4 flex items-center justify-between border-b border-outline-variant/50 pb-4">
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{t.recentTitle}</h2>
                  <span className="font-label-mono text-label-mono text-on-surface-variant/60">{t.recentLast}</span>
                </div>
                <div className="flex flex-col divide-y divide-outline-variant/40">
                  {data.recent.map((a, idx) => (
                    <div key={idx} className="group flex items-center justify-between py-3.5">
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
                        <div className={`font-label-mono text-label-mono ${a.ok ? "text-primary" : "text-error"}`}>{recentStatusL[a.status] ?? a.status}</div>
                        <div className="font-label-mono text-label-mono text-on-surface-variant/60">
                          {a.score !== null ? `${a.score.toFixed(0)} ${t.pts}` : "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/workspace"
                  className="mt-auto flex items-center justify-center gap-2 border border-outline-variant/60 py-2.5 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  {t.viewAll} <Sym name="arrow_forward" className="text-[16px]" />
                </Link>
              </section>
            </div>

            {/* Trend + dimensions */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <section className="ice-card p-6 xl:col-span-7">
                <div className="mb-6 flex items-center justify-between border-b border-outline-variant/50 pb-4">
                  <div>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{t.trendTitle}</h2>
                    <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">{t.trendSub}</p>
                  </div>
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">{trendDelta}</span>
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
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{t.byAxisTitle}</h2>
                  <Sym name="bar_chart" className="text-primary" />
                </div>
                <div className="space-y-4">
                  {data.radar.map((a) => (
                    <div key={a.name}>
                      <div className="mb-1.5 flex justify-between font-label-mono text-label-mono">
                        <span className="text-on-surface-variant">{axesL[a.name] ?? a.name}</span>
                        <span className="text-primary">{a.value.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden bg-surface-container-highest">
                        <div className="animate-progress h-full bg-primary" style={{ ["--final-width" as string]: `${a.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
