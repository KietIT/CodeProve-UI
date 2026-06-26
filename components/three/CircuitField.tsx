"use client";

import { useMemo } from "react";

/**
 * Animated printed-circuit field: dim copper traces radiating from an origin
 * (the AI sphere) with bright energy pulses flowing outward continuously.
 *
 * Pure SVG — lives BEHIND the WebGL canvas so it never touches the 3D scene's
 * performance. Pulses animate via stroke-dashoffset (cheap, GPU-friendly) and a
 * radial mask fades the field out with distance from the sphere.
 *
 * Geometry is generated deterministically (seeded PRNG + integer coordinates),
 * so server and client render identically — no hydration mismatch.
 */

type Props = {
  originX?: number;
  originY?: number;
  width?: number;
  height?: number;
  count?: number;
  seed?: number;
  idPrefix?: string;
  className?: string;
  opacity?: number;
  fadeRadius?: number; // 0..1 of viewBox, where the field fades to nothing
};

const COLORS = ["#0055ff", "#6ea8ff", "#3ad8ff"];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function CircuitField({
  originX = 900,
  originY = 340,
  width = 1200,
  height = 700,
  count = 18,
  seed = 7,
  idPrefix = "cf",
  className,
  opacity = 1,
  fadeRadius = 0.62,
}: Props) {
  const traces = useMemo(() => {
    const rnd = mulberry32(seed);
    const pad = 24;
    const out: {
      d: string;
      ex: number;
      ey: number;
      color: string;
      dur: string;
      delay: string;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.55;
      const reach = 240 + rnd() * 540;
      const ex = Math.max(
        pad,
        Math.min(width - pad, Math.round(originX + Math.cos(ang) * reach)),
      );
      const ey = Math.max(
        pad,
        Math.min(height - pad, Math.round(originY + Math.sin(ang) * reach)),
      );

      // L-shaped Manhattan route with one bend → printed-circuit look.
      const horizFirst = Math.abs(Math.cos(ang)) >= Math.abs(Math.sin(ang));
      const bf = 0.4 + rnd() * 0.3;
      const d = horizFirst
        ? `M${originX} ${originY} H${Math.round(
            originX + (ex - originX) * bf,
          )} V${ey} H${ex}`
        : `M${originX} ${originY} V${Math.round(
            originY + (ey - originY) * bf,
          )} H${ex} V${ey}`;

      out.push({
        d,
        ex,
        ey,
        color: COLORS[i % 3],
        dur: (2.1 + rnd() * 1.8).toFixed(2),
        delay: (rnd() * 2.8).toFixed(2),
      });
    }
    return out;
  }, [originX, originY, width, height, count, seed]);

  const cx = ((originX / width) * 100).toFixed(2);
  const cy = ((originY / height) * 100).toFixed(2);
  const fade = `${idPrefix}-fade`;
  const mask = `${idPrefix}-mask`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ opacity }}
    >
      <defs>
        <radialGradient id={fade} cx={`${cx}%`} cy={`${cy}%`} r={`${fadeRadius * 100}%`}>
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={mask}>
          <rect width={width} height={height} fill={`url(#${fade})`} />
        </mask>
      </defs>

      <g mask={`url(#${mask})`}>
        {/* Dim etched traces */}
        <g
          fill="none"
          stroke="#5a8bff"
          strokeOpacity="0.16"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {traces.map((t, i) => (
            <path key={`b${i}`} d={t.d} />
          ))}
        </g>

        {/* Flowing energy pulse — single animated layer (perf-friendly) */}
        <g fill="none" strokeLinecap="round" strokeWidth="3.2">
          {traces.map((t, i) => (
            <path
              key={`p${i}`}
              d={t.d}
              stroke={t.color}
              strokeOpacity="0.9"
              pathLength={100}
              strokeDasharray="6 100"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="106"
                to="0"
                dur={`${t.dur}s`}
                begin={`${t.delay}s`}
                repeatCount="indefinite"
              />
            </path>
          ))}
        </g>

        {/* End pads (static — no per-pad animation) */}
        <g>
          {traces.map((t, i) => (
            <g key={`pd${i}`}>
              <circle cx={t.ex} cy={t.ey} r="5.5" fill={t.color} fillOpacity="0.16" />
              <circle cx={t.ex} cy={t.ey} r="2.4" fill="#cfe2ff" />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
