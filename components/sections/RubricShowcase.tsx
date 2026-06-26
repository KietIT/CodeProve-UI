"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

export function RubricShowcase() {
  const { t } = useI18n();
  const axes = t.rubric.axes;
  const [active, setActive] = useState<number | null>(null);

  // Radar geometry
  const cx = 160;
  const cy = 160;
  const maxR = 120;
  const maxWeight = 0.25;
  const verts = axes.map((ax, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const wr = (parseFloat(ax.weight) / maxWeight) * maxR;
    return {
      ax: { x: cx + maxR * Math.cos(a), y: cy + maxR * Math.sin(a) },
      wt: { x: cx + wr * Math.cos(a), y: cy + wr * Math.sin(a) },
    };
  });
  const weightPath =
    verts.map((v, i) => `${i === 0 ? "M" : "L"}${v.wt.x} ${v.wt.y}`).join(" ") + " Z";

  return (
    <section id="criteria" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t.rubric.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {t.rubric.sub}
          </p>
          <code className="mt-5 inline-block rounded-pill border border-border bg-surface/60 px-4 py-2 font-mono text-sm text-teal">
            {t.rubric.formula}
          </code>
        </Reveal>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* Radar */}
          <Reveal className="flex justify-center">
            <svg viewBox="0 0 320 320" className="h-auto w-full max-w-[340px]">
              {[0.33, 0.66, 1].map((s) => (
                <polygon
                  key={s}
                  points={verts
                    .map((v) => `${cx + (v.ax.x - cx) * s},${cy + (v.ax.y - cy) * s}`)
                    .join(" ")}
                  fill="none"
                  stroke="rgb(48 57 70)"
                  strokeWidth="1"
                />
              ))}
              {verts.map((v, i) => (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={v.ax.x}
                  y2={v.ax.y}
                  stroke="rgb(48 57 70)"
                  strokeWidth="1"
                />
              ))}

              <path d={weightPath} fill="rgba(62,212,197,0.16)" stroke="#3ed4c5" strokeWidth="1.5" />

              {verts.map((v, i) => {
                const isActive = active === i;
                return (
                  <g key={i}>
                    <circle
                      cx={v.wt.x}
                      cy={v.wt.y}
                      r={isActive ? 7 : 4.5}
                      fill={isActive ? "#aef7ef" : "#3ed4c5"}
                      className="transition-all duration-200"
                    />
                    {isActive && (
                      <circle cx={v.wt.x} cy={v.wt.y} r="12" fill="#3ed4c5" opacity="0.2" />
                    )}
                    <text
                      x={v.ax.x}
                      y={v.ax.y + (v.ax.y < cy ? -10 : 18)}
                      textAnchor="middle"
                      className={`font-mono ${isActive ? "fill-teal" : "fill-[#93a0b0]"}`}
                      fontSize="10"
                    >
                      {axes[i].name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </Reveal>

          {/* Axis cards */}
          <Reveal>
            <ul className="grid gap-3 sm:grid-cols-2">
              {axes.map((ax, i) => (
                <li
                  key={ax.name}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className={`group cursor-default rounded-card border bg-surface/60 p-5 transition-colors duration-200 ${
                    active === i ? "border-teal/60" : "border-border hover:border-teal/40"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-content">{ax.name}</h3>
                    <span className="font-mono text-xs text-teal">w {ax.weight}</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-bg">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal to-glowblue transition-all duration-300"
                      style={{ width: `${(parseFloat(ax.weight) / 0.25) * 100}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{ax.desc}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
