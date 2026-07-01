"use client";

import { useI18n } from "@/lib/i18n";

/**
 * Static, dependency-free fallback for the 3D hero.
 * Shown when: prefers-reduced-motion, no WebGL, low device memory, or while the
 * Canvas chunk is loading. Mirrors the "AI Neural Core": a glowing brain-sphere
 * inside a control gyroscope, framed by the 6-axis rubric ring.
 *
 * All geometry is deterministic so server and client render identically.
 */

const cx = 200;
const cy = 200;

// Round so server (Node) and client (browser) serialise identical strings -
// Math.cos/sin can differ at the last ULP across engines → hydration mismatch.
const r2 = (n: number) => Math.round(n * 100) / 100;

// Neurons on a golden-angle spiral inside the brain sphere.
const neurons = Array.from({ length: 30 }, (_, i) => {
  const r = 68 * Math.sqrt((i + 0.5) / 30);
  const a = i * 2.399963; // golden angle (radians)
  return { x: r2(cx + r * Math.cos(a)), y: r2(cy + r * Math.sin(a)) };
});

// Synapses: link each neuron to its 2 nearest neighbours (deterministic).
const links: [number, number][] = [];
neurons.forEach((p, i) => {
  neurons
    .map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
    .filter((o) => o.j !== i)
    .sort((a, b) => a.d - b.d)
    .slice(0, 2)
    .forEach((o) => {
      if (i < o.j) links.push([i, o.j]);
    });
});

export function HeroPoster() {
  const { t } = useI18n();
  const axes = t.rubric.axes;

  // 6 rubric-axis nodes on a tilted (elliptical) ring → perspective.
  const rx = 142;
  const ry = 86;
  const axisNodes = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return { x: r2(cx + rx * Math.cos(a)), y: r2(cy + ry * Math.sin(a)) };
  });

  return (
    <div className="relative aspect-square w-full max-w-[480px]">
      <div className="hero-glow absolute inset-0 animate-pulse-glow" aria-hidden="true" />
      <svg
        viewBox="0 0 400 400"
        className="relative h-full w-full animate-float"
        role="img"
        aria-label={t.hero.coreLabel}
      >
        <defs>
          <linearGradient id="np-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3ed4c5" />
            <stop offset="55%" stopColor="#2e87f0" />
            <stop offset="100%" stopColor="#6c63ff" />
          </linearGradient>
          <radialGradient id="np-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#aef7ef" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#3ed4c5" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3ed4c5" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer rubric ring (tilted) */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="url(#np-ring)"
          strokeWidth="1.6"
          strokeOpacity="0.65"
        />

        {/* Control gyroscope: 3 nested ellipses */}
        <g stroke="#3ed4c5" fill="none" strokeOpacity="0.5">
          <ellipse cx={cx} cy={cy} rx="108" ry="62" strokeWidth="1.4" />
          <ellipse
            cx={cx}
            cy={cy}
            rx="62"
            ry="108"
            strokeWidth="1.4"
            stroke="#2e87f0"
            transform={`rotate(12 ${cx} ${cy})`}
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx="96"
            ry="96"
            strokeWidth="1.2"
            stroke="#6c63ff"
            strokeOpacity="0.35"
          />
        </g>

        {/* Brain glow + glass shell */}
        <circle cx={cx} cy={cy} r="78" fill="url(#np-core)" />
        <circle
          cx={cx}
          cy={cy}
          r="78"
          fill="none"
          stroke="#3ed4c5"
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* Synapses */}
        <g stroke="#3ed4c5" strokeOpacity="0.22" strokeWidth="0.8">
          {links.map(([a, b], i) => (
            <line
              key={`syn-${i}`}
              x1={neurons[a].x}
              y1={neurons[a].y}
              x2={neurons[b].x}
              y2={neurons[b].y}
            />
          ))}
        </g>

        {/* Neurons */}
        <g>
          {neurons.map((p, i) => (
            <circle key={`n-${i}`} cx={p.x} cy={p.y} r="2.1" fill="#7ee5da" fillOpacity="0.9" />
          ))}
        </g>

        {/* Pulsing AI core */}
        <circle cx={cx} cy={cy} r="13" fill="url(#np-core)" />
        <circle cx={cx} cy={cy} r="5.5" fill="#eafffb" />

        {/* 6 rubric-axis nodes + labels */}
        {axisNodes.map((p, i) => (
          <g key={`axis-${i}`}>
            <circle cx={p.x} cy={p.y} r="10" fill="#3ed4c5" fillOpacity="0.16" />
            <circle cx={p.x} cy={p.y} r="4.5" fill="#aef7ef" />
            <text
              x={p.x}
              y={p.y < cy ? p.y - 14 : p.y + 22}
              textAnchor="middle"
              className="fill-[#93a0b0] font-mono"
              fontSize="9"
            >
              {axes[i].name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
